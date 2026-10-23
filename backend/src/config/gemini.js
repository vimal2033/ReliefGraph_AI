import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';

let aiClient = null;

if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
    console.log('[Gemini AI] GoogleGenAI client initialized successfully with API key.');
  } catch (err) {
    console.warn('[Gemini AI] Failed to initialize GoogleGenAI client:', err.message);
  }
} else {
  console.warn('[Gemini AI] GEMINI_API_KEY not set or placeholder. Smart heuristic fallback mode will assist.');
}

export function getGeminiClient() {
  return aiClient;
}

export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
