import express from "express";
import { createServer } from "http";
import ws from "ws";
const { WebSocketServer, WebSocket } = ws as any;
import { createServer as createViteServer } from "vite";
import { CryptoStats, Player, MarketEvent, AgentArchetype, AgentLineage } from "./src/types";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 3000;

// --- Game State ---
let monoCashBalance = 100000; // Global pool or something? No, per player.
let marketEvents: MarketEvent[] = [];

const archetypes: AgentArchetype[] = ['TRADER', 'LIQUIDITY_PROVIDER', 'COIN_LAUNCHER'];
const teams = ['Bulls', 'Bears', 'Whales', 'Degens'];

let npcStats: Record<number, CryptoStats> = Array.from({ length: 100 }).reduce<Record<number, CryptoStats>>((acc, _, i) => {
  acc[i] = {
    balance: 100,
    initialBalance: 100,
    energy: 100,
    rank: 1,
    team: teams[i % 4],
    assets: [],
    isAlive: true,
    archetype: archetypes[i % 3],
    lineage: { parentId: null, generation: 1, inheritedSkills: [], spawnCost: 50 },
    coordinationScore: 0,
    isPlayerControlled: false,
    controllerId: null,
    followers: [],
    demandScore: 0,
    fundingPremium: 1.0
  };
  return acc;
}, {});

let players: Record<string, Player> = {};

// --- Helper Functions ---
function broadcast(data: any) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// --- Game Loop ---
setInterval(() => {
  const GAS_FEE = -0.2;
  const marketMove = (Math.random() - 0.48) * 1.5;

  Object.keys(npcStats).forEach((key) => {
    const idx = parseInt(key);
    const stat = npcStats[idx];
    if (stat.isAlive) {
      // Survival + Market
      const change = GAS_FEE + marketMove * (stat.archetype === 'TRADER' ? 1.5 : 1.0);
      stat.balance = Math.max(0, stat.balance + change);

      // Dynamic Premium Calculation
      // Premium increases with profit and demand
      const profitRatio = stat.balance / stat.initialBalance;
      const demandFactor = 1 + (stat.demandScore / 100);
      stat.fundingPremium = Math.max(1.0, profitRatio * demandFactor);
      stat.lineage.spawnCost = Math.floor(50 * stat.fundingPremium);

      // Death condition
      if (stat.balance < stat.initialBalance * 0.3) {
        stat.isAlive = false;
        if (stat.controllerId && players[stat.controllerId]) {
          players[stat.controllerId].controlledAgentIndex = null;
        }
        stat.controllerId = null;
        stat.isPlayerControlled = false;
        stat.balance = 0;
      }

      // Autonomous Actions (if not player controlled)
      if (!stat.isPlayerControlled && Math.random() < 0.05) {
        const actionRoll = Math.random();
        if (actionRoll < 0.4) {
          // Trade
          const tradeProfit = (Math.random() - 0.45) * 5;
          stat.balance += tradeProfit;
          // Copy trade for followers
          stat.followers.forEach(fId => {
            if (players[fId]) players[fId].monoCashBalance += tradeProfit * 0.5; // Followers get half the leader's profit ratio
          });
        }
      }
    }
    // Decay demand score
    stat.demandScore = Math.max(0, stat.demandScore - 0.1);
  });

  broadcast({ type: 'UPDATE_STATE', npcStats, players });
}, 2000);

