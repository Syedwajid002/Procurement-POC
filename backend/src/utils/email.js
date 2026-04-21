const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

async function sendEmail(to, subject, html) {
  if (!process.env.SMTP_USER) return console.log(`[Email skipped] To: ${to}, Subject: ${subject}`);
  try {
    await transporter.sendMail({ from: process.env.SMTP_USER, to, subject, html });
  } catch (err) {
    console.error('Email error:', err.message);
  }
}

module.exports = { sendEmail };
