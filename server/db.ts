import { drizzle } from "drizzle-orm/neon-serverless";
import { neon, neonConfig } from "@neondatabase/serverless";

// Fix for Neon serverless driver
neonConfig.fetchConnectionCache = true;

// Create SQL client - note that this creates a function and not a direct client object
// that would have a query method
const sql = neon(process.env.DATABASE_URL!);

// Export the drizzle database instance
export const db = drizzle(sql);

// We don't export client for raw queries since the neon serverless function
// doesn't have the standard query method like a pg pool would have
// Instead, use the drizzle instance for all database operations
