const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  },
  body: JSON.stringify(body),
});

const clean = (value, max = 3000) => String(value ?? '').trim().slice(0, max);
const safeEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(value, 320));
const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

function tableConfig(formType) {
  if (formType === 'join-us') {
    return {
      table: 'website_join_interest',
      allowed: ['form_type','full_name','email','phone','location','role','expertise','qualification','registration','profile_url','message','consent','submitted_at','user_agent'],
    };
  }
  if (formType === 'lutsha-beyond') {
    return {
      table: 'website_beyond_interest',
      allowed: ['form_type','full_name','email','phone','country','organisation','audience','interest_area','message','consent','submitted_at','user_agent'],
    };
  }
  return {
    table: 'website_enquiries',
    allowed: ['form_type','full_name','email','phone','enquiry_type','message','consent','submitted_at','user_agent'],
  };
}

async function storeInSupabase(payload) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { skipped: true };

  const { table, allowed } = tableConfig(payload.form_type);
  const record = Object.fromEntries(allowed.map((keyName) => [keyName, payload[keyName] ?? null]));
  const headers = {
    apikey: key,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
  };
  if (!key.startsWith('sb_secret_')) headers.Authorization = `Bearer ${key}`;

  const response = await fetch(`${url}/rest/v1/${table}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(record),
  });
  if (!response.ok) throw new Error(`Supabase storage failed: ${await response.text()}`);
  return { stored: true };
}

async function resendEmail(message) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return { skipped: true };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, ...message }),
  });
  if (!response.ok) throw new Error(`Resend notification failed: ${await response.text()}`);
  return { sent: true };
}

function subjectFor(payload) {
  if (payload.form_type === 'join-us') return `New Join Us expression of interest: ${payload.full_name}`;
  if (payload.form_type === 'lutsha-beyond') return `New Lutsha Beyond enquiry: ${payload.audience || payload.full_name}`;
  return `New website enquiry: ${payload.enquiry_type || payload.full_name}`;
}

async function sendWithResend(payload) {
  const to = payload.form_type === 'lutsha-beyond'
    ? (process.env.LUTSHA_BEYOND_EMAIL || process.env.LUTSHA_INBOX_EMAIL || 'info@lutsha.org.za')
    : (process.env.LUTSHA_INBOX_EMAIL || 'info@lutsha.org.za');

  const labels = {
    full_name: 'Full name', email: 'Email', phone: 'Phone', location: 'Location',
    country: 'Country / location', organisation: 'Organisation', audience: 'Enquiring as',
    interest_area: 'Area of interest', role: 'Role of interest', expertise: 'Area of expertise',
    qualification: 'Qualification', registration: 'Professional / assessor registration',
    profile_url: 'Profile or CV link', enquiry_type: 'Enquiry type', message: 'Message',
    submitted_at: 'Submitted at',
  };
  const rows = Object.entries(payload)
    .filter(([key, value]) => labels[key] && value)
    .map(([key, value]) => `<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:600">${escapeHtml(labels[key])}</td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(value)}</td></tr>`)
    .join('');

  const subject = subjectFor(payload);
  const teamNotification = await resendEmail({
    to: [to],
    reply_to: payload.email,
    subject,
    html: `<div style="font-family:Arial,sans-serif;max-width:720px;margin:auto"><h2 style="color:#092b59">${escapeHtml(subject)}</h2><table style="border-collapse:collapse;width:100%">${rows}</table><p style="color:#64748b;font-size:12px;margin-top:24px">Submitted through lutsha.org.za</p></div>`,
  });

  if (payload.form_type === 'lutsha-beyond') {
    try {
      await resendEmail({
        to: [payload.email],
        subject: 'We received your Lutsha Beyond enquiry',
        html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#334155"><h2 style="color:#092b59">GO BEYOND.</h2><p>Hello ${escapeHtml(payload.full_name)},</p><p>Thank you for contacting Lutsha Beyond — International Skills, Mobility &amp; Exchange Programme. We have received your enquiry and the Lutsha team will respond using the contact details you provided.</p><p style="font-weight:700;color:#092b59">Learn here. Go anywhere.</p></div>`,
      });
    } catch (error) {
      console.error('Acknowledgement email failed', error);
    }
  }

  return teamNotification;
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });

  try {
    const raw = JSON.parse(event.body || '{}');
    const formType = clean(raw.formType, 40);
    const fullName = clean(raw.fullName, 180);
    const email = clean(raw.email, 320).toLowerCase();
    const message = clean(raw.message, 5000);

    if (!['contact', 'join-us', 'lutsha-beyond'].includes(formType)) return json(400, { error: 'Invalid form type.' });
    if (clean(raw.website, 200)) return json(200, { ok: true });
    if (!fullName || !safeEmail(email) || !message) return json(400, { error: 'Please complete all required fields.' });

    const payload = {
      form_type: formType,
      full_name: fullName,
      email,
      phone: clean(raw.phone, 80),
      location: clean(raw.location, 180),
      country: clean(raw.country, 180),
      organisation: clean(raw.organisation, 240),
      audience: clean(raw.audience, 180),
      interest_area: clean(raw.interestArea, 240),
      role: clean(raw.role, 180),
      expertise: clean(raw.expertise, 240),
      qualification: clean(raw.qualification, 300),
      registration: clean(raw.registration, 300),
      profile_url: clean(raw.profileUrl, 1000),
      enquiry_type: clean(raw.enquiryType, 180),
      message,
      consent: raw.consent === 'yes',
      submitted_at: new Date().toISOString(),
      user_agent: clean(event.headers?.['user-agent'], 500),
    };

    if (!payload.consent) return json(400, { error: 'Consent is required.' });
    if (formType === 'lutsha-beyond' && !payload.audience) return json(400, { error: 'Please select how you are enquiring.' });

    const results = await Promise.allSettled([storeInSupabase(payload), sendWithResend(payload)]);
    const configuredSuccesses = results.filter((result) => result.status === 'fulfilled' && !result.value?.skipped);
    const failures = results.filter((result) => result.status === 'rejected');

    if (configuredSuccesses.length === 0 && failures.length === 0) {
      return json(503, { error: 'The form service is not configured yet. Please email info@lutsha.org.za.' });
    }
    if (configuredSuccesses.length === 0 && failures.length > 0) throw failures[0].reason;
    failures.forEach((result) => console.error(result.reason));
    return json(200, { ok: true });
  } catch (error) {
    console.error(error);
    return json(500, { error: 'We could not process your submission. Please try again or email info@lutsha.org.za.' });
  }
}