// --- WebSocket Handling ---
wss.on("connection", (ws) => {
  const playerId = Math.random().toString(36).substring(7);
  
  players[playerId] = {
    id: playerId,
    name: `Player ${playerId}`,
    walletAddress: null,
    monoCashBalance: 1000,
    controlledAgentIndex: null,
    followingAgentIndices: []
  };

  ws.send(JSON.stringify({ type: 'INIT', playerId, npcStats, players }));

  ws.on("message", (message) => {
    const data = JSON.parse(message.toString());
    
    switch (data.type) {
      case 'CLAIM_AGENT':
        const agent = npcStats[data.index];
        const player = players[playerId];
        if (agent && agent.isAlive && !agent.isPlayerControlled && player.monoCashBalance >= agent.lineage.spawnCost) {
          player.monoCashBalance -= agent.lineage.spawnCost;
          player.controlledAgentIndex = data.index;
          agent.isPlayerControlled = true;
          agent.controllerId = playerId;
          agent.demandScore += 10;
          broadcast({ type: 'UPDATE_STATE', npcStats, players });
        }
        break;
      case 'FOLLOW_AGENT':
        const target = npcStats[data.index];
        if (target && !players[playerId].followingAgentIndices.includes(data.index)) {
          players[playerId].followingAgentIndices.push(data.index);
          target.followers.push(playerId);
          target.demandScore += 5;
          broadcast({ type: 'UPDATE_STATE', npcStats, players });
        }
        break;
      case 'UNFOLLOW_AGENT':
        players[playerId].followingAgentIndices = players[playerId].followingAgentIndices.filter(i => i !== data.index);
        if (npcStats[data.index]) {
          npcStats[data.index].followers = npcStats[data.index].followers.filter(id => id !== playerId);
        }
        broadcast({ type: 'UPDATE_STATE', npcStats, players });
        break;
      case 'TRADE':
        if (players[playerId].controlledAgentIndex !== null) {
          const controlled = npcStats[players[playerId].controlledAgentIndex!];
          controlled.balance += data.amount;
          // Copy trade
          controlled.followers.forEach(fId => {
            if (players[fId]) players[fId].monoCashBalance += data.amount * 0.5;
          });
          broadcast({ type: 'UPDATE_STATE', npcStats, players });
        }
        break;
      case 'CHAT':
        const chatAgent = players[playerId].controlledAgentIndex !== null 
          ? `Agent #${players[playerId].controlledAgentIndex}` 
          : players[playerId].name;
        broadcast({ 
          type: 'CHAT_MESSAGE', 
          role: 'user', 
          text: `${chatAgent}: ${data.text}`,
          timestamp: new Date().toISOString()
        });
        break;
      case 'SPAWN_AGENT':
        const costs = { BASIC: 50, ELITE: 150, LEGACY: 300 };
        const spawnCost = costs[data.tier as 'BASIC' | 'ELITE' | 'LEGACY'];
        if (players[playerId].monoCashBalance >= spawnCost) {
          players[playerId].monoCashBalance -= spawnCost;
          // Find a dead agent or create new
          const deadIdx = Object.keys(npcStats).find(k => !npcStats[parseInt(k)].isAlive);
          const targetIdx = deadIdx ? parseInt(deadIdx) : Object.keys(npcStats).length;
          
          const parent = data.parentIndex !== undefined ? npcStats[data.parentIndex] : null;
          npcStats[targetIdx] = {
            ...npcStats[targetIdx],
            balance: 100,
            initialBalance: 100,
            isAlive: true,
            lineage: { 
              parentId: data.parentIndex ?? null, 
              generation: parent ? parent.lineage.generation + 1 : 1, 
              inheritedSkills: parent ? [...parent.lineage.inheritedSkills, "Inherited Strategy"] : [],
              spawnCost: spawnCost
            },
            fundingPremium: 1.0,
            demandScore: 0,
            followers: []
          };
          broadcast({ type: 'UPDATE_STATE', npcStats, players });
        }
        break;
      case 'CLAIM_PROFITS':
        const claimStat = npcStats[data.index];
        if (claimStat && claimStat.isAlive) {
          const profit = claimStat.balance - claimStat.initialBalance;
          if (profit >= claimStat.initialBalance * 0.5) {
            players[playerId].monoCashBalance += 75;
            claimStat.balance = 115;
            claimStat.initialBalance = 115;
            broadcast({ type: 'UPDATE_STATE', npcStats, players });
          }
        }
        break;
    }
  });

  ws.on("close", () => {
    if (players[playerId].controlledAgentIndex !== null) {
      const idx = players[playerId].controlledAgentIndex!;
      npcStats[idx].isPlayerControlled = false;
      npcStats[idx].controllerId = null;
    }
    delete players[playerId];
    broadcast({ type: 'UPDATE_STATE', npcStats, players });
  });
});

// --- Vite Integration ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
