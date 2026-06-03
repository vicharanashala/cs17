const { Resend } = require('resend');

// Lazy-init so missing env vars don't crash the server
let _client = null;

function getClient() {
  if (_client) return _client;
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️  Email not configured — RESEND_API_KEY missing. Emails will be skipped.');
    return null;
  }
  _client = new Resend(process.env.RESEND_API_KEY);
  return _client;
}

// Resend free tier: from address must be onboarding@resend.dev OR a verified domain email.
// For MVP with free account, default to onboarding@resend.dev (sandbox — sends to verified emails only).
function fromAddress() {
  return process.env.RESEND_FROM_EMAIL
    ? process.env.RESEND_FROM_EMAIL
    : 'onboarding@resend.dev';
}

async function sendMail(to, subject, html) {
  const client = getClient();
  if (!client) return; // silently skip if not configured
  try {
    await client.emails.send({
      from: fromAddress(),
      to: Array.isArray(to) ? to : [to],
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
  sendMail, // used by emailDigest.js
};