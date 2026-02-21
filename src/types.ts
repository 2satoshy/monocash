
export interface PerformanceStats {
  fps: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  entities: number;
}

export interface BoidsParams {
  speed: number;
  separationRadius: number;
  separationStrength: number;
  alignmentRadius: number;
  cohesionRadius: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export type AgentArchetype = 'TRADER' | 'LIQUIDITY_PROVIDER' | 'COIN_LAUNCHER';

export interface AgentLineage {
  parentId: number | null;
  generation: number;
  inheritedSkills: string[];
  spawnCost: number;
}

export interface CryptoStats {
  balance: number; // In $MONOCASH
  initialBalance: number;
  energy: number; // 0-100
  rank: number;
  team: string;
  assets: string[];
  isAlive: boolean;
  archetype: AgentArchetype;
  lineage: AgentLineage;
  coordinationScore: number;
  // Multiplayer & Copy Trading
  isPlayerControlled: boolean;
  controllerId: string | null;
  followers: string[]; // IDs of players/agents following
  demandScore: number; // Based on clicks/investments
  fundingPremium: number; // Dynamic cost multiplier
}

export interface Player {
  id: string;
  name: string;
  walletAddress: string | null;
  monoCashBalance: number;
  controlledAgentIndex: number | null;
  followingAgentIndices: number[];
}

export interface MarketEvent {
  id: string;
  type: 'PUMP_AND_DUMP' | 'HACK' | 'FORK' | 'AIRDROP';
  impact: number; // multiplier or flat amount
  description: string;
  timestamp: number;
}

export interface Tile {
  id: string;
  type: 'ASSET' | 'DEFI' | 'RANK_UP' | 'CHANCE' | 'GO';
  name: string;
  position: { x: number; z: number };
  color: string;
  description: string;
}

export interface CharacterState {
  currentAction: string;
  isThinking: boolean;
  aiResponse: string;
  isDebugOpen: boolean;
  instanceCount: number;
  worldSize: number;
  boidsParams: BoidsParams;
  debugPositions: Float32Array | null;
  debugStates: Float32Array | null;    // vec4 stride: .w = AgentBehavior per instance
  activeEncounter: ActiveEncounter | null;
  selectedNpcIndex: number | null;    // NPC explicitly clicked in the scene
  selectedPosition: { x: number; y: number } | null; // Screen coordinates for selected bubble
  hoveredNpcIndex: number | null;     // NPC currently under the cursor
  hoverPosition: { x: number; y: number } | null; // Screen coordinates for hover bubble
  isChatting: boolean;
  isMovingToChat: boolean;
  chatMessages: ChatMessage[];

  // Crypto specific state
  walletAddress: string | null;
  isWalletConnecting: boolean;
  monoCashBalance: number; // Human's $MONOCASH
  playerStats: CryptoStats;
  npcStats: Record<number, CryptoStats>;
  tiles: Tile[];
  leaderboard: { name: string; balance: number; rank: number; generation: number }[];
  marketEvents: MarketEvent[];

  // Multiplayer specific
  players: Record<string, Player>;
  localPlayerId: string | null;
  
  performance: PerformanceStats;

  setAnimation: (name: string) => void;
  setThinking: (isThinking: boolean) => void;
  setAIResponse: (response: string) => void;
  toggleDebug: () => void;
  setInstanceCount: (count: number) => void;
  setWorldSize: (size: number) => void;
  setBoidsParams: (params: Partial<BoidsParams>) => void;
  setDebugPositions: (positions: Float32Array) => void;
  setDebugStates: (states: Float32Array) => void;
  setActiveEncounter: (encounter: ActiveEncounter | null) => void;
  setSelectedNpc: (index: number | null) => void;
  setSelectedPosition: (pos: { x: number; y: number } | null) => void;
  setHoveredNpc: (index: number | null, pos: { x: number; y: number } | null) => void;
  startChat: (index: number) => void;
  endChat: () => void;
  sendMessage: (text: string) => Promise<void>;
  updatePerformance: (stats: PerformanceStats) => void;
  tickSurvival: () => void;
  initSocket: () => void;
  setWalletAddress: (address: string | null) => void;

  // Crypto actions
  connectWallet: () => Promise<void>;
  updateBalance: (index: number, amount: number) => void;
  tradeAsset: (index: number, asset: string) => void;
  spawnAgent: (tier: 'BASIC' | 'ELITE' | 'LEGACY', parentIndex?: number) => void;
  claimProfits: (index: number) => void;
  
  // Multiplayer actions
  claimAgent: (index: number) => void;
  followAgent: (index: number) => void;
  unfollowAgent: (index: number) => void;
}

export enum AnimationName {
  IDLE = 'Idle',
  WALK = 'Walk'
}

/** Stored as a float in the GPU agent buffer (.w component). */
export enum AgentBehavior {
  BOIDS = 0,   // follows Reynolds separation
  FROZEN = 1,  // position locked, velocity zero
  GOTO = 2,    // moves toward waypoint (.x/.z of agent buffer)
  DEAD = 3,    // agent is inactive
}

export interface ActiveEncounter {
  npcIndex: number;
  npcDepartment: string;
  npcRole: string;
  npcMission: string;
  npcPersonality: string;
}
