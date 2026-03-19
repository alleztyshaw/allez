// api/draft-email.js
const CLAUDE_MODEL = 'claude-haiku-4-5-20251001'; // Update in hqConstants and here together

// Vercel serverless function — generates a client-facing follow-up email draft
// from an AI note summary. De-identifies before Anthropic call, re-identifies on return.

import { createClient } from '@supabase/supabase-js';

const SYSTEM_PROMPT = `You are a professional financial advisor assistant. You will receive structured notes from a client meeting that have been de-identified — names replaced with tokens like CLIENT_NAME, ADVISOR_1, AMOUNT_REDACTED, etc.

Generate a concise follow-up email draft based on the provided meeting content and instructions.

Return ONLY a valid JSON object — no preamble, no explanation, no markdown. Directly parseable by JSON.parse().

Required format:
{
  "subject": "Concise, professional email subject line",
  "body": "Full email body text"
}

Rules:
- Preserve all tokens exactly as written — do not replace or guess names
- Match the requested tone exactly: Formal = Dear/Sincerely, Professional = Hi/Best regards, Conversational = Hey/Talk soon
- Only include sections explicitly requested in the instructions
- Write in first person as the advisor
- Do not include a salutation line in the body — it will be prepended separately
- Do not include a sign-off line — it will be appended separately
- Body should be just the email content paragraphs
- BE CONCISE — the entire email body should rarely exceed 150 words
- No padding, no pleasantries beyond what is natural, no restating what was already said
- One short paragraph per included section — decisions as a brief inline list if more than one
- If only one section is included, a single short paragraph is sufficient`;

function deidentify(text, entities) {
  let result = text;
  for (const { original, token } of entities) {
    const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), token);
  }
  // Only strip contact info — amounts are kept since this is a client-facing email
  result = result.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, 'EMAIL_REDACTED');
  result = result.replace(/\b\d{3}[-.\\s]?\d{3}[-.\\s]?\d{4}\b/g, 'PHONE_REDACTED');
  return result;
}

function reidentify(str, entities) {
  const reversed = [...entities].sort((a, b) => a.original.length - b.original.length);
  for (const { original, token } of reversed) {
    const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    str = str.replace(new RegExp(escapedToken, 'g'), original
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
    );
  }
  return str;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API key not configured.' });
  }

  const {
    ai_summary,       // { summary, decisions, action_items, follow_ups }
    client_name,      // full name string
    advisor_name,     // full name string
    salutation,       // e.g. "Hi Barbara" — prepended to final body
    sign_off,         // e.g. "Best," — appended to final body
    tone,             // 'formal' | 'professional' | 'conversational'
    include,          // array: ['summary', 'decisions', 'action_items', 'follow_ups']
  } = req.body;

  if (!ai_summary || !include?.length) {
    return res.status(400).json({ error: 'ai_summary and include sections are required.' });
  }

  try {
    // Build entity map for de-identification
    const entities = [];
    if (client_name?.trim()) {
      entities.push({ original: client_name.trim(), token: 'CLIENT_NAME' });
      const parts = client_name.trim().split(/\s+/);
      if (parts.length >= 2) {
        entities.push({ original: parts[0], token: 'CLIENT_NAME' });
        entities.push({ original: parts[parts.length - 1], token: 'CLIENT_NAME' });
      }
    }
    if (advisor_name?.trim()) {
      entities.push({ original: advisor_name.trim(), token: 'ADVISOR_NAME' });
      const parts = advisor_name.trim().split(/\s+/);
      if (parts.length >= 2) {
        entities.push({ original: parts[0], token: 'ADVISOR_NAME' });
        entities.push({ original: parts[parts.length - 1], token: 'ADVISOR_NAME' });
      }
    }
    entities.sort((a, b) => b.original.length - a.original.length);

    // Build content string from selected sections
    const sections = [];
    if (include.includes('summary') && ai_summary.summary) {
      sections.push(`Meeting Summary:\n${deidentify(ai_summary.summary, entities)}`);
    }
    if (include.includes('decisions') && ai_summary.decisions?.length) {
      sections.push(`Key Decisions:\n${ai_summary.decisions.map(d => `- ${deidentify(d, entities)}`).join('\n')}`);
    }
    if (include.includes('action_items') && ai_summary.action_items?.length) {
      sections.push(`Action Items:\n${ai_summary.action_items.map(a => `- ${deidentify(a.task, entities)}${a.due ? ` (by ${a.due})` : ''}`).join('\n')}`);
    }
    if (include.includes('follow_ups') && ai_summary.follow_ups?.length) {
      sections.push(`Follow-up Topics:\n${ai_summary.follow_ups.map(f => `- ${deidentify(f, entities)}`).join('\n')}`);
    }

    if (!sections.length) {
      return res.status(400).json({ error: 'No content available for selected sections.' });
    }

    const toneLabel = {
      formal: 'Formal (Dear/Sincerely)',
      professional: 'Professional (Hi/Best regards)',
      conversational: 'Conversational (Hey/Talk soon)',
    }[tone] || 'Professional';

    const userPrompt = `Tone: ${toneLabel}
Client token: CLIENT_NAME
Advisor token: ADVISOR_NAME

Meeting content to include:
${sections.join('\n\n')}

Write a follow-up email draft. Do not include salutation or sign-off — body content only.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('Anthropic error:', err);
      return res.status(502).json({ error: 'AI processing failed. Please try again.' });
    }

    const aiData = await response.json();
    const rawText = aiData.content?.[0]?.text || '';

    let parsed;
    try {
      parsed = JSON.parse(rawText.replace(/```json\n?|```/g, '').trim());
    } catch {
      console.error('Failed to parse AI response:', rawText);
      return res.status(502).json({ error: 'AI returned an unexpected format. Please try again.' });
    }

    // Re-identify — swap tokens back to real names
    const reidentifiedSubject = reidentify(parsed.subject || '', entities);
    const reidentifiedBody = reidentify(parsed.body || '', entities);

    // Assemble final email with salutation and sign-off
    const finalSalutation = salutation?.trim() || '';
    const finalSignOff = sign_off?.trim() || '';
    const fullBody = [finalSalutation, reidentifiedBody, finalSignOff].filter(Boolean).join('\n\n');

    return res.status(200).json({
      subject: reidentifiedSubject,
      body: fullBody,
    });

  } catch (err) {
    console.error('draft-email error:', err);
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}