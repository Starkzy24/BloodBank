import { drizzle } from "drizzle-orm/neon-serverless";
import { neon, neonConfig } from "@neondatabase/serverless";

// Fix for Neon serverless driver
neonConfig.fetchConnectionCache = true;

// Create SQL client
const sql = neon(process.env.DATABASE_URL!);

// Export the drizzle database instance
export const db = drizzle(sql);

// Export the sql client for raw queries if needed
export const client = sql;
