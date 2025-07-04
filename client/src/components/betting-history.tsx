import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

export default function BettingHistory() {
  const { data: bets = [], isLoading } = useQuery({
    queryKey: ["/api/bets/history"],
    queryFn: () => api.getBettingHistory(),
  });

  const getStatusColor = (isWon: boolean | null) => {
    if (isWon === null) return "bg-yellow-500/20 text-yellow-500";
    return isWon ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500";
  };

  const getStatusText = (isWon: boolean | null) => {
    if (isWon === null) return "PENDING";
    return isWon ? "WON" : "LOST";
  };

  const getDotColor = (isWon: boolean | null) => {
    if (isWon === null) return "bg-yellow-500 animate-pulse";
    return isWon ? "bg-green-500 animate-pulse-slow" : "bg-red-500";
  };

  if (isLoading) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-100 mb-6">Your Betting History</h2>
        <div className="glass-effect rounded-xl p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-700/50 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-slate-100 mb-6">Your Betting History</h2>
      
      <div className="glass-effect rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Bets</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-400">Total Bets:</span>
              <span className="text-green-500 font-semibold">{bets.length}</span>
            </div>
          </div>
        </div>
        
        {bets.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-400">No bets placed yet. Start by betting on an event above!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {bets.map((bet) => (
              <div key={bet.id} className="p-6 hover:bg-slate-700/20 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`w-3 h-3 rounded-full ${getDotColor(bet.isWon)}`}></span>
                      <h4 className="font-medium">{bet.event?.title || "Unknown Event"}</h4>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(bet.isWon)}`}>
                        {getStatusText(bet.isWon)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      <span>Bet: {bet.prediction}</span>
                      <span>•</span>
                      <span>Staked: {bet.amount} Qubic</span>
                      <span>•</span>
                      <span>
                        {bet.isWon === null 
                          ? `Potential: ${bet.amount * 2} Qubic`
                          : `Won: ${bet.isWon ? bet.amount * 2 : 0} Qubic`
                        }
                      </span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(bet.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${
                      bet.isWon === null 
                        ? "text-yellow-500" 
                        : bet.isWon 
                        ? "text-green-500" 
                        : "text-red-500"
                    }`}>
                      {bet.isWon === null 
                        ? `-${bet.amount}`
                        : bet.isWon 
                        ? `+${bet.amount * 2}`
                        : `-${bet.amount}`
                      }
                    </div>
                    <div className="text-xs text-slate-400">
                      {bet.isWon === null ? "Pending" : "Qubic"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {bets.length > 0 && (
          <div className="p-6 bg-slate-700/20 text-center">
            <button className="text-primary hover:text-secondary transition-colors font-medium">
              View All History →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
