import { useCallback, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { coinbaseWallet } from 'wagmi/connectors';
import { useStore } from '../store/useStore';
import { Wallet, LogOut } from 'lucide-react';

export function BaseConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const setWalletAddress = useStore((state) => state.setWalletAddress);

  useEffect(() => {
    if (isConnected && address) {
      setWalletAddress(address);
    } else {
      setWalletAddress(null);
    }
  }, [isConnected, address, setWalletAddress]);

  const handleConnect = useCallback(() => {
    connect({ connector: coinbaseWallet({ preference: 'smartWalletOnly' }) });
  }, [connect]);

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg border border-white/10"
      >
        <Wallet size={12} className="text-emerald-400" />
        {address?.slice(0, 6)}...{address?.slice(-4)}
        <LogOut size={12} className="ml-1 opacity-50" />
      </button>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 border border-blue-400/30"
    >
      <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
      </div>
      Connect Base Account
    </button>
  );
}
