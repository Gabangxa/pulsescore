const express = require('express');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const { stringify } = require('csv-stringify/sync');
const db = require('../db');

const router = express.Router();

// GET /api/responses — all responses for the demo project
router.get('/responses', (req, res) => {
  const projectId = req.query.projectId || 'proj-demo-001';
  const rows = db.prepare(
    'SELECT * FROM responses WHERE project_id = ? ORDER BY created_at DESC'
  ).all(projectId);

  const promoters = rows.filter(r => r.score >= 9).length;
  const passives = rows.filter(r => r.score >= 7 && r.score < 9).length;
  const detractors = rows.filter(r => r.score < 7).length;
  const total = rows.length;
  const nps = total > 0
    ? Math.round(((promoters - detractors) / total) * 100)
    : 0;

  // Build 30-day daily NPS chart data
  const now = new Date();
  const chartLabels = [];
  const chartData = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    chartLabels.push(dateStr.slice(5)); // MM-DD

    const dayRows = rows.filter(r => r.created_at.startsWith(dateStr));
    if (dayRows.length === 0) {
      chartData.push(null);
    } else {
      const dp = dayRows.filter(r => r.score >= 9).length;
      const dd = dayRows.filter(r => r.score < 7).length;
      chartData.push(Math.round(((dp - dd) / dayRows.length) * 100));
    }
  }

  res.json({
    nps,
    total,
    promoters,
    passives,
    detractors,
    promoterPct: total > 0 ? Math.round((promoters / total) * 100) : 0,
    passivePct: total > 0 ? Math.round((passives / total) * 100) : 0,
    detractorPct: total > 0 ? Math.round((detractors / total) * 100) : 0,
    chartLabels,
    chartData,
    responses: rows
  });
});

// POST /api/response — save a response
router.post('/response', (req, res) => {
  const { surveyId, score, comment, respondent, token } = req.body;
  const projectId = surveyId || 'proj-demo-001';

  if (score === undefined || score === null || score < 0 || score > 10) {
    return res.status(400).json({ ok: false, error: 'Score must be 0–10' });
  }

  const segment = score >= 9 ? 'promoter' : score >= 7 ? 'passive' : 'detractor';
  const id = uuidv4();

  db.prepare(
    `INSERT INTO responses (id, project_id, score, comment, respondent_email, segment, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, projectId, parseInt(score), comment || '', respondent || '', segment, new Date().toISOString());

  // Mark token as used if provided
  if (token) {
    db.prepare('UPDATE survey_tokens SET used = 1 WHERE token = ?').run(token);
  }

  // Fire webhook if configured
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
  if (project && project.webhook_url) {
    fetch(project.webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'response.created', responseId: id, score, segment, comment, respondent })
    }).catch(err => console.warn('[webhook] delivery failed:', err.message));
  }

  res.json({ ok: true, id, segment });
});

// GET /api/export — CSV download
router.get('/export', (req, res) => {
  const projectId = req.query.projectId || 'proj-demo-001';
  const rows = db.prepare(
    'SELECT created_at, score, comment, respondent_email, segment FROM responses WHERE project_id = ? ORDER BY created_at DESC'
  ).all(projectId);

  const csv = stringify(rows, {
    header: true,
    columns: [
      { key: 'created_at', header: 'Date' },
      { key: 'score', header: 'Score' },
      { key: 'comment', header: 'Comment' },
      { key: 'respondent_email', header: 'Email' },
      { key: 'segment', header: 'Segment' }
    ]
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="pulsescore-responses.csv"');
  res.send(csv);
});

// POST /api/send-survey — send NPS emails (Ethereal demo SMTP)
router.post('/send-survey', async (req, res) => {
  const { emails, projectId } = req.body;
  if (!emails) return res.status(400).json({ ok: false, error: 'No emails provided' });

  const list = emails
    .split(/[\n,]+/)
    .map(e => e.trim())
    .filter(e => e.includes('@'));

  if (list.length === 0) {
    return res.status(400).json({ ok: false, error: 'No valid email addresses found' });
  }

  const pid = projectId || 'proj-demo-001';
  const tokens = list.map(email => {
    const token = uuidv4();
    db.prepare('INSERT INTO survey_tokens (token, project_id, respondent_email, created_at) VALUES (?, ?, ?, ?)').run(
      token, pid, email, new Date().toISOString()
    );
    return { email, token };
  });

  // Use Ethereal for demo — creates a test account automatically
  let testAccount;
  try {
    testAccount = await nodemailer.createTestAccount();
  } catch {
    // If Ethereal is unreachable, simulate send
    console.log(`[send-survey] Ethereal unavailable — simulating send to ${list.length} recipients`);
    return res.json({ ok: true, sent: list.length, message: `Simulated send to ${list.length} recipient(s)` });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: { user: testAccount.user, pass: testAccount.pass }
  });

  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  let sent = 0;

  for (const { email, token } of tokens) {
    const surveyUrl = `${baseUrl}/survey/${token}`;
    try {
      const info = await transporter.sendMail({
        from: '"PulseScore" <noreply@pulsescore.app>',
        to: email,
        subject: 'How likely are you to recommend us? (30 seconds)',
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px">
            <h2 style="color:#1a1a2e;font-size:20px;margin-bottom:8px">How are we doing?</h2>
            <p style="color:#555;font-size:15px;line-height:1.5;margin-bottom:24px">
              On a scale of 0–10, how likely are you to recommend us to a friend or colleague?
            </p>
            <a href="${surveyUrl}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px">
              Give feedback →
            </a>
            <p style="color:#999;font-size:12px;margin-top:24px">
              Takes 30 seconds. Powered by PulseScore.
            </p>
          </div>
        `
      });
      console.log(`[email] Sent to ${email} — Preview: ${nodemailer.getTestMessageUrl(info)}`);
      sent++;
    } catch (err) {
      console.warn(`[email] Failed for ${email}:`, err.message);
    }
  }

  res.json({ ok: true, sent, message: `Sent to ${sent} recipient(s)` });
});

// GET /api/projects — list projects
router.get('/projects', (req, res) => {
  const rows = db.prepare('SELECT * FROM projects ORDER BY created_at ASC').all();
  res.json(rows);
});

// POST /api/projects — create project
router.post('/projects', (req, res) => {
  const { name, type } = req.body;
  if (!name) return res.status(400).json({ ok: false, error: 'Name required' });
  const id = uuidv4();
  db.prepare('INSERT INTO projects (id, name, type, created_at) VALUES (?, ?, ?, ?)').run(
    id, name, type || 'nps', new Date().toISOString()
  );
  res.json({ ok: true, id, name });
});

// POST /api/webhook-test — fire a test webhook
router.post('/webhook-test', async (req, res) => {
  const { webhookUrl } = req.body;
  if (!webhookUrl) return res.status(400).json({ ok: false, error: 'webhookUrl required' });

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'response.created',
        test: true,
        responseId: 'test-' + uuidv4(),
        score: 9,
        segment: 'promoter',
        comment: 'This is a test webhook from PulseScore',
        respondent: 'test@example.com'
      }),
      timeout: 5000
    });
    res.json({ ok: true, status: response.status });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

module.exports = router;
