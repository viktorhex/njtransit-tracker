import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import { busLocations } from './schema';

const getSupabaseUrl = () => {
  const env = process.env.ENV || 'nonprod';
  const url = env === 'prod' ? process.env.SUPABASE_URL_PROD : process.env.SUPABASE_URL_NONPROD;
  if (!url) {
    throw new Error(`Supabase URL for ${env} is not defined`);
  }
  console.log(`Supabase ${env} URL:`, url.replace(/:([^@]+)@/, ':****@'));
  return url;
};

const createClient = () => {
  const pool = new Pool({
    connectionString: getSupabaseUrl(),
    ssl: { rejectUnauthorized: false },
  });
  return drizzle(pool, { schema: { busLocations } });
};

export { createClient };