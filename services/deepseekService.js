// services/deepseekService.js
const axios = require('axios');

async function classifyEmail(text) {
  try {
    const resp = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model:       "deepseek/deepseek-r1-zero:free",
        temperature: 0.85,
        top_p:       0.9,
        messages: [
          {
            role:    "user",
            content: `
                You are an email classifier. 
                Given the following email body, return _only_ a JSON array of labels that apply.
                Possible labels: ["HR","Finance","Support","Sales","Other"].

                Email body:
                ---
                ${text.trim()}
                ---`
          }
        ]
      },
      {
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        }
      }
    );

    // The model's reply should be something like: ["HR"]
    const reply = resp.data.choices?.[0]?.message?.content?.trim() || "";

    // Try JSON.parse first
    try {
      const labels = JSON.parse(reply);
      if (Array.isArray(labels)) return labels;
    } catch (e) {
      console.warn("❗ Failed to JSON.parse DeepSeek reply:", reply);
    }

    // Fallback: split tokens
    return reply
      .replace(/[\[\]"']/g, '')
      .split(/[\s,]+/)
      .filter(l => l);

  } catch (err) {
    console.error("DeepSeek classification error:", err.response?.data || err.message);
    return [];
  }
}

module.exports = { classifyEmail };
