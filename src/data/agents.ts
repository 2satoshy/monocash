// ─────────────────────────────────────────────────────────────
//  Corporate config
// ─────────────────────────────────────────────────────────────
export const COMPANY_NAME = 'FakeClaw Inc.';
export const PLAYER_INDEX = 0;
export const NPC_START_INDEX = 1;
export const TOTAL_COUNT = 100;
export const NPC_COUNT = TOTAL_COUNT - 1; // 99

// ─────────────────────────────────────────────────────────────
//  Agent data types
// ─────────────────────────────────────────────────────────────
export interface AgentData {
  index: number;
  department: string;
  role: string;
  expertise: string[];
  mission: string;
  personality: string;
  isPlayer: boolean;
  color: string;
}

// ─────────────────────────────────────────────────────────────
//  Crypto Teams & Roles
// ─────────────────────────────────────────────────────────────

interface TeamConfig {
  name: string;
  color: string;
  roles: string[];
  expertise: string[][];
  missions: string[];
}

const TEAMS: TeamConfig[] = [
  {
    name: 'Bulls',
    color: '#22c55e', // Emerald/Green
    roles: [
      'Whale Trader',
      'Momentum Scalper',
      'HODL Strategist',
      'Leverage Master',
      'Alpha Hunter',
      'Liquidity Provider',
      'Yield Farmer',
      'Arbitrageur',
      'Market Maker',
      'Trend Follower'
    ],
    expertise: [
      ['Technical Analysis', 'Order Flow', 'Macro'],
      ['Scalping', 'High Frequency', 'Execution'],
      ['Long-term Value', 'Risk Management', 'Cold Storage'],
      ['Perpetuals', 'Options', 'Margin'],
      ['On-chain Data', 'Social Sentiment', 'Early Access'],
      ['Uniswap V3', 'Concentrated Liquidity', 'IL Management'],
      ['Staking', 'Lending Protocols', 'Auto-compounders'],
      ['Cross-exchange', 'MEV', 'Flash Loans'],
      ['Bid-Ask Spread', 'Depth', 'Inventory Management'],
      ['Moving Averages', 'RSI', 'Fibonacci']
    ],
    missions: [
      'Accumulate 100 BTC before the next halving',
      'Maintain a 70% win rate on 10x leverage',
      'Maximize yield on the ETH/USDC pair',
      'Execute a risk-free arbitrage between Binance and Coinbase',
      'Identify the next 100x memecoin on Solana',
      'Provide $1M in liquidity to the Aave pool',
      'Hedge the portfolio against a 20% market drop',
      'Front-run a major whale transaction using MEV',
      'Build a diversified portfolio of Layer 1 tokens',
      'Master the art of delta-neutral trading'
    ]
  },
  {
    name: 'Bears',
    color: '#ef4444', // Red
    roles: [
      'Short Seller',
      'Hedging Expert',
      'FUD Analyst',
      'Macro Economist',
      'Risk Officer',
      'Compliance Lead',
      'Stablecoin Maximizer',
      'Audit Specialist',
      'Governance Voter',
      'Insurance Underwriter'
    ],
    expertise: [
      ['Shorting', 'Put Options', 'Inverse ETFs'],
      ['Portfolio Protection', 'Correlation', 'Beta'],
      ['Market Sentiment', 'News Analysis', 'Psychology'],
      ['Interest Rates', 'Inflation', 'Global Markets'],
      ['Liquidation Risk', 'Counterparty Risk', 'VaR'],
      ['KYC/AML', 'Regulatory Frameworks', 'Reporting'],
      ['USDC', 'DAI', 'Yield on Stables'],
      ['Smart Contract Security', 'Bug Bounties', 'Formal Verification'],
      ['DAO Participation', 'Proposal Analysis', 'Voting Power'],
      ['DeFi Insurance', 'Claims Processing', 'Risk Pools']
    ],
    missions: [
      'Profit from the upcoming market correction',
      'Ensure the treasury is 100% hedged',
      'Expose a major protocol vulnerability',
      'Predict the next Fed interest rate hike',
      'Minimize drawdowns during a black swan event',
      'Achieve 10% APY on stablecoin holdings',
      'Audit the top 5 DeFi protocols for safety',
      'Lead the governance vote for protocol decentralization',
      'Provide insurance coverage for smart contract hacks',
      'Analyze the impact of new crypto regulations'
    ]
  },
  {
    name: 'Whales',
    color: '#3b82f6', // Blue
    roles: [
      'Institutional Buyer',
      'OTC Desk Manager',
      'Venture Capitalist',
      'Treasury Head',
      'Ecosystem Fund Lead',
      'Strategic Investor',
      'Private Equity Partner',
      'Asset Manager',
      'Family Office Advisor',
      'Sovereign Wealth Lead'
    ],
    expertise: [
      ['Block Trading', 'Dark Pools', 'TWAP'],
      ['Liquidity Sourcing', 'Settlement', 'KYT'],
      ['Seed Rounds', 'Tokenomics', 'Due Diligence'],
      ['Capital Allocation', 'Runway Management', 'Diversification'],
      ['Grants', 'Incubation', 'Community Growth'],
      ['M&A', 'Strategic Partnerships', 'Governance'],
      ['Valuation', 'Exit Strategies', 'LPs'],
      ['Portfolio Rebalancing', 'Custody', 'Reporting'],
      ['Wealth Preservation', 'Succession', 'Tax Optimization'],
      ['Global Macro', 'Geopolitics', 'Reserve Assets']
    ],
    missions: [
      'Deploy $50M into early-stage DeFi projects',
      'Acquire a 5% stake in a major Layer 2 network',
      'Manage the $1B corporate treasury',
      'Execute a $10M OTC trade with minimal slippage',
      'Launch a $100M ecosystem growth fund',
      'Broker a merger between two leading DAOs',
      'Optimize the tax structure for global crypto holdings',
      'Secure institutional-grade custody for all assets',
      'Influence the roadmap of a top 10 blockchain',
      'Establish a crypto-native family office'
    ]
  },
  {
    name: 'Degens',
    color: '#a855f7', // Purple
    roles: [
      'Airdrop Farmer',
      'NFT Collector',
      'Memecoin Specialist',
      'Ponzi Analyst',
      'Bridge Explorer',
      'Gas Optimizer',
      'Degenerate Gambler',
      'Discord Mod',
      'Twitter Influencer',
      'Bot Developer'
    ],
    expertise: [
      ['Multi-wallet Strategy', 'Sybil Resistance', 'Testnets'],
      ['Rarity Traits', 'Floor Price', 'Minting'],
      ['Low-cap Gems', 'Rug Pull Detection', 'Hype'],
      ['Game Theory', 'Incentive Structures', 'Sustainability'],
      ['Cross-chain', 'Atomic Swaps', 'Bridges'],
      ['EIP-1559', 'L2 Gas', 'Transaction Bundling'],
      ['Leveraged Betting', 'Prediction Markets', 'Casino'],
      ['Community Building', 'Hype Management', 'Raids'],
      ['Viral Content', 'Engagement', 'Threads'],
      ['Solidity', 'Python', 'Web3.js']
    ],
    missions: [
      'Farm the next 5 major protocol airdrops',
      'Flip 10 NFTs for a 2x profit each',
      'Turn 1 ETH into 100 ETH using memecoins',
      'Identify the next sustainable yield farm',
      'Bridge $10k across 5 different chains safely',
      'Save 1 ETH in gas fees using L2s',
      'Win the jackpot on a decentralized prediction market',
      'Grow the Discord community to 50k members',
      'Get a tweet to go viral in Crypto Twitter',
      'Deploy a sniper bot for new token launches'
    ]
  }
];

