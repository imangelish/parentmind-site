export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, system } = req.body;
  if (!messages) return res.status(400).json({ error: 'Invalid request' });

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
    const reply = data.choices[0].message.content;
    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}
