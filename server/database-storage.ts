import { IStorage } from './storage';
import { db, pool } from './db';
import { users, type User, type InsertUser } from "@shared/schema";
import { eq } from 'drizzle-orm';
import connectPg from "connect-pg-simple";
import session from "express-session";
import createMemoryStore from "memorystore";

// Create stores
const PostgresSessionStore = connectPg(session);
const MemoryStore = createMemoryStore(session);

// Helper to check if database is available
const isDatabaseAvailable = (): boolean => {
  return !!db && !!pool;
};

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    // Use PostgreSQL session store if database is available, otherwise use memory store
    if (isDatabaseAvailable() && pool) {
      this.sessionStore = new PostgresSessionStore({ 
        pool: pool as any,
        createTableIfMissing: true
      });
      console.log("🔵 Using PostgreSQL session store");
    } else {
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000 // 24 hours
      });
      console.log("⚠️ Using memory session store (data will not persist across restarts)");
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    if (!isDatabaseAvailable()) {
      console.error("❌ Database not available for getUser operation");
      return undefined;
    }
    try {
      const [user] = await db!.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("❌ Database error in getUser:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!isDatabaseAvailable()) {
      console.error("❌ Database not available for getUserByUsername operation");
      return undefined;
    }
    try {
      const [user] = await db!.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error("❌ Database error in getUserByUsername:", error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!isDatabaseAvailable()) {
      console.error("❌ Database not available for getUserByEmail operation");
      return undefined;
    }
    try {
      const [user] = await db!.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error("❌ Database error in getUserByEmail:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!isDatabaseAvailable()) {
      console.error("❌ Database not available for createUser operation");
      throw new Error("Database not available");
    }
    try {
      const [user] = await db!.insert(users).values(insertUser).returning();
      return user;
    } catch (error) {
      console.error("❌ Database error in createUser:", error);
      throw error;
    }
  }
}