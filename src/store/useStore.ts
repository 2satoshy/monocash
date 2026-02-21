import { create } from 'zustand';
import { CharacterState, AnimationName, PerformanceStats, BoidsParams, ActiveEncounter, CryptoStats, Player } from '../types';
import { BrowserProvider } from 'ethers';

let socket: WebSocket | null = null;

export const useStore = create<CharacterState>()(
  (set, get) => ({
    currentAction: AnimationName.WALK,
    isThinking: false,
    aiResponse: "Hello! I'm your AI character. Type something to talk to me.",
    isDebugOpen: false,
    instanceCount: 100,
    worldSize: 25,      // radius of Kaldera

    // Default Boids Parameters
    boidsParams: {
      speed: 0.025,
      separationRadius: 0.6,
      separationStrength: 0.030,
      alignmentRadius: 3.0,
      cohesionRadius: 3.0
    },

    debugPositions: null,
    debugStates: null,
    activeEncounter: null,
    selectedNpcIndex: null,
    selectedPosition: null,
    hoveredNpcIndex: null,
    hoverPosition: null,
    isChatting: false,
    isMovingToChat: false,
    chatMessages: [],

    // Crypto specific state
    walletAddress: null as string | null,
    isWalletConnecting: false,
    monoCashBalance: 0, 
    playerStats: {
      balance: 0,
      initialBalance: 100,
      energy: 100,
      rank: 1,
      team: 'Bulls',
      assets: [],
      isAlive: false,
      archetype: 'TRADER',
      lineage: { parentId: null, generation: 1, inheritedSkills: [], spawnCost: 50 },
      coordinationScore: 0,
      isPlayerControlled: false,
      controllerId: null,
      followers: [],
      demandScore: 0,
      fundingPremium: 1.0
    },
    npcStats: {},
    tiles: [],
    leaderboard: [],
    marketEvents: [],

    // Multiplayer specific
    players: {},
    localPlayerId: null,

    performance: {
      fps: 0,
      drawCalls: 0,
      triangles: 0,
      geometries: 0,
      textures: 0,
      entities: 0
    },

    setAnimation: (name: string) => set({ currentAction: name }),
    setThinking: (isThinking: boolean) => set({ isThinking }),
    setAIResponse: (aiResponse: string) => set({ aiResponse }),
    toggleDebug: () => set((state) => ({ isDebugOpen: !state.isDebugOpen })),
    setInstanceCount: (count: number) => set({ instanceCount: count }),
    setWorldSize: (size: number) => set({ worldSize: size }),

    setBoidsParams: (params) => set((state) => ({
      boidsParams: { ...state.boidsParams, ...params }
    })),

    setDebugPositions: (positions) => set({ debugPositions: positions }),
    setDebugStates: (states) => set({ debugStates: states }),
    setActiveEncounter: (encounter: ActiveEncounter | null) => set({ activeEncounter: encounter }),
    setSelectedNpc: (index: number | null) => set({ selectedNpcIndex: index, selectedPosition: null }),
    setSelectedPosition: (pos: { x: number; y: number } | null) => set({ selectedPosition: pos }),
    setHoveredNpc: (index: number | null, pos: { x: number; y: number } | null) => set({ hoveredNpcIndex: index, hoverPosition: pos }),
    startChat: () => {},
    endChat: () => {},
    sendMessage: async (text: string) => {
      socket?.send(JSON.stringify({ type: 'CHAT', text }));
    },

    updatePerformance: (performance: PerformanceStats) => set({ performance }),
    
    setWalletAddress: (address: string | null) => set({ walletAddress: address }),

    connectWallet: async () => {
      if (get().isWalletConnecting) return;
      set({ isWalletConnecting: true });
      try {
        if (!(window as any).ethereum) {
          throw new Error('MetaMask not found');
        }
        const provider = new BrowserProvider((window as any).ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          set({ walletAddress: accounts[0] });
        }
      } catch (error: any) {
        console.error("Failed to connect to MetaMask:", error);
        alert(`Failed to connect to MetaMask: ${error.message || 'Unknown error'}`);
      } finally {
        set({ isWalletConnecting: false });
      }
    },

    // Multiplayer Socket Logic
    initSocket: () => {
      if (socket) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      socket = new WebSocket(`${protocol}//${window.location.host}`);

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'INIT':
            set({ 
              localPlayerId: data.playerId, 
              npcStats: data.npcStats, 
              players: data.players,
              monoCashBalance: data.players[data.playerId].monoCashBalance
            });
            break;
          case 'UPDATE_STATE':
            const localPlayer = data.players[get().localPlayerId!];
            set({ 
              npcStats: data.npcStats, 
              players: data.players,
              monoCashBalance: localPlayer ? localPlayer.monoCashBalance : get().monoCashBalance,
              playerStats: localPlayer && localPlayer.controlledAgentIndex !== null 
                ? data.npcStats[localPlayer.controlledAgentIndex] 
                : get().playerStats
            });
            break;
          case 'CHAT_MESSAGE':
            set((state) => ({
              chatMessages: [...state.chatMessages, { role: data.role, text: data.text, timestamp: data.timestamp }]
            }));
            break;
        }
      };
    },

    claimAgent: (index: number) => {
      socket?.send(JSON.stringify({ type: 'CLAIM_AGENT', index }));
    },

    followAgent: (index: number) => {
      socket?.send(JSON.stringify({ type: 'FOLLOW_AGENT', index }));
    },

    unfollowAgent: (index: number) => {
      socket?.send(JSON.stringify({ type: 'UNFOLLOW_AGENT', index }));
    },

    tickSurvival: () => {
      // Logic moved to server, but we can keep the local tick for visual smoothness if needed
      // For now, we rely on server updates
    },

    spawnAgent: (tier, parentIndex) => {
      // This will be handled by a server message in a real implementation
      // For now, let's just send a generic action
      socket?.send(JSON.stringify({ type: 'SPAWN_AGENT', tier, parentIndex }));
    },

    claimProfits: (index) => {
      socket?.send(JSON.stringify({ type: 'CLAIM_PROFITS', index }));
    },

    updateBalance: (index, amount) => {
      socket?.send(JSON.stringify({ type: 'TRADE', index, amount }));
    },

    tradeAsset: (index, asset) => {
      socket?.send(JSON.stringify({ type: 'TRADE_ASSET', index, asset }));
    },
  })
);
