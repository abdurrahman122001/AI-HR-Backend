// services/mailService.js
const transporter = require('../config/smtpConfig');

async function sendAutoReply(to, text) {
  // Normalize to a single email string
  const recipient = Array.isArray(to)
    ? to[0]
    : (typeof to === 'string' && to.includes(',')) 
      ? to.split(',')[0].trim()
      : to;

  if (!recipient) {
    console.error('❌ sendAutoReply: no valid recipient:', to);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      to: recipient,          // ONLY the sender’s address
      subject: 'Re: Your HR Query',
      text,
      // Ensure no CC/BCC slip through
      cc:   undefined,
      bcc:  undefined,
      envelope: {
        from: process.env.MAIL_FROM_ADDRESS,
        to:   recipient
      }
    });
    console.log('✅ Auto-reply sent to', recipient, '—', info.response);
  } catch (err) {
    console.error('❌ Send error:', err);
  }
}

module.exports = { sendAutoReply };