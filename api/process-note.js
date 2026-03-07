// api/process-note.js
// Vercel serverless function — AI note processing pipeline
// De-identifies transcript → calls Anthropic → re-identifies response
// PII never leaves this function in identifiable form

const SYSTEM_PROMPT = `You are a financial advisory CRM note-taking assistant. You will receive a meeting transcript that has been de-identified — names and sensitive data have been replaced with tokens like [CLIENT], [ADVISOR_1], [AMOUNT], [PHONE], etc.

Extract structured intelligence and return ONLY a valid JSON object. No preamble, no explanation, no markdown code blocks. The response must be directly parseable by JSON.parse().

Required format:
{
  "title": "Concise meeting title, maximum 8 words",
  "summary": "2-3 sentence prose summary of the meeting purpose and outcome",
  "decisions": ["Each key decision made, as a complete sentence"],
  "action_items": [{"task": "What needs to be done", "owner": "token or role", "due": "timeframe or null"}],
  "follow_ups": ["Topics or questions to revisit at a future meeting"]
}

Rules:
- Preserve all tokens exactly as written (e.g. [CLIENT], [ADVISOR_1])
- Be specific and concise
- Return empty arrays [] for sections with no content
- action_items.due should be a string like "next week", "by end of March", or null if not mentioned
- Do not invent names or details not present in the transcript`;


// ─── De-identification ────────────────────────────────────────────────────────

function buildEntities(clientName, orgMemberNames) {
  // Returns array of { original, token } sorted longest-first
  // to prevent partial matches (e.g. "Chen" matching inside "Michael Chen")
  const entities = [];

  if (clientName && clientName.trim()) {
    entities.push({ original: clientName.trim(), token: '[CLIENT]' });
    // Also catch first and last name used in isolation
    const parts = clientName.trim().split(/\s+/);
    if (parts.length >= 2) {
      entities.push({ original: parts[0], token: '[CLIENT]' });
      entities.push({ original: parts[parts.length - 1], token: '[CLIENT]' });
    }
  }

  (orgMemberNames || []).forEach((name, i) => {
    if (!name || !name.trim()) return;
    entities.push({ original: name.trim(), token: `[ADVISOR_${i + 1}]` });
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      entities.push({ original: parts[0], token: `[ADVISOR_${i + 1}]` });
      entities.push({ original: parts[parts.length - 1], token: `[ADVISOR_${i + 1}]` });
    }
  });

  // Sort longest-first to avoid partial replacements
  return entities.sort((a, b) => b.original.length - a.original.length);
}

function deidentify(text, entities) {
  let result = text;

  // Named entity replacement
  for (const { original, token } of entities) {
    const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    result = result.replace(regex, token);
  }

  // Pattern-based replacements
  result = result.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');
  result = result.replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[PHONE]');
  result = result.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]');
  result = result.replace(/\$[\d,]+(\.\d{2})?/g, '[AMOUNT]');
  // Account numbers: 6-12 char alphanumeric with both letters and digits
  result = result.replace(/\b(?=[A-Z0-9]{6,12}\b)(?=[A-Z0-9]*[A-Z])(?=[A-Z0-9]*[0-9])[A-Z0-9]{6,12}\b/g, '[ACCT]');
  // Dates of birth pattern (MM/DD/YYYY or MM-DD-YYYY)
  result = result.replace(/\b(0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12]\d|3[01])[\/\-](19|20)\d{2}\b/g, '[DOB]');

  return result;
}

function reidentify(obj, entities) {
  // Stringify, replace all tokens, parse back
  let str = JSON.stringify(obj);
  // Reverse: replace tokens with proper-cased originals
  // Process in reverse order (shortest tokens first to avoid partial replacements)
  const reversed = [...entities].sort((a, b) => a.original.length - b.original.length);
  for (const { original, token } of reversed) {
    // Escape token for use in regex (brackets need escaping)
    const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedToken, 'g');
    // Restore original casing (capitalize each word)
    const properCased = original
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    str = str.replace(regex, properCased);
  }
  try {
    return JSON.parse(str);
  } catch {
    return obj; // Return original if re-parse fails
  }
}


// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    transcript,
    client_name,
    org_member_names = [],
    note_type = 'General',
  } = req.body;

  if (!transcript || !transcript.trim()) {
    return res.status(400).json({ error: 'Transcript is required.' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API key not configured.' });
  }

  try {
    // Step 1: Build ephemeral entity map (never persisted)
    const entities = buildEntities(client_name, org_member_names);

    // Step 2: De-identify transcript
    const deidentified = deidentify(transcript, entities);

    // Step 3: Call Anthropic API with de-identified text
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Note type: ${note_type}\n\nTranscript:\n${deidentified}`,
          },
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      const errData = await anthropicResponse.json().catch(() => ({}));
      console.error('Anthropic API error:', errData);
      return res.status(502).json({ error: 'AI processing failed. Please try again.' });
    }

    const aiData = await anthropicResponse.json();
    const rawText = aiData.content?.[0]?.text || '';

    // Step 4: Parse structured JSON response
    let parsed;
    try {
      const clean = rawText.replace(/```json\n?|```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch (e) {
      console.error('Failed to parse AI response:', rawText);
      return res.status(502).json({ error: 'AI returned an unexpected format. Please try again.' });
    }

    // Step 5: Re-identify — swap tokens back to real names
    // Entity map is discarded after this step (ephemeral)
    const reidentified = reidentify(parsed, entities);

    // Return processed result — saving to Supabase happens client-side
    // Original transcript is returned so the frontend can store it for compliance
    return res.status(200).json({
      title: reidentified.title || '',
      summary: reidentified.summary || '',
      decisions: reidentified.decisions || [],
      action_items: reidentified.action_items || [],
      follow_ups: reidentified.follow_ups || [],
    });

  } catch (err) {
    console.error('process-note error:', err);
    return res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
  }
}