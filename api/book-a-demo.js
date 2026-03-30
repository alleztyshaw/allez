// api/book-a-demo.js
// Vercel serverless function — receives demo booking form submissions.
// Checks honeypot, writes to Supabase leads table via service role key.
// TODO: Add Turnstile verification once TURNSTILE_SECRET_KEY env var is set.

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name, email, firmName, phone,
    features, currentTools, otherTools,
    numAdvisors, message,
    honeypot,
  } = req.body;

  // Honeypot check — bots fill hidden fields, humans don't
  if (honeypot) {
    // Return 200 silently — don't tip off bots that they were caught
    return res.status(200).json({ ok: true });
  }

  // Basic required field validation
  if (!name || !email || !firmName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // TODO: Turnstile verification
  // const turnstileToken = req.body.turnstileToken;
  // const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: turnstileToken }),
  // });
  // const verifyData = await verifyRes.json();
  // if (!verifyData.success) return res.status(400).json({ error: 'CAPTCHA verification failed' });

  const { error } = await supabase.from('leads').insert({
    source:        'book_a_demo',
    name:          name.trim(),
    email:         email.trim().toLowerCase(),
    firm_name:     firmName.trim(),
    phone:         phone?.trim() || null,
    features:      features?.length ? features : null,
    current_tools: currentTools?.length ? currentTools : null,
    other_tools:   otherTools?.trim() || null,
    num_advisors:  numAdvisors || null,
    message:       message?.trim() || null,
    status:        'new',
  });

  if (error) {
    console.error('Supabase leads insert error:', error);
    return res.status(500).json({ error: 'Failed to save submission' });
  }

  return res.status(200).json({ ok: true });
};