# Lutsha Training-First Website

A responsive, multi-page website prepared for `lutsha.org.za`. It places Lutsha Institute of Professional Learning and its training services at the centre of the brand while retaining E-Learning Development and SMME Development as supporting solutions.

## Included pages

- Home
- Solutions
- Enrolments
- Join Us
- Contact Us
- Custom 404 page

## Portal links

- All programmes and self-application portal: `https://study.lutsha.org.za/`
  - Includes accredited occupational qualifications and non-accredited practical courses
- Assessment booking portal: `https://bookings.lutsha.org.za/`

## Social media

- Instagram: `https://www.instagram.com/lutsha_training/`
- Facebook: `https://www.facebook.com/people/Lutsha-Empowerment/61579402142779/`

## Technology

- Static HTML, CSS and JavaScript
- No front-end framework or npm dependencies
- Netlify Functions for Contact and Join Us submissions
- Optional Supabase storage and Resend email notifications

## Local preview

```bash
npm run dev
```

Open `http://localhost:4173`.

## Netlify settings

The included `netlify.toml` sets:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- Node version: 20

No Base directory is required when this folder is the repository root.

## Configure forms

1. Run `supabase-schema.sql` in the Supabase SQL Editor.
2. Add the environment variables from `.env.example` in Netlify.
3. Use a verified Resend sending domain in `RESEND_FROM_EMAIL`.
4. Keep `SUPABASE_SERVICE_ROLE_KEY` private in Netlify environment variables.

The forms continue if either Supabase storage or Resend succeeds. A clear message is shown if neither service is configured.

## Before public launch

- Confirm the final list of programmes actively marketed on the website.
- Confirm programme entry requirements, duration, fees and intake dates.
- Confirm office hours shown on the Contact page.
- Connect the final Google Business map location.
- Add the approved Privacy Policy, PAIA/POPI Manual and website terms.
- Review image permissions and replace any temporary visual if required.
- Test all forms and both external portals on desktop and mobile.
