// api/transcribe.js
// Receives an audio blob, sends to AssemblyAI for transcription + speaker diarization.
// Returns a diarized transcript with Advisor / Client speaker labels.
//
// TO ACTIVATE: Add ASSEMBLYAI_API_KEY to Vercel environment variables.
// No code changes needed — the mock block below will be replaced automatically.

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ─── MOCK MODE (no API key present) ──────────────────────────────────────
  if (!process.env.ASSEMBLYAI_API_KEY) {
    return res.status(200).json({
      mock: true,
      transcript: [
        { speaker: 'Advisor', text: 'Good morning. How are you feeling about your portfolio this quarter?' },
        { speaker: 'Client',  text: 'Generally positive, but I have some concerns about the tech allocation.' },
        { speaker: 'Advisor', text: 'That's a fair point. Let's walk through the numbers together.' },
        { speaker: 'Client',  text: 'I'd also like to discuss rebalancing before year end.' },
      ],
      raw_text: 'Good morning. How are you feeling about your portfolio this quarter? Generally positive, but I have some concerns about the tech allocation. That\'s a fair point. Let\'s walk through the numbers together. I\'d also like to discuss rebalancing before year end.',
    });
  }

  // ─── LIVE MODE ────────────────────────────────────────────────────────────
  try {
    // 1. Read raw audio bytes from request
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const audioBuffer = Buffer.concat(chunks);

    // 2. Upload audio to AssemblyAI
    const uploadRes = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        authorization: process.env.ASSEMBLYAI_API_KEY,
        'content-type': 'application/octet-stream',
      },
      body: audioBuffer,
    });
    const { upload_url } = await uploadRes.json();

    // 3. Submit transcription job with speaker diarization
    const transcriptRes = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        authorization: process.env.ASSEMBLYAI_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: upload_url,
        speaker_labels: true,
        speakers_expected: 2,
      }),
    });
    const { id: transcriptId } = await transcriptRes.json();

    // 4. Poll until complete (max 2 minutes)
    let result;
    for (let i = 0; i < 24; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const poll = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { authorization: process.env.ASSEMBLYAI_API_KEY },
      });
      result = await poll.json();
      if (result.status === 'completed') break;
      if (result.status === 'error') throw new Error(result.error);
    }

    if (result.status !== 'completed') {
      return res.status(408).json({ error: 'Transcription timed out' });
    }

    // 5. Map speaker labels A/B → Advisor/Client
    // AssemblyAI returns speaker A and B — first speaker is assumed to be the Advisor.
    const speakerMap = {};
    const roles = ['Advisor', 'Client'];
    let roleIndex = 0;

    const transcript = result.utterances.map(u => {
      if (!speakerMap[u.speaker]) {
        speakerMap[u.speaker] = roles[roleIndex] || `Speaker ${u.speaker}`;
        roleIndex++;
      }
      return { speaker: speakerMap[u.speaker], text: u.text };
    });

    const raw_text = transcript.map(u => `${u.speaker}: ${u.text}`).join('\n');

    return res.status(200).json({ mock: false, transcript, raw_text });

  } catch (err) {
    console.error('Transcription error:', err);
    return res.status(500).json({ error: 'Transcription failed', detail: err.message });
  }
}