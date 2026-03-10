# Email Outreach Setup (Resend) + Warm-up Plan

## 1) Sending domain setup

1. Use a dedicated sender domain or subdomain (recommended: `mail.yourdomain.com`).
2. In Resend, verify domain and publish SPF + DKIM records in Cloudflare.
3. Configure sender identity:
   - From name: `Money Factory`
   - From address: `noreply@yourdomain.com` (transactional)
   - Optional replies: `support@yourdomain.com`

## 2) Safety rules before sending

- Never buy contact lists.
- Use only opted-in or high-intent leads.
- Include clear opt-out language for outreach campaigns.
- Keep complaint and bounce rates low.

## 3) Recommended sending limits (first 4 weeks)

Assuming brand new sending domain/IP reputation.

- Days 1-3: **20-30 emails/day**
- Days 4-7: **40-60 emails/day**
- Week 2: **80-120 emails/day**
- Week 3: **150-250 emails/day**
- Week 4: **300-500 emails/day**

Only increase if:
- Bounce rate < 3%
- Spam complaint rate < 0.1%
- Positive engagement (opens/replies/clicks)

## 4) Warm-up schedule

- Start with highly engaged/internal friendly contacts.
- Mix transactional + low-volume outreach at first.
- Increase volume gradually every 2-3 days.
- Keep content simple and human (avoid spammy links/phrases).
- Avoid sudden spikes (e.g., 50 → 1000 in one day).

## 5) Content best practices

- Plain-text style works well during warm-up.
- One CTA per email.
- Keep subject lines natural (no all caps, no excessive punctuation).
- Keep link count low (1-2 links max).

## 6) Monitoring dashboard checklist (daily)

Track in Resend (or your BI):
- Delivered rate
- Bounce rate
- Complaint/spam rate
- Unsubscribe rate
- Reply rate

Pause scaling if metrics degrade for 48+ hours.

## 7) Operational fallback

If `RESEND_API_KEY` is missing or invalid, backend automatically logs instead of sending email. This prevents accidental silent failure while protecting from unauthorized sends.
