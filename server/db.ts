import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Initialize PostgreSQL pool using local connection
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Use drizzle with Node Postgres (not neon)
export const db = drizzle(pool, { schema });
