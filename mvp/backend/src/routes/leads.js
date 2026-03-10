import express from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../data/store.js';
import { processLead } from '../services/queueWorker.js';

export const leadsRouter = express.Router();

leadsRouter.get('/', (req, res) => {
  res.json({ leads: [...db.leads.values()], deadLetter: db.deadLetter.length });
});

leadsRouter.post('/', async (req, res) => {
  const correlationId = req.headers['x-correlation-id'] || uuid();
  try {
    const lead = {
      id: uuid(),
      leadName: req.body.leadName || 'Prospect',
      businessName: req.body.businessName || 'Your Business',
      leadSource: req.body.leadSource || 'web_form',
      serviceType: req.body.serviceType || 'consultation',
      leadEmail: req.body.leadEmail || req.body.email || '',
      createdAt: new Date().toISOString(),
      status: 'new'
    };

    db.leads.set(lead.id, lead);
    const result = await processLead(lead, correlationId);

    lead.status = 'contacted';
    res.status(201).json({ lead, result, correlationId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process lead', correlationId, detail: error.message });
  }
});
