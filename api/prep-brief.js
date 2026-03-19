// api/prep-brief.js
// Generates an AI relationship brief for a client.
// Mode: 'review' (ClientDetail) — synthesises history, open loops, confirmed changes.
// De-identifies notes before Anthropic call, re-identifies on return.

const REVIEW_SYSTEM_PROMPT = `You are a financial advisor assistant generating a relationship brief for an advisor reviewing a client.

Your job is to synthesise what is known about this client into a concise, scannable brief — 300 to 400 words maximum. The advisor should be able to read it in 90 seconds.

Return ONLY a valid JSON object. No preamble, no markdown, no explanation. Directly parseable by JSON.parse().

Required format:
{
  "snapshot": "2-3 sentence paragraph covering who this client is today — AUM, fee rate, risk profile, how long they have been a client, custodian. Facts only.",
  "recent_meetings": ["One sentence per meeting, most recent first. Maximum 3 entries. Each sentence captures the point of the conversation, not a transcript."],
  "open_commitments": ["Each item written action-first with the owner named at the start. Use the token exactly as given. Format: 'ADVISOR_1 to action' or 'ADVISOR_1 will action'. Example: 'ADVISOR_1 to send estate planning referral to CLIENT_NAME by end of month.' Maximum 5 entries."],
  "relationship_notes": ["Confirmed material changes to the relationship only — e.g. risk tolerance formally updated, major life event that was actioned, fee restructuring completed. 1-3 lines maximum. Omit this array entirely if nothing confirmed and material exists."]
}

Critical rules:
- Only include confirmed facts and completed actions
- Do not include client intentions, passing mentions, or discussions with no confirmed outcome
- If uncertain whether something was confirmed or just discussed, omit it
- Empty sections should be empty arrays [], not omitted keys
- relationship_notes should only contain things that materially changed how the advisor manages this client
- recent_meetings must be one sentence each — no bullet points within a sentence
- open_commitments must start with the person's name followed by "to" or "will" — never use an em dash or append names at the end
- The entire brief must not exceed 400 words
- All tokens like CLIENT_NAME, ADVISOR_1, ADVISOR_2 must be preserved exactly as written — do not replace or modify them in any way`;

