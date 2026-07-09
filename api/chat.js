const TONE_PROMPT = `
You are ParentMind — a warm, calm, and deeply human AI assistant for parents.

YOUR COMMUNICATION STYLE:
- Speak like a trusted friend who happens to have a psychology degree — never clinical, never cold
- Always start by acknowledging the parent's feeling before giving advice. They need to feel heard first.
- Use "you" a lot — make it personal, not generic
- Short paragraphs. White space. Never walls of text.
- Normalize the struggle. Parenting is hard. Say it when relevant.
- Avoid: "It is important to...", "Research shows...", "You should..."
- Use instead: "What's likely happening here is...", "One thing that often helps...", "Tonight you could try..."
- When the situation is serious, be honest but gentle. Never alarm unnecessarily.
- End responses with ONE gentle question or observation — not a list of next steps
- Never use bullet points in responses — write in natural flowing paragraphs
- Occasional warmth markers are okay: "That sounds exhausting.", "You're doing better than you think."
- Keep responses under 200 words unless the situation is complex

WHAT YOU NEVER DO:
- Never say "As an AI..." or "I'm just an AI..."
- Never give a list of 5 things to do
- Never be preachy or lecture
- Never make the parent feel judged or like they failed
- Never use the word "boundaries" unless they bring it up first
`;

async function tryGemini(messages, system) {
  const geminiMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const contents = [
    { role: 'user', parts: [{ text: TONE_PROMPT + (system || '') }] },
    { role: 'model', parts: [{ text: 'Understood. I will communicate with warmth, brevity, and genuine care — like a trusted friend with psychology expertise.' }] },
    ...geminiMessages
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.75, maxOutputTokens: 400 }
      })
    }
  );

  const data = await response.json();
  if (!response.ok || !data.candidates || !data.candidates[0]) {
    const msg = data?.error?.message || JSON.stringify(data);
    throw new Error(`Gemini (${response.status}): ${msg}`);
  }
  return data.candidates[0].content.parts[0].text;
}

async function tryGroq(messages, system) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: TONE_PROMPT + (system || '') },
        ...messages
      ],
      temperature: 0.75,
      max_tokens: 400
    })
  });

  const data = await response.json();
  if (!response.ok || !data.choices || !data.choices[0]) {
    const msg = data?.error?.message || JSON.stringify(data);
    throw new Error(`Groq (${response.status}): ${msg}`);
  }
  return data.choices[0].message.content;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { messages, system } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  // 1) Try Gemini first (primary)
  if (process.env.GEMINI_API_KEY) {
    try {
      const reply = await tryGemini(messages, system);
      return res.status(200).json({ reply, provider: 'gemini' });
    } catch (geminiError) {
      console.error('Gemini failed, falling back to Groq:', geminiError.message);
      // fall through to Groq below
    }
  }

  // 2) Fallback to Groq if Gemini is unavailable/overloaded/erroring
  if (process.env.GROQ_API_KEY) {
    try {
      const reply = await tryGroq(messages, system);
      return res.status(200).json({ reply, provider: 'groq' });
    } catch (groqError) {
      return res.status(503).json({
        error: `Both AI providers are currently unavailable. Gemini and Groq both failed. Please try again in a moment. (${groqError.message})`
      });
    }
  }

  return res.status(500).json({ error: 'No AI provider configured (missing GEMINI_API_KEY and GROQ_API_KEY).' });
}
