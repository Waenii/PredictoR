import { users, events, bets, type User, type InsertUser, type Event, type InsertEvent, type Bet, type InsertBet } from "@shared/schema";

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
  createBet(bet: InsertBet): Promise<Bet>;
  getUserBets(userId: number): Promise<Bet[]>;
  getEventBets(eventId: number): Promise<Bet[]>;
  updateBetResult(betId: number, isWon: boolean): Promise<Bet | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private bets: Map<number, Bet>;
  private currentUserId: number;
  private currentEventId: number;
  private currentBetId: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.bets = new Map();
    this.currentUserId = 1;
    this.currentEventId = 1;
    this.currentBetId = 1;

    // Initialize with default user and sample events
    this.initializeData();
  }

  private initializeData() {
    // Create default user
    const defaultUser: User = {
      id: this.currentUserId++,
      username: "player1",
      password: "password",
      balance: 100,
    };
    this.users.set(defaultUser.id, defaultUser);

    // Create sample events
    const sampleEvents: Omit<Event, 'id'>[] = [
      {
        title: "Will France win the 2024 FIFA World Cup?",
        description: "Predict whether France will be crowned champions in the upcoming tournament.",
        category: "Sports",
        isActive: true,
        isResolved: false,
        correctAnswer: null,
        createdAt: new Date(),
        endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      },
      {
        title: "Will Bitcoin reach $100,000 by end of 2024?",
        description: "Predict whether Bitcoin will hit the six-figure milestone this year.",
        category: "Technology",
        isActive: true,
        isResolved: false,
        correctAnswer: null,
        createdAt: new Date(),
        endsAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
      },
      {
        title: "Will there be a new US President in 2024?",
        description: "Predict the outcome of the upcoming presidential election.",
        category: "Politics",
        isActive: true,
        isResolved: false,
        correctAnswer: null,
        createdAt: new Date(),
        endsAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
      },
      {
        title: "Will a Marvel movie win an Oscar in 2024?",
        description: "Predict whether any Marvel Studios film will receive an Academy Award.",
        category: "Entertainment",
        isActive: true,
        isResolved: false,
        correctAnswer: null,
        createdAt: new Date(),
        endsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      },
    ];

    sampleEvents.forEach(event => {
      const newEvent: Event = { ...event, id: this.currentEventId++ };
      this.events.set(newEvent.id, newEvent);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, balance: 100 };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(userId: number, newBalance: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      this.users.set(userId, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  async getAllActiveEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => event.isActive);
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    const event: Event = {
      ...insertEvent,
      id,
      isActive: true,
      isResolved: false,
      correctAnswer: null,
      createdAt: new Date(),
    };
    this.events.set(id, event);
    return event;
  }

  async resolveEvent(eventId: number, correctAnswer: string): Promise<Event | undefined> {
    const event = this.events.get(eventId);
    if (event) {
      const updatedEvent = {
        ...event,
        isResolved: true,
        isActive: false,
        correctAnswer,
      };
      this.events.set(eventId, updatedEvent);
      return updatedEvent;
    }
    return undefined;
  }

  async createBet(insertBet: InsertBet): Promise<Bet> {
    const id = this.currentBetId++;
    const bet: Bet = {
      ...insertBet,
      id,
      isWon: null,
      createdAt: new Date(),
    };
    this.bets.set(id, bet);
    return bet;
  }

  async getUserBets(userId: number): Promise<Bet[]> {
    return Array.from(this.bets.values()).filter(bet => bet.userId === userId);
  }

  async getEventBets(eventId: number): Promise<Bet[]> {
    return Array.from(this.bets.values()).filter(bet => bet.eventId === eventId);
  }

  async updateBetResult(betId: number, isWon: boolean): Promise<Bet | undefined> {
    const bet = this.bets.get(betId);
    if (bet) {
      const updatedBet = { ...bet, isWon };
      this.bets.set(betId, updatedBet);
      return updatedBet;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
