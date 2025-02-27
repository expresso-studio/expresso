import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

if (!process.env.DEEPGRAM_API_KEY) {
  throw new Error('DEEPGRAM_API_KEY is required');
}

export const config = {
  databaseUrl: process.env.DATABASE_URL,
  deepgramApiKey: process.env.DEEPGRAM_API_KEY,
} as const;