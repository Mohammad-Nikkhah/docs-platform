import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

async function main() {
  const defaultDatabaseUrl = "postgresql://postgres:19909019@localhost:5432/docs_platform";
  const url = process.env.DATABASE_URL ?? defaultDatabaseUrl;
  if (!url) throw new Error("DATABASE_URL is not set. Create a .env file using .env.example and point it to your PostgreSQL instance.");
  const pool = new Pool({ connectionString: url, max: 1 });
  await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
  await pool.end();
  console.log("Migrations applied.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
