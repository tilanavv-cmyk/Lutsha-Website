# Lutsha Training-First Website

Responsive multi-page website for `lutsha.org.za`, including the **Lutsha Beyond — International Skills, Mobility & Exchange Programme** page.

## Included pages

- Home
- Solutions
- Lutsha Beyond (`/lutsha-beyond/`)
- Enrolments
- Join Us
- Contact Us
- Custom 404 page

## Technology

- Static HTML, CSS and JavaScript
- Node build script copies `/site` to `/dist`
- Cloudflare Workers + Static Assets for hosting/runtime
- Cloudflare Worker endpoint at `/api/submit-form`
- Supabase for form storage
- Resend for email notifications

## Local static preview

```bash
npm run build
npm run preview
```

Open `http://localhost:4173`.

## Local Cloudflare Worker preview

```bash
npm install
npm run dev
```

## Cloudflare deployment

See `CLOUDFLARE_DEPLOYMENT.md` for the staged migration checklist. Production DNS should only be moved after the `workers.dev` deployment and all existing DNS records have been verified.

## Form configuration

1. Run `supabase-schema.sql` in the Supabase SQL Editor.
2. Add Worker runtime variables/secrets using `.env.example` as the name checklist.
3. Use a verified Resend sending domain in `RESEND_FROM_EMAIL`.
4. Keep Supabase secret/service-role keys and the Resend API key out of GitHub.

The Worker attempts Supabase storage and Resend notification independently. A submission succeeds when at least one configured delivery path succeeds.

## Portal links

- Programmes and self-application: `https://study.lutsha.org.za/`
- Assessment bookings: `https://bookings.lutsha.org.za/`
