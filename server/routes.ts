import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBetSchema } from "@shared/schema";
import { resolveEventWithAI } from "./services/ai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get default user (for demo purposes)
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUser(1); // Default user ID
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Get all active events
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllActiveEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to get events" });
    }
  });

  // Get user's betting history
  app.get("/api/bets/history", async (req, res) => {
    try {
      const bets = await storage.getUserBets(1); // Default user ID
      
      // Enrich bets with event information
      const enrichedBets = await Promise.all(
        bets.map(async (bet) => {
          const event = await storage.getEvent(bet.eventId);
          return {
            ...bet,
            event,
          };
        })
      );
      
      res.json(enrichedBets);
    } catch (error) {
      res.status(500).json({ message: "Failed to get betting history" });
    }
  });

  // Place a bet
  app.post("/api/bets", async (req, res) => {
    try {
      const betData = insertBetSchema.parse(req.body);
      const userId = 1; // Default user ID
      
      // Check user balance
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.balance < betData.amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Check if event exists and is active
      const event = await storage.getEvent(betData.eventId);
      if (!event || !event.isActive) {
        return res.status(400).json({ message: "Event not available for betting" });
      }
      
      // Create the bet
      const bet = await storage.createBet({ ...betData, userId });
      
      // Deduct bet amount from user balance
      await storage.updateUserBalance(userId, user.balance - betData.amount);
      
      // Trigger AI resolution (simulate delay)
      setTimeout(async () => {
        try {
          const resolution = await resolveEventWithAI(event.title, event.description);
          
          // Resolve the event
          await storage.resolveEvent(event.id, resolution.answer);
          
          // Update all bets for this event
          const eventBets = await storage.getEventBets(event.id);
          
          for (const eventBet of eventBets) {
            const isWon = eventBet.prediction === resolution.answer;
            await storage.updateBetResult(eventBet.id, isWon);
            
            // If user won, award 20 coins
            if (isWon) {
              const betUser = await storage.getUser(eventBet.userId);
              if (betUser) {
                await storage.updateUserBalance(eventBet.userId, betUser.balance + 20);
              }
            }
          }
        } catch (error) {
          console.error("Failed to resolve event:", error);
        }
      }, 3000); // 3 second delay to simulate AI processing
      
      res.json({ success: true, bet });
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid bet data" });
      }
      res.status(500).json({ message: "Failed to place bet" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
