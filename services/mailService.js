const transporter = require('../config/smtpConfig');

function sendAutoReply(to, text) {
  transporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to,
    subject: 'Re: Your HR Query',
    text,
  }, (err, info) => {
    if (err) console.error('❌ Send error:', err);
    else     console.log('✅ Auto-reply sent to', to);
  });
}

module.exports = { sendAutoReply };
