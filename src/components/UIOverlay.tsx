
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import DebugPanel from './DebugPanel';
import HelpModal from './HelpModal';
import ChatPanel from './ChatPanel';
import { BaseConnectButton } from './BaseConnectButton';
import { AGENTS } from '../data/agents';
import { HelpCircle, User } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

const UIOverlay: React.FC = () => {
  const { 
    isThinking, 
    isDebugOpen, 
    toggleDebug, 
    selectedNpcIndex,
    selectedPosition,
    hoveredNpcIndex,
    hoverPosition,
    startChat,
    endChat,
    isChatting,
    isMovingToChat,
    playerStats,
    npcStats,
    activeEncounter,
    walletAddress,
    isWalletConnecting,
    connectWallet,
    monoCashBalance,
    spawnAgent,
    claimProfits,
    leaderboard,
    claimAgent,
    followAgent,
    unfollowAgent,
    localPlayerId,
    players
  } = useStore();
  const [isHelpOpen, setHelpOpen] = useState(false);
  const [isLeaderboardOpen, setLeaderboardOpen] = useState(false);

  const localPlayer = localPlayerId ? players[localPlayerId] : null;
  const isControllingAgent = localPlayer?.controlledAgentIndex !== null;

  const selectedAgent = selectedNpcIndex != null ? AGENTS[selectedNpcIndex] ?? null : null;
  const hoveredAgent = hoveredNpcIndex != null ? AGENTS[hoveredNpcIndex] ?? null : null;

  const selectedAgentStats = selectedNpcIndex !== null ? (selectedNpcIndex === 0 ? playerStats : npcStats[selectedNpcIndex]) : null;

  // Check if the selected NPC is the one we are currently encountering
  const isNearSelectedNpc = activeEncounter && activeEncounter.npcIndex === selectedNpcIndex;

  const handleStartChat = () => {
    if (selectedNpcIndex !== null) {
      startChat(selectedNpcIndex);
    }
  };

  const handleEndChat = () => {
    endChat();
  };

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-8">
      <AnimatePresence>
        <ChatPanel />
      </AnimatePresence>

      {/* Proximity Prompt (Active Encounter) */}
      <AnimatePresence>
        {activeEncounter && !isChatting && !isMovingToChat && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 z-40 pointer-events-auto"
          >
            <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500/20 text-blue-400">
                <User size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-0.5">Nearby Agent</p>
                <p className="text-sm font-bold text-white">{activeEncounter.npcRole}</p>
              </div>
              <button 
                onClick={() => startChat(activeEncounter.npcIndex)}
                className="ml-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
              >
                Coordinate
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Bubble (Always visible when selected) */}
      {selectedAgent && selectedPosition && (
        <div 
          className="absolute z-10 pointer-events-none transition-all duration-75 ease-out"
          style={{ 
            left: selectedPosition.x, 
            top: selectedPosition.y,
            transform: 'translate(-50%, -100%) translateY(-10px)'
          }}
        >
          <div className="bg-zinc-800/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-xl flex items-center gap-2 whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
            <div 
              className="w-2 h-2 rounded-full shrink-0" 
              style={{ backgroundColor: selectedAgent.color }}
            />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-white">
                {selectedAgent.role}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-white/40">·</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                {selectedAgent.department}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Hover Bubble */}
      {hoveredAgent && hoverPosition && hoveredNpcIndex !== selectedNpcIndex && (
        <div 
          className="absolute z-10 pointer-events-none transition-all duration-75 ease-out"
          style={{ 
            left: hoverPosition.x, 
            top: hoverPosition.y,
            transform: 'translate(-50%, -100%) translateY(-10px)'
          }}
        >
          <div className="bg-zinc-800/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-xl flex items-center gap-2 whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
            <div 
              className="w-2 h-2 rounded-full shrink-0" 
              style={{ backgroundColor: hoveredAgent.color }}
            />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-white">
                {hoveredAgent.role}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-white/40">·</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                {hoveredAgent.department}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex justify-between items-start relative z-30">
        <div className="bg-white p-6 rounded-[32px] border border-black/5 shadow-xl max-w-[340px] pointer-events-auto flex gap-4">
          <div className="w-2.5 h-10 bg-[#7EACEA] rounded-full shrink-0 mt-1" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Crypto Maze Board</h1>
              <button
                onClick={() => setHelpOpen(true)}
                className="text-zinc-300 hover:text-zinc-500 transition-colors"
              >
                <HelpCircle size={22} strokeWidth={2} />
              </button>
            </div>
            <p className="text-[13px] text-zinc-400 font-medium leading-snug">
              Autonomous DeFi agents trading and coordinating in a 3D maze board.
            </p>
          </div>
        </div>

        {/* Player Stats Dashboard */}
        <div className={`p-6 rounded-[32px] border shadow-2xl pointer-events-auto flex gap-8 transition-all duration-500 ${
          isControllingAgent && !playerStats.isAlive ? 'bg-red-900 border-red-500 animate-pulse' : 'bg-zinc-900 border-white/10'
        }`}>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">My $MONOCASH</span>
            <span className="text-2xl font-black tracking-tight text-amber-400">
              {monoCashBalance.toLocaleString()}
            </span>
          </div>
          {isControllingAgent ? (
            <>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Agent Balance</span>
                <span className={`text-2xl font-black tracking-tight ${!playerStats.isAlive ? 'text-white' : 'text-emerald-400'}`}>
                  ${playerStats.balance.toFixed(1)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Status</span>
                <span className={`text-2xl font-black tracking-tight ${playerStats.isAlive ? 'text-blue-400' : 'text-red-200'}`}>
                  {playerStats.isAlive ? 'ACTIVE' : 'LIQUIDATED'}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Select an agent to play</span>
            </div>
          )}
        </div>

        {/* Debug Button */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={() => setLeaderboardOpen(!isLeaderboardOpen)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 border ${
              isLeaderboardOpen
              ? 'bg-amber-500 text-white border-amber-500 shadow-lg'
              : 'bg-white/80 text-zinc-500 border-black/5 hover:bg-white hover:text-zinc-900'
            }`}
          >
            Leaderboard
          </button>
          <BaseConnectButton />
          <button
            onClick={toggleDebug}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 border ${
              isDebugOpen
              ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg'
              : 'bg-white/80 text-zinc-500 border-black/5 hover:bg-white hover:text-zinc-900'
            }`}
          >
            {isDebugOpen ? 'Close Debug' : 'Debug'}
          </button>
        </div>
      </div>

      {/* Debug Panel Mount */}
      <DebugPanel />

      {/* Leaderboard Panel */}
      <AnimatePresence>
        {isLeaderboardOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed top-32 right-8 w-80 bg-white/90 backdrop-blur-2xl rounded-3xl border border-black/5 shadow-2xl p-6 pointer-events-auto z-40"
          >
            <h3 className="text-xl font-black text-zinc-900 mb-4 tracking-tight uppercase">Top Survivalists</h3>
            <div className="space-y-3">
              {leaderboard.map((entry, i) => (
                <div key={i} className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-zinc-300 w-4">0{i + 1}</span>
                    <div>
                      <p className="text-xs font-bold text-zinc-800">{entry.name}</p>
                      <p className="text-[9px] font-medium text-zinc-400 uppercase">Gen {entry.generation}</p>
                    </div>
                  </div>
                  <p className="text-xs font-black text-emerald-500">${entry.balance.toFixed(1)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setHelpOpen(false)} />

      {/* NPC Info Panel — shown when an NPC is selected */}
      {selectedAgent && (
        <div className="absolute bottom-8 left-8 w-72 bg-white/85 backdrop-blur-2xl rounded-2xl border border-black/5 shadow-2xl p-5 pointer-events-auto animate-in fade-in slide-in-from-left-4 duration-300 z-30 overflow-hidden">
          {/* Color accent bar */}
          <div 
            className="absolute top-0 left-0 w-full h-1" 
            style={{ backgroundColor: selectedAgent.color }}
          />
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">
                Team: {selectedAgent.department} | {selectedAgentStats?.archetype}
              </p>
              <h2 className="text-xl font-black text-zinc-900 leading-tight">{selectedAgent.role}</h2>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
                Gen {selectedAgentStats?.lineage.generation} | {selectedAgentStats?.followers.length} Followers
                {selectedAgentStats?.isPlayerControlled && ` | Controlled by ${players[selectedAgentStats.controllerId!]?.name || 'Unknown'}`}
              </p>
            </div>
            {selectedAgentStats && (
              <div className="text-right">
                <p className={`text-[10px] font-black uppercase tracking-widest ${selectedAgentStats.isAlive ? 'text-emerald-500' : 'text-red-500'}`}>
                  {selectedAgentStats.isAlive ? `$${selectedAgentStats.balance.toFixed(1)}` : 'LIQUIDATED'}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Premium: x{selectedAgentStats.fundingPremium.toFixed(1)}</p>
              </div>
            )}
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed mb-3 italic">
            "{selectedAgent.mission}"
          </p>

          <div className="flex flex-wrap gap-1 mb-3">
            {selectedAgent.expertise.map((tag) => (
              <span key={tag} className="text-[10px] font-bold bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>

          <p className="text-[11px] text-zinc-400 leading-snug mb-5">{selectedAgent.personality}</p>

          <div className="space-y-2">
            {selectedAgentStats && !selectedAgentStats.isAlive ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => spawnAgent('BASIC')}
                  className="py-2 bg-zinc-100 text-zinc-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-sm"
                >
                  Spawn Basic (50)
                </button>
                <button
                  onClick={() => spawnAgent('ELITE', selectedNpcIndex!)}
                  className="py-2 bg-amber-100 text-amber-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-200 transition-all shadow-sm"
                >
                  Spawn Elite (150)
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {!selectedAgentStats?.isPlayerControlled ? (
                    <button
                      onClick={() => claimAgent(selectedNpcIndex!)}
                      disabled={isControllingAgent || monoCashBalance < (selectedAgentStats?.lineage.spawnCost || 0)}
                      className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                        isControllingAgent || monoCashBalance < (selectedAgentStats?.lineage.spawnCost || 0)
                        ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      Play Agent ({selectedAgentStats?.lineage.spawnCost})
                    </button>
                  ) : (
                    <div className="py-2 bg-zinc-100 text-zinc-400 rounded-xl text-[10px] font-black uppercase tracking-widest text-center">
                      Controlled
                    </div>
                  )}
                  
                  {localPlayer?.followingAgentIndices.includes(selectedNpcIndex!) ? (
                    <button
                      onClick={() => unfollowAgent(selectedNpcIndex!)}
                      className="py-2 bg-red-100 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-200 transition-all shadow-sm"
                    >
                      Unfollow
                    </button>
                  ) : (
                    <button
                      onClick={() => followAgent(selectedNpcIndex!)}
                      className="py-2 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-sm"
                    >
                      Follow
                    </button>
                  )}
                </div>

                {selectedAgentStats && (selectedAgentStats.balance - selectedAgentStats.initialBalance) >= selectedAgentStats.initialBalance * 0.5 && (
                  <button
                    onClick={() => claimProfits(selectedNpcIndex!)}
                    className="w-full py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 mb-2"
                  >
                    Claim Profits (75 $MONOCASH)
                  </button>
                )}
                {isChatting ? (
                  <button
                    onClick={handleEndChat}
                    style={{ backgroundColor: selectedAgent.color }}
                    className="w-full py-3 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-90 active:scale-[0.98] transition-all shadow-lg pointer-events-auto"
                  >
                    End Chat
                  </button>
                ) : (
                  <button
                    onClick={handleStartChat}
                    disabled={(selectedAgentStats && !selectedAgentStats.isAlive) || isMovingToChat}
                    className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest active:scale-[0.98] transition-all shadow-lg pointer-events-auto ${
                      (selectedAgentStats && !selectedAgentStats.isAlive) || isMovingToChat
                      ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' 
                      : 'bg-zinc-900 text-white hover:bg-black shadow-zinc-200'
                    }`}
                  >
                    {selectedAgentStats && !selectedAgentStats.isAlive 
                      ? 'Agent Liquidated' 
                      : (isMovingToChat ? 'Moving to Coordinate...' : (isNearSelectedNpc ? 'Coordinate Trade' : 'Move to Coordinate'))}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UIOverlay;
