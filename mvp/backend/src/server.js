import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { leadsRouter } from './routes/leads.js';
import { billingRouter } from './routes/billing.js';
import { logger } from './lib/logger.js';

const app = express();
const PORT = Number(process.env.PORT || 8080);

app.use(cors());

// NOTE: keep JSON parser before non-webhook routes
app.use('/api/billing/webhook', (req, res, next) => next());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime(), env: process.env.NODE_ENV || 'development' });
});

app.use('/api/leads', leadsRouter);
app.use('/api/billing', billingRouter);

app.use((err, req, res, next) => {
  logger.error('unhandled_error', { error: err.message });
  res.status(500).json({ error: 'Internal error' });
});

app.listen(PORT, () => logger.info('server_started', { port: PORT }));
