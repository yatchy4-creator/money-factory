import OpenAI from 'openai';
import { retryWithBackoff } from './retry.js';
import { logger } from './logger.js';

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

export const openai = apiKey ? new OpenAI({ apiKey }) : null;

export async function generateFollowupMessage({ businessName, leadName, leadSource, serviceType }) {
  if (!apiKey || !openai) {
    throw new Error('OPENAI_API_KEY is missing');
  }

  return retryWithBackoff(async () => {
    const prompt = `You write short, conversion-focused SMB follow-up messages.\nBusiness: ${businessName}\nLead Name: ${leadName}\nLead Source: ${leadSource}\nService: ${serviceType}\nReturn JSON: {"sms":"...","emailSubject":"...","emailBody":"..."}`;

    const response = await openai.responses.create({
      model,
      input: prompt,
      text: { format: { type: 'json_object' } }
    });

    const text = response.output_text || '{}';
    return JSON.parse(text);
  }, {
    maxAttempts: Number(process.env.MAX_RETRIES || 4),
    baseMs: Number(process.env.RETRY_BASE_MS || 500),
    shouldRetry: (error) => /timeout|rate|429|5\d\d/i.test(error.message),
    onRetry: ({ attempt, waitMs, error }) => logger.warn('retrying_openai', { attempt, waitMs, error })
  });
}
