const clean = (value, max = 3000) => String(value ?? '').trim().slice(0, max);
const safeEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(value, 320));
const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const json = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  },
});

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

async function storeInSupabase(payload, env) {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
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

async function resendEmail(env, message) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) return { skipped: true };
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: env.RESEND_FROM_EMAIL, ...message }),
  });

  if (!response.ok) throw new Error(`Resend email failed: ${await response.text()}`);
  return { sent: true };
}

function subjectFor(payload) {
  if (payload.form_type === 'join-us') return `New Join Us expression of interest: ${payload.full_name}`;
  if (payload.form_type === 'lutsha-beyond') return `New Lutsha Beyond enquiry: ${payload.audience || payload.full_name}`;
  return `New website enquiry: ${payload.enquiry_type || payload.full_name}`;
}

async function sendWithResend(payload, env) {
  const to = payload.form_type === 'lutsha-beyond'
    ? (env.LUTSHA_BEYOND_EMAIL || env.LUTSHA_INBOX_EMAIL || 'info@lutsha.org.za')
    : (env.LUTSHA_INBOX_EMAIL || 'info@lutsha.org.za');

  const labels = {
    full_name: 'Full name',
    email: 'Email',
    phone: 'Phone',
    location: 'Location',
    country: 'Country / location',
    organisation: 'Organisation',
    audience: 'Enquiring as',
    interest_area: 'Area of interest',
    role: 'Role of interest',
    expertise: 'Area of expertise',
    qualification: 'Qualification',
    registration: 'Professional / assessor registration',
    profile_url: 'Profile or CV link',
    enquiry_type: 'Enquiry type',
    message: 'Message',
    submitted_at: 'Submitted at',
  };

  const rows = Object.entries(payload)
    .filter(([key, value]) => labels[key] && value)
    .map(([key, value]) => `<tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;font-weight:700;vertical-align:top;color:#0b2852">${escapeHtml(labels[key])}</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;vertical-align:top;color:#334155">${escapeHtml(value)}</td></tr>`)
    .join('');

  const subject = subjectFor(payload);
  const teamNotification = await resendEmail(env, {
    to: [to],
    reply_to: payload.email,
    subject,
    html: `<div style="font-family:Arial,sans-serif;max-width:720px;margin:auto"><div style="height:6px;border-radius:6px;background:linear-gradient(90deg,#00a86b,#00a7c8,#1976d2,#ef3340,#ff8a00,#ffd11a)"></div><h2 style="color:#0b2852">${escapeHtml(subject)}</h2><table style="border-collapse:collapse;width:100%">${rows}</table><p style="color:#64748b;font-size:12px;margin-top:24px">Submitted through lutsha.org.za</p></div>`,
  });

  if (payload.form_type === 'lutsha-beyond') {
    try {
      await resendEmail(env, {
        to: [payload.email],
        subject: 'We received your Lutsha Beyond enquiry',
        html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#334155"><div style="height:6px;border-radius:6px;background:linear-gradient(90deg,#00a86b,#00a7c8,#1976d2,#ef3340,#ff8a00,#ffd11a)"></div><h2 style="color:#0b2852">GO BEYOND.</h2><p>Hello ${escapeHtml(payload.full_name)},</p><p>Thank you for contacting Lutsha Beyond — International Skills, Mobility &amp; Exchange Programme. We have received your enquiry and the Lutsha team will review it and respond using the contact details you provided.</p><p style="font-weight:700;color:#0b2852">Learn here. Go anywhere.</p><p style="font-size:12px;color:#64748b">Lutsha Institute of Professional Learning · South Africa</p></div>`,
      });
    } catch (error) {
      console.error('Acknowledgement email failed', error);
    }
  }

  return teamNotification;
}

async function handleSubmit(request, env) {
  try {
    const raw = await request.json();
    const formType = clean(raw.formType, 40);
    const fullName = clean(raw.fullName, 180);
    const email = clean(raw.email, 320).toLowerCase();
    const message = clean(raw.message, 5000);

    if (!['contact', 'join-us', 'lutsha-beyond'].includes(formType)) {
      return json(400, { error: 'Invalid form type.' });
    }
    if (clean(raw.website, 200)) return json(200, { ok: true });
    if (!fullName || !safeEmail(email) || !message) {
      return json(400, { error: 'Please complete all required fields.' });
    }

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
      user_agent: clean(request.headers.get('user-agent'), 500),
    };

    if (!payload.consent) return json(400, { error: 'Consent is required.' });
    if (formType === 'lutsha-beyond' && !payload.audience) {
      return json(400, { error: 'Please select how you are enquiring.' });
    }

    const results = await Promise.allSettled([
      storeInSupabase(payload, env),
      sendWithResend(payload, env),
    ]);

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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
      return json(200, { ok: true });
    }

    if (url.pathname === '/api/submit-form') {
      if (request.method !== 'POST') return json(405, { error: 'Method not allowed.' });
      return handleSubmit(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
