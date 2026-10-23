import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
try {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
} catch (e) {
  // Ignore path resolve errors
}

const apiKey = process.env.GEMINI_API_KEY || '';

let aiClient = null;

if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
    console.log('[Gemini AI] GoogleGenAI client initialized successfully.');
  } catch (err) {
    console.warn('[Gemini AI] Failed to initialize GoogleGenAI client:', err.message);
  }
} else {
  console.log('[Gemini AI] GEMINI_API_KEY not set or placeholder. Smart heuristic fallback mode will assist.');
}

export function getGeminiClient() {
  return aiClient;
}

export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
