import { createDb, type Db } from "@rem/db";

const g = globalThis as unknown as { remDb?: Db };

/** One pool per server process (survives hot reloads in dev). */
export const db: Db = (g.remDb ??= createDb());