function buildEntities(clientName, orgMemberNames) {
  const entities = [];
  if (clientName?.trim()) {
    entities.push({ original: clientName.trim(), token: 'CLIENT_NAME' });
    const parts = clientName.trim().split(/\s+/);
    if (parts.length >= 2) {
      entities.push({ original: parts[0], token: 'CLIENT_NAME' });
      entities.push({ original: parts[parts.length - 1], token: 'CLIENT_NAME' });
    }
  }
  // Input is pre-filtered — every name is valid, index = position
  (orgMemberNames || []).forEach((name, i) => {
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
  result = result.replace(/\b\d{3}-\d{2}-\d{4}\b/g, 'SSN_REDACTED');
  return result;
}

function reidentify(obj, entities) {
  let str = JSON.stringify(obj);
  // Sort longest tokens first to avoid partial replacements
  const sorted = [...entities].sort((a, b) => b.token.length - a.token.length);
  for (const { original, token } of sorted) {
    const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const properCased = original
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    str = str.replace(new RegExp(escapedToken, 'g'), properCased);
  }
  // Clean up any unreplaced tokens in all possible forms
  // Fallback: replace any unreplaced tokens
  str = str.replace(/\bADVISOR_\d+\b/g, 'Advisor');
  str = str.replace(/\bCLIENT_NAME\b/g, 'Client');
  str = str.replace(/\bEMAIL_REDACTED\b/g, '');
  str = str.replace(/\bPHONE_REDACTED\b/g, '');
  str = str.replace(/\bSSN_REDACTED\b/g, '');
  try { return JSON.parse(str); } catch { return obj; }
}

function formatClientSnapshot(client) {
  const parts = [];
  if (client.aum) parts.push(`AUM: ${client.aum}`);
  if (client.fee_rate) parts.push(`Fee rate: ${client.fee_rate}`);
  if (client.risk_tolerance) parts.push(`Risk tolerance: ${client.risk_tolerance}`);
  if (client.custodian) parts.push(`Custodian: ${client.custodian}`);
  if (client.client_since) parts.push(`Client since: ${client.client_since}`);
  if (client.investment_objective) parts.push(`Objective: ${client.investment_objective}`);
  if (client.next_review_date) parts.push(`Next review: ${client.next_review_date}`);
  return parts.join(' · ');
}

function formatNote(note, advisorMap) {
  const authorName = advisorMap[note.created_by] || 'Unknown';
  const date = note.created_at ? new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const aiSummary = (() => {
    try { return note.ai_summary ? JSON.parse(note.ai_summary) : null; } catch { return null; }
  })();
  const content = aiSummary?.summary || note.body || '';
  const followUps = aiSummary?.follow_ups?.length ? `Follow-ups noted: ${aiSummary.follow_ups.join('; ')}` : '';
  return `[${date} — ${authorName}]: ${content}${followUps ? ` | ${followUps}` : ''}`;
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
    client,           // client record object
    notes,            // array of note objects, sorted recent first
    tasks,            // array of client_task objects
    org_member_names, // array of { user_id, first_name, last_name }
  } = req.body;

  if (!client || !notes) {
    return res.status(400).json({ error: 'client and notes are required.' });
  }

  try {
    const clientFullName = client.first_name && client.last_name
      ? `${client.first_name} ${client.last_name}` : '';

    // Build a single aligned list of { user_id, name } — only valid names, preserving order
    const validMembers = (org_member_names || [])
      .map(m => ({
        user_id: m.user_id,
        name: m.first_name && m.last_name ? `${m.first_name} ${m.last_name}`.trim() : null,
      }))
      .filter(m => m.name);

    const memberNames = validMembers.map(m => m.name);
    const entities = buildEntities(clientFullName, memberNames);

    // Build advisor lookup map — uses same filtered order as buildEntities
    const advisorMap = {};
    validMembers.forEach((m, i) => {
      if (m.user_id) advisorMap[m.user_id] = `ADVISOR_${i + 1}`;
    });

    // Recent 5 notes — full content
    const recentNotes = notes.slice(0, 5).map(n => formatNote(n, advisorMap));

    // Notes 6-20 — summary only for material change scanning
    const olderNotes = notes.slice(5, 20).map(n => {
      const aiSummary = (() => {
        try { return n.ai_summary ? JSON.parse(n.ai_summary) : null; } catch { return null; }
      })();
      const content = aiSummary?.summary || n.body || '';
      const date = n.created_at ? new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
      return `[${date}]: ${content.slice(0, 200)}`;
    });

    // Tasks
    const openTasks = (tasks || [])
      .filter(t => !t.completed)
      .map(t => {
        const owner = advisorMap[t.assigned_to] || 'Advisor';
        const due = t.due_date ? ` (due ${t.due_date})` : '';
        return `${t.title}${due} — ${owner}`;
      });

    const completedTasks = (tasks || [])
      .filter(t => t.completed && t.completed_at)
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
      .slice(0, 5)
      .map(t => `${t.title} (completed ${new Date(t.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`);

    // Build de-identified prompt
    const clientSnapshotRaw = formatClientSnapshot(client);
    const clientSnapshot = deidentify(clientSnapshotRaw, entities);

    const sections = [
      `CLIENT SNAPSHOT:\n${clientSnapshot}`,
      recentNotes.length ? `RECENT NOTES (last ${recentNotes.length}, full content):\n${recentNotes.map(n => deidentify(n, entities)).join('\n\n')}` : null,
      olderNotes.length ? `OLDER NOTES (scan for confirmed material changes only — ignore passing mentions or unacted intentions):\n${olderNotes.map(n => deidentify(n, entities)).join('\n')}` : null,
      openTasks.length ? `OPEN TASKS AND COMMITMENTS:\n${openTasks.map(t => deidentify(t, entities)).join('\n')}` : null,
      completedTasks.length ? `RECENTLY COMPLETED TASKS:\n${completedTasks.join('\n')}` : null,
    ].filter(Boolean);

    const userPrompt = sections.join('\n\n---\n\n');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        system: REVIEW_SYSTEM_PROMPT,
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

    const reidentified = reidentify(parsed, entities);

    return res.status(200).json({
      snapshot: reidentified.snapshot || '',
      recent_meetings: reidentified.recent_meetings || [],
      open_commitments: reidentified.open_commitments || [],
      relationship_notes: reidentified.relationship_notes || [],
    });

  } catch (err) {
    console.error('prep-brief error:', err);
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}