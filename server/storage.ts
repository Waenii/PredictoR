import { type User, type InsertUser, type Event, type InsertEvent, type Bet, type InsertBet } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: User[] = [
    { id: 1, username: "player1", password: "password", balance: 100 }
  ];
  
  private events: Event[] = [
    {
      id: 1,
      title: "Will Tesla stock reach $300 by end of 2025?",
      description: "Predict whether Tesla's stock price will hit $300 per share by December 31, 2025.",
      category: "Technology",
      isActive: true,
      isResolved: false,
      correctAnswer: null,
      createdAt: new Date(),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    },
    {
      id: 2,
      title: "Will Bitcoin reach $150,000 by end of 2025?",
      description: "Predict whether Bitcoin will hit the $150,000 milestone by December 2025.",
      category: "Crypto",
      isActive: true,
      isResolved: false,
      correctAnswer: null,
      createdAt: new Date(),
      endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
    },
    {
      id: 3,
      title: "Will there be a new iPhone model released in 2025?",
      description: "Predict whether Apple will announce a new iPhone model during 2025.",
      category: "Technology",
      isActive: true,
      isResolved: false,
      correctAnswer: null,
      createdAt: new Date(),
      endsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days from now
    },
    {
      id: 4,
      title: "Will SpaceX successfully land humans on Mars in 2025?",
      description: "Predict whether SpaceX will achieve their goal of landing humans on Mars during 2025.",
      category: "Space",
      isActive: true,
      isResolved: false,
      correctAnswer: null,
      createdAt: new Date(),
      endsAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) // 21 days from now
    }
  ];
  
  private bets: Bet[] = [];
  
  private nextUserId = 2;
  private nextEventId = 5;
  private nextBetId = 1;

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextUserId++,
      balance: 100, // Default starting balance
      ...insertUser
    };
    this.users.push(user);
    return user;
  }

  async updateUserBalance(userId: number, newBalance: number): Promise<User | undefined> {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.balance = newBalance;
    }
    return user;
  }

  // Event methods
  async getAllActiveEvents(): Promise<Event[]> {
    return this.events.filter(event => event.isActive);
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.find(event => event.id === id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const event: Event = {
      id: this.nextEventId++,
      isActive: true,
      isResolved: false,
      correctAnswer: null,
      createdAt: new Date(),
      ...insertEvent
    };
    this.events.push(event);
    return event;
  }

  async resolveEvent(eventId: number, correctAnswer: string): Promise<Event | undefined> {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.isResolved = true;
      event.isActive = false;
      event.correctAnswer = correctAnswer;
    }
    return event;
  }

  // Bet methods
  async createBet(insertBet: InsertBet, userId: number): Promise<Bet> {
    const bet: Bet = {
      id: this.nextBetId++,
      userId,
      isWon: null,
      createdAt: new Date(),
      eventId: insertBet.eventId,
      prediction: insertBet.prediction,
      amount: insertBet.amount || 10
    };
    this.bets.push(bet);
    return bet;
  }

  async getUserBets(userId: number): Promise<Bet[]> {
    return this.bets.filter(bet => bet.userId === userId);
  }

  async getEventBets(eventId: number): Promise<Bet[]> {
    return this.bets.filter(bet => bet.eventId === eventId);
  }

  async updateBetResult(betId: number, isWon: boolean): Promise<Bet | undefined> {
    const bet = this.bets.find(b => b.id === betId);
    if (bet) {
      bet.isWon = isWon;
    }
    return bet;
  }
}

export const storage = new MemStorage();