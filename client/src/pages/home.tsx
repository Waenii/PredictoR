import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import WalletDisplay from "@/components/wallet-display";
import EventCard from "@/components/event-card";
import BettingHistory from "@/components/betting-history";
import { Box, Trophy, Coins, Zap } from "lucide-react";

export default function Home() {
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    queryFn: () => api.getUser(),
  });

  const { data: events = [] } = useQuery({
    queryKey: ["/api/events"],
    queryFn: () => api.getEvents(),
  });

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                  <Box className="text-white w-4 h-4" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  PredictoR
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <WalletDisplay balance={user?.balance || 100} />
              
              <button className="w-10 h-10 bg-slate-700/50 rounded-xl flex items-center justify-center hover:bg-slate-600/50 transition-colors">
                <div className="w-4 h-4 rounded-full bg-slate-400"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
              Predict. Bet. Win.
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Place your bets on real-world events powered by AI verification on the Qubic Network
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-effect rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI-Verified Results</h3>
              <p className="text-slate-400">Transparent and fair outcomes powered by artificial intelligence</p>
            </div>
            
            <div className="glass-effect rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Coins className="text-green-500 w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Qubic Network</h3>
              <p className="text-slate-400">Secure betting infrastructure with instant transactions</p>
            </div>
            
            <div className="glass-effect rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="text-secondary w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant Results</h3>
              <p className="text-slate-400">Quick resolution and automatic reward distribution</p>
            </div>
          </div>
        </section>

        {/* Active Events */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-100">Active Events</h2>
            <div className="flex items-center space-x-4">
              <select className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-slate-300 text-sm">
                <option>All Categories</option>
                <option>Sports</option>
                <option>Politics</option>
                <option>Entertainment</option>
                <option>Technology</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} userBalance={user?.balance || 100} />
            ))}
          </div>
        </section>

        {/* Betting History */}
        <BettingHistory />
      </main>
    </div>
  );
}
