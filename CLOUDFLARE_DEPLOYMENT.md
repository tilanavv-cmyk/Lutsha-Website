# Lutsha Website — Cloudflare Workers Deployment

This repository is prepared for Cloudflare Workers with Static Assets. The public website remains a static multi-page site, while `/api/submit-form` runs in a Cloudflare Worker and connects to Supabase and Resend.

## Architecture

- Source: GitHub
- Build output: `dist/`
- Runtime/hosting: Cloudflare Workers + Static Assets
- Database: Supabase
- Transactional email: Resend
- Registrar: RegisterDomain.co.za can remain the registrar
- DNS: migrate the `lutsha.org.za` zone to Cloudflare before attaching the production custom domain

## 1. Supabase

Run `supabase-schema.sql` in the Supabase SQL Editor. This keeps the existing website tables and adds `public.website_beyond_interest`.

## 2. Cloudflare runtime variables and secrets

Configure these on the Worker under **Settings → Variables & Secrets**:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `LUTSHA_INBOX_EMAIL`
- optional `LUTSHA_BEYOND_EMAIL`

Do not put secret values into GitHub.

## 3. GitHub → Cloudflare Workers Builds

Create/connect a Worker to this GitHub repository.

Recommended settings:

- Production branch: `main`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Root directory: repository root

`wrangler.jsonc` deploys the contents of `dist/` as Static Assets and routes `/api/*` through `worker/index.js`.

## 4. Test before the live DNS cutover

Test the Cloudflare `workers.dev` deployment first:

- `/`
- `/solutions/`
- `/enrolments/`
- `/join-us/`
- `/contact/`
- `/lutsha-beyond/`
- custom 404 behaviour
- Contact form
- Join Us form
- Lutsha Beyond form
- Supabase row creation
- Resend internal notification
- Lutsha Beyond acknowledgement email
- desktop and mobile navigation

## 5. DNS safety before switching nameservers

Before changing nameservers at RegisterDomain.co.za, copy/verify every current DNS record in Cloudflare, especially records used by:

- `lutsha.org.za`
- `www.lutsha.org.za`
- `study.lutsha.org.za`
- `learn.lutsha.org.za`
- `bookings.lutsha.org.za`
- email/MX records
- SPF/DKIM/DMARC
- Resend verification records
- any Supabase or other service-specific records

Only switch the registrar nameservers after the Cloudflare zone contains the required records.

## 6. Production custom domain

After the zone is active in Cloudflare and the preview is approved, attach `lutsha.org.za` (and `www.lutsha.org.za` as appropriate) to the Worker using Cloudflare Custom Domains.

Do not add production routes to `wrangler.jsonc` until DNS ownership and the intended `www` canonical behaviour have been confirmed.

## Rollback note

The legacy Netlify configuration has intentionally been left in the repository during migration. It can be removed after the Cloudflare production cutover has been verified.

<!-- Preview build trigger: 2026-09-11 -->
