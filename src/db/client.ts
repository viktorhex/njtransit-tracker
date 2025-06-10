import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import { busLocations } from './schema';

const getSupabaseUrl = (env: 'prod' | 'nonprod') => {
  const url = env === 'prod' ? process.env.SUPABASE_URL_PROD : process.env.SUPABASE_URL_NONPROD;
  if (!url) {
    throw new Error(`Supabase URL for ${env} is not defined`);
  }
  console.log(`Supabase ${env} URL:`, url.replace(/:([^@]+)@/, ':****@')); // Mask password
  return url;
};

const createClient = (env: 'prod' | 'nonprod') => {
  const pool = new Pool({
    connectionString: getSupabaseUrl(env),
    ssl: { rejectUnauthorized: false },
  });
  return drizzle(pool, { schema: { busLocations } });
};

export { createClient };