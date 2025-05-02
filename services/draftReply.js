// services/draftReply.js
const axios = require("axios");

async function generateHRReply(body) {
  try {
    const resp = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-r1-zero:free",
        temperature: 0.7,
        top_p: 0.9,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful HR assistant. Write a polite, professional email response to an applicant.",
          },
          {
            role: "user",
            content: `
                Applicant wrote:
                ---
                ${body.trim()}
                ---
                Please craft a single email reply addressing their question, using company‐brand tone and including next steps.`,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
      }
    );

    const reply = resp.data.choices?.[0]?.message?.content?.trim();
    return reply || "Sorry, I couldn't generate a response at this time.";
  } catch (err) {
    console.error("❌ draftReply error:", err.response?.data || err.message);
    return "Sorry, I couldn't generate a response at this time.";
  }
}

module.exports = { generateHRReply };