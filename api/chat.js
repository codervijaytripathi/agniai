const https = require('https');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  const dataString = JSON.stringify({
    model: "llama3-8b-8192",
    messages: [{ role: "user", content: message }]
  });

  const options = {
    hostname: 'api.groq.com',
    path: '/openai/v1/chat/completions',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
      'Content-Length': dataString.length
    }
  };

  const request = https.request(options, (response) => {
    let body = '';
    response.on('data', (chunk) => { body += chunk; });
    response.on('end', () => {
      try {
        const jsonResponse = JSON.parse(body);
        res.status(response.statusCode).json(jsonResponse);
      } catch (e) {
        res.status(500).json({ error: "Parsing error: " + body });
      }
    });
  });

  request.on('error', (error) => {
    res.status(500).json({ error: "Request error: " + error.message });
  });

  request.write(dataString);
  request.end();
};
