// api/stay-in-touch.js
// Vercel serverless function — receives stay-in-touch form submissions.
// Checks honeypot, writes to Supabase leads table with source 'stay_in_touch'.
// firm_name is not required for this submission path.

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, honeypot } = req.body;

  // Honeypot check — bots fill hidden fields, humans don't
  if (honeypot) {
    return res.status(200).json({ ok: true });
  }

  // Basic required field validation
  if (!name || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { error } = await supabase.from('leads').insert({
    source:    'stay_in_touch',
    name:      name.trim(),
    email:     email.trim().toLowerCase(),
    firm_name: null,
    status:    'new',
  });

  if (error) {
    console.error('Supabase leads insert error:', error);
    return res.status(500).json({ error: 'Failed to save submission' });
  }

  return res.status(200).json({ ok: true });
};