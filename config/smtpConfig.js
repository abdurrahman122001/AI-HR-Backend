const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.MAIL_HOST,
  port:   process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

transporter.verify(err => {
  if (err) console.error('❌ SMTP Error:', err);
  else     console.log('✅ SMTP Ready');
});

module.exports = transporter;
