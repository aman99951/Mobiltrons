module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  var apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured' });
  }

  var body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }

  var count = Number(body.count) || 3;
  if (count < 1) count = 1;
  if (count > 5) count = 5;
  var allowedIds = ['trusted-providers', 'local-vs-traditional', 'selling-on-mobitrons'];
  var requestedIds = Array.isArray(body.ids)
    ? body.ids.filter(function (id) { return allowedIds.indexOf(id) >= 0; })
    : [];
  if (requestedIds.length > 0) count = requestedIds.length;

  var model = process.env.NEWSLETTER_OPENAI_MODEL || 'gpt-5.4-mini';
  var prompt = [
    'Generate ' + count + ' short newsletter articles for a local marketplace app (Mobitrons).',
    'Return ONLY valid JSON with shape: {"articles":[...]}',
    'Each article must include: id, title, teaser, category, date, readingTime, html.',
    requestedIds.length > 0
      ? ('Use only these IDs in this exact order: ' + requestedIds.join(', ') + '.')
      : 'Allowed IDs only: trusted-providers, local-vs-traditional, selling-on-mobitrons.',
    'Each html field should be sanitized-friendly and include plain HTML tags only (p,h3,ul,ol,li,strong,blockquote,img,video,source,figure,figcaption,a).',
    'Date must be "March 25, 2026".',
    'Do not include markdown.'
  ].join(' ');

  try {
    var response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: model,
        input: prompt,
        max_output_tokens: 2600
      })
    });

    var raw = await response.json();
    if (!response.ok) {
      return res.status(502).json({ error: 'OpenAI request failed', details: raw && raw.error ? raw.error.message : 'Unknown error' });
    }

    var outputText = raw.output_text || '';
    if (!outputText && Array.isArray(raw.output)) {
      outputText = raw.output
        .map(function (entry) {
          return Array.isArray(entry.content)
            ? entry.content.map(function (part) { return part.text || ''; }).join('')
            : '';
        })
        .join('');
    }

    var parsed = JSON.parse(outputText);
    if (!parsed || !Array.isArray(parsed.articles)) {
      return res.status(502).json({ error: 'OpenAI returned invalid JSON structure' });
    }

    var filtered = parsed.articles.filter(function (article) {
      return article && article.id && allowedIds.indexOf(article.id) >= 0;
    });
    return res.status(200).json({ articles: filtered });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate newsletters', details: error.message });
  }
};
