export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, system } = req.body;
  if (!messages) return res.status(400).json({ error: 'Invalid request' });

  if (!process.env.GROQ_API_KEY) {
    // Missing env var is the #1 cause of silent failures on Vercel
    return res.status(500).json({ error: 'GROQ_API_KEY is not set on the server (check Vercel → Project → Settings → Environment Variables, and redeploy after adding it).' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: system || 'You are a helpful parenting assistant.' },
          ...messages
        ],
        temperature: 0.75,
        max_tokens: 400
      })
    });

    const data = await response.json();

    // Surface the REAL error from Groq instead of swallowing it
    if (!response.ok || !data.choices || !data.choices[0]) {
      const groqMessage = data?.error?.message || JSON.stringify(data);
      return res.status(response.status || 500).json({
        error: `Groq API error (${response.status}): ${groqMessage}`
      });
    }

    const reply = data.choices[0].message.content;
    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({ error: `Server exception: ${error.message}` });
  }
}
