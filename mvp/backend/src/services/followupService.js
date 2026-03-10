import { generateFollowupMessage } from '../lib/openaiClient.js';
import { logger } from '../lib/logger.js';
import { sendEmail } from './emailService.js';

export async function buildFollowupPayload(lead) {
  try {
    return await generateFollowupMessage({
      businessName: lead.businessName,
      leadName: lead.leadName,
      leadSource: lead.leadSource,
      serviceType: lead.serviceType
    });
  } catch (error) {
    logger.error('openai_failed_using_fallback', { error: error.message, leadId: lead.id });
    // Self-healing fallback template
    return {
      sms: `Hi ${lead.leadName || 'there'}, thanks for contacting ${lead.businessName}. We missed you—want to book a quick call?`,
      emailSubject: `Quick follow-up from ${lead.businessName}`,
      emailBody: `We missed your message and would love to help. Reply here or use our booking link.`
    };
  }
}

export async function dispatchFollowup(lead, payload, correlationId) {
  const emailResult = await sendEmail({
    to: lead.leadEmail,
    subject: payload.emailSubject,
    text: payload.emailBody,
    html: `<p>${payload.emailBody}</p>`,
    correlationId
  });

  logger.info('dispatch_followup', {
    leadId: lead.id,
    channels: ['sms', 'email'],
    emailMode: emailResult.mode,
    emailProvider: emailResult.provider,
    emailDelivered: emailResult.delivered
  });

  return {
    delivered: true,
    channels: ['sms', 'email'],
    payload,
    email: emailResult
  };
}
