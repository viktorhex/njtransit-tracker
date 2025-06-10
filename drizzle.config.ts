import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

const parseSupabaseUrl = (url: string) => {
  //console.log('Parsing Supabase URL:', url);
  const match = url.match(/postgres(?:ql)?\:\/\/([^:]+):(.+?)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    //console.error('Regex failed to match URL:', url);
    throw new Error('Invalid Supabase URL');
  }
  //console.log('Parsed components:', { user: match[1], password: match[2], host: match[3], port: match[4], database: match[5] });
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
  };
};

const supabaseUrl = process.env.SUPABASE_URL_NONPROD || '';
const nonprodCredentials = parseSupabaseUrl(supabaseUrl);

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: nonprodCredentials.host,
    port: nonprodCredentials.port,
    user: nonprodCredentials.user,
    password: nonprodCredentials.password,
    database: nonprodCredentials.database,
    ssl: { rejectUnauthorized: false },
  },
});