import { Coins } from "lucide-react";

interface WalletDisplayProps {
  balance: number;
}

export default function WalletDisplay({ balance }: WalletDisplayProps) {
  return (
    <div className="glass-effect rounded-xl px-6 py-3">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 gradient-warning rounded-full flex items-center justify-center animate-pulse-slow">
          <Coins className="text-slate-900 w-4 h-4" />
        </div>
        <div>
          <p className="text-slate-400 text-xs">Wallet Balance</p>
          <p className="text-lg font-semibold">{balance}</p>
          <span className="text-yellow-500 text-sm font-medium">Qubic Coins</span>
        </div>
      </div>
    </div>
  );
}
