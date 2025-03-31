import { drizzle } from "drizzle-orm/neon-serverless";
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import pkg from 'pg';
const { Pool } = pkg;

// Fix for Neon serverless driver
neonConfig.fetchConnectionCache = true;

// Create SQL client for serverless operations with Neon
const sql = neon(process.env.DATABASE_URL!);

// Create a standard PostgreSQL pool for connect-pg-simple and other operations
// that require the standard Node-Postgres client
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Export the drizzle database instance for serverless operations
export const db = drizzle(sql);

// Export a drizzle instance that uses the standard pg pool
// This is needed for session store and other operations
export const pgDb = drizzlePg(pool);
