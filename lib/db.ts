import { Pool } from 'pg';
import { config } from './config';

const pool = new Pool({
  connectionString: config.databaseUrl,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);