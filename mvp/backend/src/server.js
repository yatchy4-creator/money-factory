import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { leadsRouter } from './routes/leads.js';
import { billingRouter } from './routes/billing.js';
import { logger } from './lib/logger.js';

const app = express();
const PORT = Number(process.env.PORT || 8080);

app.use(cors());

const jsonParser = express.json({ limit: '1mb' });
// Stripe signature verification needs raw body; skip JSON parser on webhook route.
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/billing/webhook')) return next();
  return jsonParser(req, res, next);
});

app.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime(), env: process.env.NODE_ENV || 'development' });
});

app.use('/api/leads', leadsRouter);
app.use('/api/billing', billingRouter);

app.use((err, req, res, next) => {
  if (err?.type === 'entity.parse.failed') {
    logger.warn('bad_json_payload', { error: err.message });
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  logger.error('unhandled_error', { error: err.message });
  res.status(500).json({ error: 'Internal error' });
});

app.listen(PORT, () => logger.info('server_started', { port: PORT }));
