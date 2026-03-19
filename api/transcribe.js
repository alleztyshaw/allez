// api/transcribe.js
// Vercel serverless function — transcribes audio via AssemblyAI
// Accepts multipart form data with an audio file
// Returns formatted transcript text with speaker labels

export const config = {
  api: {
    bodyParser: false, // required for multipart/form-data
  },
};

const ASSEMBLYAI_API = 'https://api.assemblyai.com/v2';

async function uploadAudio(buffer, contentType) {
  const res = await fetch(`${ASSEMBLYAI_API}/upload`, {
    method: 'POST',
    headers: {
      authorization: process.env.ASSEMBLYAI_API_KEY,
      'content-type': contentType || 'application/octet-stream',
      'transfer-encoding': 'chunked',
    },
    body: buffer,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'AssemblyAI upload failed');
  }
  const { upload_url } = await res.json();
  return upload_url;
}

async function requestTranscript(uploadUrl, speakerLabels) {
  const res = await fetch(`${ASSEMBLYAI_API}/transcript`, {
    method: 'POST',
    headers: {
      authorization: process.env.ASSEMBLYAI_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      audio_url: uploadUrl,
      speaker_labels: speakerLabels,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'AssemblyAI transcript request failed');
  }
  const { id } = await res.json();
  return id;
}

async function pollTranscript(transcriptId) {
  const maxAttempts = 60; // 5 minutes max (5s intervals)
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 5000));

    const res = await fetch(`${ASSEMBLYAI_API}/transcript/${transcriptId}`, {
      headers: { authorization: process.env.ASSEMBLYAI_API_KEY },
    });
    const data = await res.json();

    if (data.status === 'completed') return data;
    if (data.status === 'error') throw new Error(data.error || 'Transcription failed');
    // status === 'processing' or 'queued' — keep polling
  }
  throw new Error('Transcription timed out. Please try again.');
}

function formatTranscript(data) {
  // If speaker diarization is available, format as labelled turns
  if (data.utterances?.length) {
    return data.utterances
      .map(u => `Speaker ${u.speaker}: ${u.text}`)
      .join('\n\n');
  }
  // Fallback to plain text
  return data.text || '';
}

async function parseMultipart(req) {
  // Simple multipart parser for a single file field named 'audio'
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(chunks);
      const contentType = req.headers['content-type'] || '';
      const boundaryMatch = contentType.match(/boundary=(.+)$/);
      if (!boundaryMatch) return reject(new Error('No boundary in multipart'));

      const boundary = `--${boundaryMatch[1]}`;
      const bodyStr = body.toString('binary');
      const parts = bodyStr.split(boundary).filter(p => p !== '--\r\n' && p.trim());

      for (const part of parts) {
        const [headerSection, ...contentParts] = part.split('\r\n\r\n');
        if (!headerSection.includes('filename')) continue;

        const contentTypeMatch = headerSection.match(/Content-Type:\s*(.+)/i);
        const fileContentType = contentTypeMatch?.[1]?.trim() || 'audio/webm';

        // Strip trailing boundary markers
        const contentStr = contentParts.join('\r\n\r\n').replace(/\r\n$/, '');
        const fileBuffer = Buffer.from(contentStr, 'binary');

        return resolve({ buffer: fileBuffer, contentType: fileContentType });
      }
      reject(new Error('No audio file found in request'));
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.ASSEMBLYAI_API_KEY) {
    return res.status(500).json({ error: 'AssemblyAI API key not configured.' });
  }

  try {
    const { buffer, contentType } = await parseMultipart(req);

    if (!buffer || buffer.length === 0) {
      return res.status(400).json({ error: 'No audio data received.' });
    }

    // Upload audio to AssemblyAI
    const uploadUrl = await uploadAudio(buffer, contentType);

    // Request transcription with speaker diarization
    const transcriptId = await requestTranscript(uploadUrl, true);

    // Poll until complete
    const result = await pollTranscript(transcriptId);

    // Format and return
    const transcript = formatTranscript(result);
    if (!transcript) {
      return res.status(422).json({ error: 'No speech detected in audio. Please try again.' });
    }

    return res.status(200).json({ transcript });

  } catch (err) {
    console.error('transcribe error:', err);
    return res.status(500).json({ error: err.message || 'Transcription failed. Please try again.' });
  }
}