const PERSONALITIES: string[] = [
  'Aggressive and risk-taking, loves volatility',
  'Conservative and cautious, prioritizes safety',
  'Data-obsessed and analytical, trusts the charts',
  'Visionary and idealistic, believes in decentralization',
  'Opportunistic and quick, always looking for an edge',
  'Community-focused and helpful, a true believer',
  'Skeptical and critical, always questioning the hype',
  'Playful and chaotic, here for the memes'
];

// ─────────────────────────────────────────────────────────────
//  Generation
// ─────────────────────────────────────────────────────────────
function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

const _agents: AgentData[] = [];

// Index 0: First Agent
_agents.push({
  index: 0,
  department: 'Bulls',
  role: 'Alpha Whale',
  expertise: ['Strategy', 'Leadership', 'Vision'],
  mission: 'Dominate the Crypto Maze and reach Rank 100',
  personality: 'Decisive and inspiring leader',
  isPlayer: false,
  color: '#7EACEA', // Light Blue
});

// Indices 1-1999: Crypto Agents
for (let i = 1; i < TOTAL_COUNT; i++) {
  const n = i - 1;
  const team = TEAMS[n % TEAMS.length];
  const roleIdx = Math.floor(n / TEAMS.length) % team.roles.length;

  _agents.push({
    index: i,
    department: team.name,
    role: team.roles[roleIdx],
    expertise: team.expertise[roleIdx],
    mission: pick(team.missions, n),
    personality: pick(PERSONALITIES, n),
    isPlayer: false,
    color: team.color,
  });
}

export const AGENTS: AgentData[] = _agents;

export function getAgent(index: number): AgentData | undefined {
  return _agents[index];
}
