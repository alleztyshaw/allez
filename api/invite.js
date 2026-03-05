// api/invite.js
// Sends a Supabase magic link invite to a new team member and pre-creates
// their org_members row so they land in the right org with the right role.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, role, org_id } = req.body;

  if (!email || !role || !org_id) {
    return res.status(400).json({ error: 'email, role, and org_id are required' });
  }

  const VALID_ROLES = ['admin', 'manager', 'advisor', 'associate', 'compliance'];
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const supabaseUrl  = process.env.REACT_APP_SUPABASE_URL;
  const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Server misconfigured — missing env vars' });
  }

  try {
    // 1. Send magic link invite via Supabase Admin API
    const inviteRes = await fetch(`${supabaseUrl}/auth/v1/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        email,
        data: { org_id, role, onboarding_complete: false },
      }),
    });

    const inviteData = await inviteRes.json();

    if (!inviteRes.ok) {
      return res.status(400).json({ error: inviteData.msg || inviteData.message || 'Invite failed' });
    }

    const newUserId = inviteData.id;

    // 2. Pre-create org_members row so RLS works on first login
    if (newUserId) {
      const memberRes = await fetch(`${supabaseUrl}/rest/v1/org_members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Prefer': 'resolution=ignore-duplicates',
        },
        body: JSON.stringify({ org_id, user_id: newUserId, role }),
      });

      if (!memberRes.ok) {
        console.error('Failed to pre-create org_members row');
      }
    }

    return res.status(200).json({ success: true, email });

  } catch (err) {
    console.error('Invite error:', err);
    return res.status(500).json({ error: 'Invite failed', detail: err.message });
  }
}