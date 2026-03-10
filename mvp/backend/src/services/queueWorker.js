import { retryWithBackoff } from '../lib/retry.js';
import { logger } from '../lib/logger.js';
import { db } from '../data/store.js';
import { buildFollowupPayload, dispatchFollowup } from './followupService.js';

export async function processLead(lead, correlationId) {
  try {
    const payload = await buildFollowupPayload(lead);

    const result = await retryWithBackoff(async () => {
      const out = await dispatchFollowup(lead, payload, correlationId);
      if (!out.delivered) throw new Error('delivery_failed');
      return out;
    }, {
      maxAttempts: Number(process.env.MAX_RETRIES || 4),
      baseMs: Number(process.env.RETRY_BASE_MS || 500),
      shouldRetry: () => true,
      onRetry: ({ attempt, waitMs, error }) => logger.warn('retrying_dispatch', { attempt, waitMs, error, correlationId })
    });

    db.events.push({ type: 'lead_processed', leadId: lead.id, ts: Date.now(), correlationId });
    return result;
  } catch (error) {
    db.deadLetter.push({ lead, error: error.message, ts: Date.now(), correlationId });
    logger.error('lead_to_dead_letter', { leadId: lead.id, error: error.message, correlationId });
    throw error;
  }
}
