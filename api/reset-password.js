// api/reset-password.js
// Vercel serverless function — generates a Supabase password reset link
// and sends a branded HTML email via Resend.

const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const supabaseAdmin = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

function buildResetEmail({ actionLink }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Reset your Allez HQ password</title>
</head>
<body style="margin:0;padding:0;background-color:#F8F4EE;font-family:-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#F8F4EE;">
    <tr>
      <td align="center" style="padding:56px 20px 72px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:520px;">

          <!-- Eyebrow -->
          <tr>
            <td style="padding-bottom:16px;">
              <p style="margin:0;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.18em;color:#29C47A;font-family:-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif;">
                Password reset
              </p>
            </td>
          </tr>

          <!-- Accent rule -->
          <tr>
            <td style="padding-bottom:28px;">
              <div style="width:36px;height:2px;background-color:#29C47A;border-radius:1px;"></div>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td style="padding-bottom:20px;">
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:40px;font-weight:300;color:#1A1410;line-height:1.15;letter-spacing:0.01em;">
                Reset your<br>password
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding-bottom:36px;">
              <p style="margin:0;font-size:15px;font-weight:300;line-height:1.8;color:#7A7068;font-family:-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif;">
                We received a request to reset your Allez HQ password. Click the button below to choose a new one.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding-bottom:48px;">
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="background-color:#29C47A;border-radius:10px;">
                    <a href="${actionLink}"
                       style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.02em;font-family:-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif;">
                      Reset Password &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding-bottom:24px;">
              <div style="height:1px;background:#EDE6DB;"></div>
            </td>
          </tr>

          <!-- Link fallback -->
          <tr>
            <td style="padding-bottom:32px;">
              <p style="margin:0;font-size:12px;color:#C0B5A8;line-height:1.65;font-family:-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif;">
                Button not working? Paste this into your browser:<br>
                <a href="${actionLink}" style="color:#29C47A;word-break:break-all;text-decoration:none;">${actionLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td>
              <p style="margin:0 0 6px;font-size:12px;font-weight:300;color:#C0B5A8;line-height:1.65;font-family:-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif;">
                Allez HQ · allezhq.com
              </p>
              <p style="margin:0;font-size:11px;color:#C0B5A8;font-family:-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif;">
                This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email is required.' });

  try {
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email.trim().toLowerCase(),
      options: {
        redirectTo: `${process.env.APP_URL}/reset-password`,
      },
    });

    if (linkError) {
      console.error('generateLink error:', linkError);
      // Return generic success to avoid leaking which emails are registered
      return res.status(200).json({ success: true });
    }

    const actionLink = linkData?.properties?.action_link;
    if (!actionLink) return res.status(200).json({ success: true });

    await resend.emails.send({
      from:    'Allez HQ <team@allezhq.com>',
      to:      email.trim().toLowerCase(),
      subject: 'Reset your Allez HQ password',
      html:    buildResetEmail({ actionLink }),
    });

    // Always return success — don't reveal whether the email exists
    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('reset-password handler error:', err);
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}