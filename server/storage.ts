import { users, events, bets, type User, type InsertUser, type Event, type InsertEvent, type Bet, type InsertBet } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, newBalance: number): Promise<User | undefined>;

  // Event methods
  getAllActiveEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  resolveEvent(eventId: number, correctAnswer: string): Promise<Event | undefined>;

  // Bet methods
  createBet(bet: InsertBet, userId: number): Promise<Bet>;
  getUserBets(userId: number): Promise<Bet[]>;
  getEventBets(eventId: number): Promise<Bet[]>;
  updateBetResult(betId: number, isWon: boolean): Promise<Bet | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserBalance(userId: number, newBalance: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async getAllActiveEvents(): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.isActive, true));
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(insertEvent)
      .returning();
    return event;
  }

  async resolveEvent(eventId: number, correctAnswer: string): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set({ 
        isResolved: true, 
        isActive: false, 
        correctAnswer 
      })
      .where(eq(events.id, eventId))
      .returning();
    return event || undefined;
  }

  async createBet(insertBet: InsertBet, userId: number): Promise<Bet> {
    const [bet] = await db
      .insert(bets)
      .values({
        ...insertBet,
        userId,
        amount: insertBet.amount || 10
      })
      .returning();
    return bet;
  }

  async getUserBets(userId: number): Promise<Bet[]> {
    return await db.select().from(bets).where(eq(bets.userId, userId));
  }

  async getEventBets(eventId: number): Promise<Bet[]> {
    return await db.select().from(bets).where(eq(bets.eventId, eventId));
  }

  async updateBetResult(betId: number, isWon: boolean): Promise<Bet | undefined> {
    const [bet] = await db
      .update(bets)
      .set({ isWon })
      .where(eq(bets.id, betId))
      .returning();
    return bet || undefined;
  }
}

export const storage = new DatabaseStorage();
