import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import pg from 'pg'
const { Pool } = pg
import dotenv from "dotenv";

dotenv.config();

// Check for DATABASE_URL environment variable and provide helpful error logging
if (!process.env.DATABASE_URL) {
  console.error("⚠️ DATABASE_URL environment variable not found");
  console.error("ℹ️ Creating a PostgreSQL database with the create_postgresql_database_tool");
  console.error("ℹ️ This will be done automatically if running in a Replit environment");
}

// Set up a safe connection - will be initialized if DATABASE_URL is available
let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

try {
  if (process.env.DATABASE_URL) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema });
    console.log("🔌 Database connection established successfully");
  }
} catch (error) {
  console.error("❌ Failed to connect to database:", error);
}

export { pool, db };