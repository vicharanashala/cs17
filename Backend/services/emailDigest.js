const { sendMail } = require('./email');
const User = require('../models/User');
const Query = require('../models/Query');

async function sendAdminDigest() {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [queries, admins] = await Promise.all([
      Query.find({ createdAt: { $gte: since } }).lean(),
      User.find({ role: 'admin' }).select('email name').lean(),
    ]);

    if (admins.length === 0) {
      console.log('📊 Admin digest: no admins found, skipping.');
      return;
    }

    const counts = { new: 0, in_progress: 0, answered: 0, escalated: 0 };
    for (const q of queries) {
      if (q.askerSatisfied === false) counts.escalated++;
      else if (q.status === 'answered') counts.answered++;
      else if (q.status === 'in_progress') counts.in_progress++;
      else counts.new++;
    }

    const rows = queries.slice(0, 20).map((q) => {
      const status =
        q.askerSatisfied === false
          ? '🔴 Escalated'
          : q.status === 'answered'
          ? '🟢 Answered'
          : q.status === 'in_progress'
          ? '🟡 In Progress'
          : '⚪ New';
      return `<tr><td style="padding:4px 8px;border-bottom:1px solid #eee">${status}</td><td style="padding:4px 8px;border-bottom:1px solid #eee;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${q.title}</td><td style="padding:4px 8px;border-bottom:1px solid #eee">${q.category?.name || '—'}</td></tr>`;
    });

    const tableRows = rows.length > 0
      ? `<table style="border-collapse:collapse;width:100%;font-size:13px">${rows.join('')}</table>`
      : '<p style="color:#666;font-size:13px">No queries were submitted in the last 24 hours.</p>';

    const html = `<div style="font-family:sans-serif;max-width:600px">
      <h2 style="color:#0032c4;border-bottom:2px solid #0032c4;padding-bottom:8px">📊 VINS · Yaksha — Admin Daily Digest</h2>
      <p style="color:#555;font-size:13px">Summary of query activity in the last 24 hours (since ${since.toLocaleString('en-IN', { timeZone: 'Asia/Calcutta' })} IST).</p>

      <div style="display:flex;gap:12px;margin:16px 0">
        <div style="flex:1;background:#f0f4ff;border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:24px;font-weight:bold;color:#0032c4">${counts.new}</div>
          <div style="font-size:12px;color:#555">New</div>
        </div>
        <div style="flex:1;background:#fffbea;border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:24px;font-weight:bold;color:#b45309">${counts.in_progress}</div>
          <div style="font-size:12px;color:#555">In Progress</div>
        </div>
        <div style="flex:1;background:#f0fdf4;border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:24px;font-weight:bold;color:#16a34a">${counts.answered}</div>
          <div style="font-size:12px;color:#555">Answered</div>
        </div>
        <div style="flex:1;background:#fef2f2;border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:24px;font-weight:bold;color:#dc2626">${counts.escalated}</div>
          <div style="font-size:12px;color:#555">Escalated</div>
        </div>
      </div>

      <h3 style="font-size:14px;color:#333;margin-bottom:8px">Recent Queries</h3>
      ${tableRows}

      <p style="margin-top:20px;font-size:12px;color:#999">This is an automated digest from the VINS · Yaksha FAQ Platform. To manage notification preferences, contact your system administrator.</p>
    </div>`;

    const adminEmails = admins.map((a) => a.email);
    await sendMail(adminEmails, '📊 Daily Digest — VINS · Yaksha FAQ Platform', html);
    console.log(`📊 Admin digest sent to ${adminEmails.length} admin(s) — new:${counts.new} in-progress:${counts.in_progress} answered:${counts.answered} escalated:${counts.escalated}`);
  } catch (err) {
    console.error('📊 Admin digest error:', err.message);
  }
}

module.exports = { sendAdminDigest };