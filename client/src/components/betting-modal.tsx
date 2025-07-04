import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Event } from "@shared/schema";

interface BettingModalProps {
  event: Event;
  prediction: "YES" | "NO";
  userBalance: number;
  onClose: () => void;
}

export default function BettingModal({ event, prediction, userBalance, onClose }: BettingModalProps) {
  const [isPlacing, setIsPlacing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const placeBetMutation = useMutation({
    mutationFn: () => api.placeBet({
      eventId: event.id,
      prediction,
      amount: 10,
    }),
    onSuccess: () => {
      toast({
        title: "Bet Placed Successfully!",
        description: "Your balance has been updated. AI is analyzing the event...",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bets/history"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Place Bet",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleConfirmBet = async () => {
    if (userBalance < 10) {
      toast({
        title: "Insufficient Balance",
        description: "You need at least 10 Qubic coins to place a bet",
        variant: "destructive",
      });
      return;
    }

    setIsPlacing(true);
    try {
      await placeBetMutation.mutateAsync();
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 w-full max-w-md transform transition-all">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Place Your Bet</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-8 h-8 bg-slate-700 rounded-lg hover:bg-slate-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="mb-6">
          <h4 className="font-semibold mb-2">{event.title}</h4>
          <p className="text-slate-400 text-sm">
            You're betting: <span className={`font-medium ${prediction === "YES" ? "text-green-500" : "text-red-500"}`}>
              {prediction}
            </span>
          </p>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="bg-slate-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Bet Amount</span>
              <span className="text-yellow-500 font-semibold">10 Qubic Coins</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Potential Reward</span>
              <span className="text-green-500 font-semibold">20 Qubic Coins</span>
            </div>
          </div>
          
          <div className="bg-slate-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Balance</span>
              <span className="font-semibold">{userBalance} Qubic</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Balance After Bet</span>
              <span className="font-semibold">{userBalance - 10} Qubic</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={handleConfirmBet}
            disabled={isPlacing || placeBetMutation.isPending}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
          >
            {isPlacing || placeBetMutation.isPending ? "Placing Bet..." : "Confirm Bet"}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
