// lib/xai.ts
import OpenAI from 'openai';

const xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1', // Confirm endpoint in xAI docs at https://x.ai/api
});

export default xai;