import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pgPool?: Pool };
const defaultDatabaseUrl = "postgresql://postgres:19909019@localhost:5432/docs_platform";

function createPool(): Pool {
  const url = process.env.DATABASE_URL ?? defaultDatabaseUrl;
  if (!url) throw new Error("DATABASE_URL is not set. Create a .env file using .env.example and point it to your PostgreSQL instance.");
  return new Pool({ connectionString: url, max: 10 });
}

// Reuse the pool across hot reloads in dev.
const pool = globalForDb.pgPool ?? createPool();
if (process.env.NODE_ENV !== "production") globalForDb.pgPool = pool;

export const db = drizzle(pool, { schema });
export { pool };
export type Db = typeof db;
