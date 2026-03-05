// api/summarize.js
// Receives a diarized transcript, sends to Claude Haiku for structured summarization,
// logs token usage to ai_usage table in Supabase.
//
// TO ACTIVATE: Add ANTHROPIC_API_KEY to Vercel environment variables.
// No code changes needed — the mock block below will be replaced automatically.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // service role key for server-side writes
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transcript, raw_text, org_id, user_id, note_id } = req.body;

  if (!raw_text) {
    return res.status(400).json({ error: 'raw_text is required' });
  }

  // ─── MOCK MODE (no API key present) ──────────────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(200).json({
      mock: true,
      summary: 'Client expressed concerns about tech allocation and requested a rebalancing discussion before year end. Advisor agreed to walk through portfolio numbers.',
      action_items: [
        'Review tech allocation percentage vs benchmark',
        'Prepare rebalancing proposal before year end',
        'Schedule follow-up meeting to present options',
      ],
      key_topics: ['Portfolio review', 'Tech allocation', 'Year-end rebalancing'],
    });
  }

  // ─── LIVE MODE ────────────────────────────────────────────────────────────
  try {
    const formattedTranscript = Array.isArray(transcript)
      ? transcript.map(u => `${u.speaker}: ${u.text}`).join('\n')
      : raw_text;

    const prompt = `You are an assistant for a wealth management firm. Analyze the following advisor-client meeting transcript and return a JSON object with these exact fields:
- "summary": a 2-4 sentence overview of the meeting
- "action_items": an array of specific follow-up actions for the advisor
- "key_topics": an array of main topics discussed

Respond ONLY with valid JSON. No preamble, no markdown, no explanation.

Transcript:
${formattedTranscript}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const inputTokens  = data.usage?.input_tokens  || 0;
    const outputTokens = data.usage?.output_tokens || 0;

    // Cost calculation (Haiku pricing — update if pricing changes)
    const costUsd = (inputTokens * 0.00000025) + (outputTokens * 0.00000125);

    // Parse structured JSON from Haiku
    let parsed;
    try {
      parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch {
      parsed = { summary: text, action_items: [], key_topics: [] };
    }

    // Log usage to Supabase
    if (org_id && user_id) {
      await supabase.from('ai_usage').insert([{
        org_id,
        user_id,
        feature: 'note_summary',
        model: 'claude-haiku-4-5-20251001',
        tokens_input: inputTokens,
        tokens_output: outputTokens,
        cost_usd: costUsd,
        related_table: 'notes',
        related_id: note_id || null,
      }]);
    }

    return res.status(200).json({ mock: false, ...parsed });

  } catch (err) {
    console.error('Summarization error:', err);
    return res.status(500).json({ error: 'Summarization failed', detail: err.message });
  }
}