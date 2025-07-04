import { useState } from "react";
import { Users, Coins, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import BettingModal from "./betting-modal";
import type { Event } from "@shared/schema";

interface EventCardProps {
  event: Event;
  userBalance: number;
}

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case "sports":
      return "bg-green-500/20 text-green-500";
    case "technology":
      return "bg-purple-500/20 text-purple-500";
    case "politics":
      return "bg-blue-500/20 text-blue-500";
    case "entertainment":
      return "bg-yellow-500/20 text-yellow-500";
    default:
      return "bg-slate-500/20 text-slate-500";
  }
};

const getDaysUntilEnd = (endsAt: string | Date) => {
  const end = new Date(endsAt);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

export default function EventCard({ event, userBalance }: EventCardProps) {
  const [showBettingModal, setShowBettingModal] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<"YES" | "NO" | null>(null);

  const daysUntilEnd = getDaysUntilEnd(event.endsAt);

  const handleBetClick = (prediction: "YES" | "NO") => {
    if (userBalance < 10) {
      // Could show toast here
      return;
    }
    setSelectedPrediction(prediction);
    setShowBettingModal(true);
  };

  return (
    <>
      <div className="glass-effect rounded-xl p-6 hover:border-primary/50 transition-all duration-300 group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getCategoryColor(event.category)}`}>
                {event.category}
              </span>
              <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded-lg text-xs">
                Active
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
              {event.title}
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              {event.description}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button
            onClick={() => handleBetClick("YES")}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-500 rounded-lg py-3 px-4 font-medium transition-all duration-300 hover:scale-105"
            disabled={userBalance < 10}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>YES</span>
              <span className="text-xs opacity-75">2.0x</span>
            </div>
          </Button>
          <Button
            onClick={() => handleBetClick("NO")}
            className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-500 rounded-lg py-3 px-4 font-medium transition-all duration-300 hover:scale-105"
            disabled={userBalance < 10}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>NO</span>
              <span className="text-xs opacity-75">2.0x</span>
            </div>
          </Button>
        </div>
        
        <div className="flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              0 bets
            </span>
            <span className="flex items-center">
              <Coins className="w-3 h-3 mr-1" />
              10 Qubic
            </span>
          </div>
          <span className="text-xs flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Ends in {daysUntilEnd} days
          </span>
        </div>
      </div>

      {showBettingModal && selectedPrediction && (
        <BettingModal
          event={event}
          prediction={selectedPrediction}
          userBalance={userBalance}
          onClose={() => {
            setShowBettingModal(false);
            setSelectedPrediction(null);
          }}
        />
      )}
    </>
  );
}
