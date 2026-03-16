export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { occasion, season, aesthetic, palette, budget, notes } = req.body;

  const prompt = `You are a luxury fashion stylist. Generate exactly 4 outfit suggestions as a JSON array.

User: Occasion=${occasion}, Season=${season}, Aesthetic=${aesthetic}, Palette=${palette}, Budget=${budget}, Notes=${notes || 'None'}

Return ONLY a raw JSON array (no markdown, no code blocks) with 4 objects each having:
- name: creative 2-3 word editorial outfit name
- occasion: occasion string
- why: one sentence (max 18 words) why this fits the user
- pieces: array of exactly 4 short item names
- price: total price range in ₹
- match: match percentage e.g. "96% Match"
- shopItems: array of 4 objects with:
  - name: full product name for Amazon search
  - price: estimated item price in ₹
  - icon: single relevant emoji
  - query: amazon search string (use + for spaces, URL-safe)`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1500,
        temperature: 0.8,
        messages: [
          {
            role: 'system',
            content: 'You are a luxury fashion stylist AI. Always respond with raw JSON only — no markdown, no explanation, no code fences.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    let raw = data.choices?.[0]?.message?.content?.trim() || '';
    raw = raw.replace(/^```[\w]*\n?/, '').replace(/```$/, '').trim();

    const outfits = JSON.parse(raw);
    return res.status(200).json({ outfits });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
