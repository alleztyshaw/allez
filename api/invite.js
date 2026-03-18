// api/invite.js
// Vercel serverless function — sends a Supabase magic-link invite
// Accepts optional first_name + last_name to pre-populate the invitee's org_members row

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    email,
    role = 'advisor',
    org_id,
    first_name = '',
    last_name = '',
  } = req.body;

  if (!email || !org_id) {
    return res.status(400).json({ error: 'email and org_id are required.' });
  }

  try {
    // Send Supabase magic-link invite — stores org_id + role in user metadata
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email.trim().toLowerCase(),
      {
        data: { org_id, role },
        redirectTo: `${process.env.APP_URL}/welcome`,
      }
    );

    if (inviteError) {
      console.error('Supabase invite error:', inviteError);
      return res.status(400).json({ error: inviteError.message });
    }

    const userId = inviteData?.user?.id;
    if (!userId) {
      return res.status(500).json({ error: 'Invite sent but user ID not returned.' });
    }

    // Upsert org_members row — creates it with optional name fields pre-populated
    // onboarding_complete stays false until the user completes the Welcome page
    const { error: memberError } = await supabaseAdmin
      .from('org_members')
      .upsert({
        user_id: userId,
        org_id,
        role,
        first_name: first_name.trim() || null,
        last_name: last_name.trim() || null,
        onboarding_complete: false,
      }, { onConflict: 'user_id,org_id' });

    if (memberError) {
      console.error('org_members upsert error:', memberError);
      // Non-fatal — invite was sent, member row failed. Log but don't block.
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('invite handler error:', err);
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}