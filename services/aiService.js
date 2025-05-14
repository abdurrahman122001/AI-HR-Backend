const axios = require('axios');

const getAIResponse = async (question) => {
  try {
    const response = await axios.post('https://api.openai.com/v1/completions', {
      model: 'deepseek/deepseek-r1-zero:free',
      prompt: `Answer this HR-related question: ${question}`,
      max_tokens: 150
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GOOGLE_API_KEY}`
      }
    });

    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "Sorry, I couldn't process your question.";
  }
};

const sendAutoReply = (recipientEmail, responseText) => {
  // Logic to send the email using Nodemailer or SMTP service
};

module.exports = { getAIResponse, sendAutoReply };
