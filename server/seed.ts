import { db } from './db';
import { users, events } from '@shared/schema';

async function seed() {
  try {
    console.log('Starting database seeding...');

    // Create default user
    const [existingUser] = await db.select().from(users).limit(1);
    if (!existingUser) {
      await db.insert(users).values({
        username: 'player1',
        password: 'password',
        balance: 100,
      });
      console.log('Created default user');
    }

    // Create sample events
    const existingEvents = await db.select().from(events).limit(1);
    if (existingEvents.length === 0) {
      await db.insert(events).values([
        {
          title: "Will France win the 2024 FIFA World Cup?",
          description: "Predict whether France will be crowned champions in the upcoming tournament.",
          category: "Sports",
          endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        },
        {
          title: "Will Bitcoin reach $100,000 by end of 2024?",
          description: "Predict whether Bitcoin will hit the six-figure milestone this year.",
          category: "Technology",
          endsAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        },
        {
          title: "Will there be a new US President in 2024?",
          description: "Predict the outcome of the upcoming presidential election.",
          category: "Politics",
          endsAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
        },
        {
          title: "Will a Marvel movie win an Oscar in 2024?",
          description: "Predict whether any Marvel Studios film will receive an Academy Award.",
          category: "Entertainment",
          endsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        },
      ]);
      console.log('Created sample events');
    }

    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run seed if this file is executed directly
seed();

export { seed };