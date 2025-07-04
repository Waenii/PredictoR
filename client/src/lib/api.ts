import { apiRequest } from "./queryClient";
import type { User, Event, Bet, InsertBet } from "@shared/schema";

export const api = {
  // User endpoints
  getUser: async (): Promise<User> => {
    const response = await apiRequest("GET", "/api/user");
    return response.json();
  },

  // Event endpoints
  getEvents: async (): Promise<Event[]> => {
    const response = await apiRequest("GET", "/api/events");
    return response.json();
  },

  // Bet endpoints
  getBettingHistory: async (): Promise<(Bet & { event?: Event })[]> => {
    const response = await apiRequest("GET", "/api/bets/history");
    return response.json();
  },

  placeBet: async (bet: InsertBet): Promise<{ success: boolean; bet: Bet }> => {
    const response = await apiRequest("POST", "/api/bets", bet);
    return response.json();
  },
};
