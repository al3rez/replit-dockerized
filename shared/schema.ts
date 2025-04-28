import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),  // Can be null for OAuth users
  email: text("email").notNull().unique(),
  plan: text("plan").notNull().default("basic"),
  photoURL: text("photo_url"),  // Profile photo URL
  isOAuthUser: boolean("is_oauth_user").default(false),  // Flag for OAuth users
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  plan: true,
  photoURL: true,
  isOAuthUser: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
