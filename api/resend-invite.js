// api/resend-invite.js
// Vercel serverless function — resends a Supabase magic-link invite for a pending user
// Calling inviteUserByEmail on an existing unconfirmed user issues a fresh link

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, org_id, role } = req.body;

  if (!email || !org_id) {
    return res.status(400).json({ error: 'email and org_id are required.' });
  }

  try {
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email.trim().toLowerCase(),
      {
        data: { org_id, role },
        redirectTo: `${process.env.APP_URL}/welcome`,
      }
    );

    if (error) {
      console.error('Supabase resend invite error:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('resend-invite handler error:', err);
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}