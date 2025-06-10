import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import 'dotenv/config';

const env = process.argv[2];
const supabaseUrl = env === 'prod' ? process.env.SUPABASE_URL_PROD : process.env.SUPABASE_URL_NONPROD;
const pool = new Pool({
  connectionString: supabaseUrl,
  ssl: { rejectUnauthorized: false },
});

const db = drizzle(pool);

async function main() {
  await pool.query(`
    DO $$ 
    DECLARE 
      r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
      LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE;';
      END LOOP;
    END $$;
  `);
  await migrate(db, { migrationsFolder: './src/db/migrations' });
  await pool.end();
}

main().catch(console.error);