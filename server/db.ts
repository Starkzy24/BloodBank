import { drizzle } from "drizzle-orm/neon-serverless";
import { neonConfig, neon } from "@neondatabase/serverless";

// Fix for Neon serverless driver
neonConfig.fetchConnectionCache = true;

// Create database connection
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);
