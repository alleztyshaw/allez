// api/compliance-flag.js
// Scans an AI note for compliance-relevant content.
// Returns flagged status, specific reasons, and severity.
// De-identifies before Anthropic call — PII never leaves infrastructure.

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001'; // Update alongside hqConstants

const SYSTEM_PROMPT = `You are a compliance screening assistant for a registered investment advisory (RIA) firm.

You will receive the content of a client meeting note. Your job is to identify content that a compliance officer should review.

Return ONLY a valid JSON object. No preamble, no markdown. Directly parseable by JSON.parse().

Required format:
{
  "flagged": true or false,
  "severity": "low" | "medium" | "high" | null,
  "reasons": ["Specific reason 1", "Specific reason 2"]
}

Flag a note when it contains ANY of the following:
- Suitability concerns: advisor recommending products that may not match the client's stated risk tolerance, time horizon, or investment objective
- Risk tolerance changes: client expressing desire to change risk profile (even informally)
- Performance guarantees or projections: any language suggesting guaranteed returns or specific future performance
- Complaints: client expressing dissatisfaction, threatening legal action, or raising concerns about advice received
- Outside business activities: references to advisor conducting business outside the firm
- Gifts or entertainment: references to gifts, meals, or entertainment with clients above de minimis thresholds
- Discretionary trades without explicit client approval
- Fee disputes or concerns raised by the client
- Recommendations of specific securities without documented suitability basis

Severity guidelines:
- high: complaints, guarantees, potential regulatory violations
- medium: suitability concerns, risk tolerance changes, undocumented recommendations  
- low: minor disclosure items, documentation gaps

If nothing warrants compliance review, return: { "flagged": false, "severity": null, "reasons": [] }

Rules:
- Only flag confirmed content — do not flag based on speculation
- Preserve all tokens like CLIENT_NAME, ADVISOR_1 exactly
- Be specific in reasons — cite what was said, not just the category`;

function buildEntities(clientName, advisorNames) {
  const entities = [];
  if (clientName?.trim()) {
    entities.push({ original: clientName.trim(), token: 'CLIENT_NAME' });
    const parts = clientName.trim().split(/\s+/);
    if (parts.length >= 2) {
      entities.push({ original: parts[0], token: 'CLIENT_NAME' });
      entities.push({ original: parts[parts.length - 1], token: 'CLIENT_NAME' });
    }
  }
  (advisorNames || []).forEach((name, i) => {
    const token = `ADVISOR_${i + 1}`;
    entities.push({ original: name.trim(), token });
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      entities.push({ original: parts[0], token });
      entities.push({ original: parts[parts.length - 1], token });
    }
  });
  return entities.sort((a, b) => b.original.length - a.original.length);
}

function deidentify(text, entities) {
  if (!text) return '';
  let result = text;
  for (const { original, token } of entities) {
    const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), token);
  }
  result = result.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, 'EMAIL_REDACTED');
  result = result.replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, 'PHONE_REDACTED');
  return result;
}

function reidentify(reasons, entities) {
  if (!reasons?.length) return reasons;
  return reasons.map(r => {
    let str = r;
    const sorted = [...entities].sort((a, b) => b.token.length - a.token.length);
    for (const { original, token } of sorted) {
      const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const properCased = original.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      str = str.replace(new RegExp(escaped, 'g'), properCased);
    }
    str = str.replace(/\bADVISOR_\d+\b/g, 'Advisor');
    str = str.replace(/\bCLIENT_NAME\b/g, 'Client');
    return str;
  });
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
    note_body,        // raw transcript or manual note body
    ai_summary,       // parsed ai_summary object if AI note
    client_name,
    advisor_names,    // array of strings
  } = req.body;

  if (!note_body && !ai_summary) {
    return res.status(400).json({ error: 'note_body or ai_summary is required.' });
  }

  try {
    const validAdvisors = (advisor_names || []).filter(Boolean);
    const entities = buildEntities(client_name, validAdvisors);

    // Build content to scan — prefer full transcript, fall back to summary
    const contentParts = [];
    if (note_body) {
      contentParts.push(`TRANSCRIPT:\n${deidentify(note_body, entities)}`);
    }
    if (ai_summary) {
      if (ai_summary.summary) contentParts.push(`SUMMARY:\n${deidentify(ai_summary.summary, entities)}`);
      if (ai_summary.decisions?.length) {
        contentParts.push(`DECISIONS:\n${ai_summary.decisions.map(d => deidentify(d, entities)).join('\n')}`);
      }
      if (ai_summary.action_items?.length) {
        contentParts.push(`ACTION ITEMS:\n${ai_summary.action_items.map(a => deidentify(a.task, entities)).join('\n')}`);
      }
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: contentParts.join('\n\n---\n\n') }],
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
      console.error('Failed to parse compliance response:', rawText);
      return res.status(502).json({ error: 'AI returned an unexpected format. Please try again.' });
    }

    return res.status(200).json({
      flagged:   !!parsed.flagged,
      severity:  parsed.severity || null,
      reasons:   reidentify(parsed.reasons || [], entities),
    });

  } catch (err) {
    console.error('compliance-flag error:', err);
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}