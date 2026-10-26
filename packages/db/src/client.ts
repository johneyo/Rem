import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

export type Db = ReturnType<typeof createDb>;

export function createDb(url = process.env.DATABASE_URL ?? "postgres://rem:rem@localhost:5432/rem") {
  const pool = new pg.Pool({ connectionString: url });
  return Object.assign(drizzle(pool, { schema }), { pool });
}
