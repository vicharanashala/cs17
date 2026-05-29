const nodemailer = require('nodemailer');

// Lazy-init transporter so missing env vars don't crash the server
let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn('⚠️  Email not configured — SMTP env vars missing. Emails will be skipped.');
    return null;
  }
  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return _transporter;
}

async function sendMail(to, subject, html) {
  const transporter = getTransporter();
  if (!transporter) return; // silently skip if not configured
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@platform.ac.in',
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error(`Email send failed to ${to}:`, err.message);
    // Don't throw — email failure should never break the main flow
  }
}

// ─── Notification templates ──────────────────────────────────────────────────

async function sendAnswerNotification(email, name, questionTitle, answer, isOfficial) {
  const badge = isOfficial ? '✅ Official Answer' : '💬 Community Answer';
  await sendMail(
    email,
    `Your question has been answered`,
    `<p>Hi ${name},</p>
     <p>Your question <strong>"${questionTitle}"</strong> has received ${badge}:</p>
     <blockquote style="border-left:4px solid #0032c4;padding:8px 16px;color:#333">${answer}</blockquote>
     <p>Log in to the platform to view the full answer and mark it as helpful.</p>`
  );
}

async function sendFAQPromotionNotification(email, name, questionTitle) {
  await sendMail(
    email,
    `Your question is now in the official FAQ!`,
    `<p>Hi ${name},</p>
     <p>Great news! The question <strong>"${questionTitle}"</strong> that you voted on has been added to the official FAQ knowledge base.</p>
     <p>You can find it on the FAQ page the next time you visit.</p>`
  );
}

async function sendRejectionNotification(email, name, questionTitle, reason) {
  await sendMail(
    email,
    `Update on your question`,
    `<p>Hi ${name},</p>
     <p>The question <strong>"${questionTitle}"</strong> could not be addressed at this time.</p>
     ${reason ? `<p>Reason: ${reason}</p>` : ''}
     <p>If you have a different question, feel free to submit a new one.</p>`
  );
}

module.exports = {
  sendAnswerNotification,
  sendFAQPromotionNotification,
  sendRejectionNotification,
};
