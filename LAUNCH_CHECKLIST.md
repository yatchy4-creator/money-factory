# Launch Checklist

## Pre-launch (T-3 to T-1 days)

- [ ] Production env vars set in Railway + Vercel (no placeholder values)
- [ ] `app.yourdomain.com` and `api.yourdomain.com` resolve in Cloudflare
- [ ] HTTPS valid for frontend/backend
- [ ] Stripe live products and prices created
- [ ] Stripe webhook connected and signing secret set
- [ ] Resend domain verified, SPF/DKIM passing
- [ ] Test lead flow succeeds end-to-end
- [ ] Health endpoint (`/health`) returns 200
- [ ] Error logs visible in Railway and monitored
- [ ] Rollback plan documented (previous deployment versions)

## Go-live day checklist

- [ ] Deploy backend to production branch
- [ ] Deploy frontend to production branch
- [ ] Run smoke test: lead POST + checkout creation
- [ ] Confirm webhook receives real Stripe test/live event
- [ ] Confirm first production follow-up email event logs correctly
- [ ] Confirm no critical errors in first 60 minutes

## Day-1 targets

- 99%+ API availability
- <2% failed lead-processing attempts
- Stripe webhook success rate > 99%
- First 5-10 real leads processed without manual intervention
- Confirm at least 1 successful follow-up send (or intentional logging mode)

## Day-7 targets

- 100+ leads processed end-to-end
- Dead-letter queue < 2% of total events
- Bounce rate < 3% and spam complaints < 0.1%
- Trial-to-paid checkout conversion baseline established
- Top 3 failure modes documented with fixes in RUNBOOK

## Post-launch follow-up

- [ ] Review logs and dead-letter events daily
- [ ] Tighten retry settings if repeated transient failures appear
- [ ] Move Stripe idempotency from in-memory set to Postgres table
- [ ] Add alerting for webhook failures and elevated 5xx rates
