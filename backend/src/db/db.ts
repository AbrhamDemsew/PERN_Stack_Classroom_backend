import { neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import { config } from 'dotenv';

config({ path: '.env' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined');
}

if (!globalThis.WebSocket) {
  neonConfig.webSocketConstructor = ws as unknown as typeof WebSocket;
}

const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool);
