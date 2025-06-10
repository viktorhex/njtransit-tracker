import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import { busLocations } from './schema';

const getSupabaseUrl = (env: 'prod' | 'nonprod') =>
  env === 'prod' ? process.env.SUPABASE_URL_PROD : process.env.SUPABASE_URL_NONPROD;

const createClient = (env: 'prod' | 'nonprod') => {
  const pool = new Pool({
    connectionString: getSupabaseUrl(env),
    ssl: { rejectUnauthorized: false },
  });
  return drizzle(pool, { schema: { busLocations } });
};

export { createClient };