import { logger } from '../lib/logger.js';

const EMAIL_PROVIDER = (process.env.EMAIL_PROVIDER || 'RESEND').toUpperCase();

function looksLikePlaceholder(value) {
  if (!value) return true;
  const normalized = String(value).trim().toLowerCase();
  return (
    normalized.endsWith('...') ||
    normalized.includes('yourdomain.com') ||
    normalized === 're_...' ||
    normalized === 'money factory <noreply@yourdomain.com>'
  );
}

async function sendWithResend({ to, subject, text, html, correlationId }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (looksLikePlaceholder(apiKey) || looksLikePlaceholder(from)) {
    logger.warn('email_send_skipped_missing_resend_config', {
      hasApiKey: Boolean(apiKey),
      hasFrom: Boolean(from),
      to,
      correlationId
    });

    return {
      delivered: false,
      mode: 'log',
      provider: 'RESEND',
      reason: 'missing_resend_config'
    };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      html
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    logger.error('email_send_resend_failed_fallback_log', {
      status: response.status,
      detail,
      to,
      correlationId
    });

    return {
      delivered: false,
      mode: 'log',
      provider: 'RESEND',
      reason: `resend_error_${response.status}`
    };
  }

  const data = await response.json();
  return {
    delivered: true,
    mode: 'api',
    provider: 'RESEND',
    messageId: data.id
  };
}

export async function sendEmail({ to, subject, text, html, correlationId }) {
  if (!to) {
    logger.info('email_send_skipped_no_recipient', { correlationId });
    return { delivered: false, mode: 'log', provider: EMAIL_PROVIDER, reason: 'missing_recipient' };
  }

  if (EMAIL_PROVIDER === 'RESEND') {
    return sendWithResend({ to, subject, text, html, correlationId });
  }

  logger.info('email_send_logged_only', {
    provider: EMAIL_PROVIDER,
    to,
    subject,
    correlationId
  });

  return {
    delivered: false,
    mode: 'log',
    provider: EMAIL_PROVIDER,
    reason: 'provider_not_supported'
  };
}
