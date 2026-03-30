const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'pulsescore.db');
const db = new Database(DB_PATH);

// Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'nps',
    webhook_url TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS survey_tokens (
    token TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    respondent_email TEXT,
    created_at TEXT NOT NULL,
    used INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS responses (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    comment TEXT,
    respondent_email TEXT,
    segment TEXT,
    created_at TEXT NOT NULL
  );
`);

// Seed a default project + 45 realistic responses if empty
function seed() {
  const existing = db.prepare('SELECT COUNT(*) as c FROM projects').get();
  if (existing.c > 0) return;

  const projectId = 'proj-demo-001';
  db.prepare(`INSERT INTO projects (id, name, type, webhook_url, created_at) VALUES (?, ?, 'nps', NULL, ?)`).run(
    projectId,
    'My SaaS Product',
    new Date().toISOString()
  );

  const comments = {
    promoter: [
      'Love the product — onboarding was seamless.',
      'Best tool in its category. Would recommend to every founder.',
      'Clean UI and fast. Exactly what I needed.',
      'Switched from Delighted and haven\'t looked back.',
      'The trend dashboard alone is worth it.',
      'Incredibly easy to set up. Embedded in 5 minutes.',
    ],
    passive: [
      'Good tool, docs could be more detailed.',
      'Works well, pricing is fair.',
      'Solid product. Would like a Slack integration.',
      'Does the job. Nothing flashy but reliable.',
      'Happy with it, just wish export was faster.',
    ],
    detractor: [
      'Pricing is confusing.',
      'Had some issues with email delivery.',
      'Docs need work — hard to get started.',
      'Support response was slow.',
      'Widget didn\'t load on our React app at first.',
    ]
  };

  const segments = ['free', 'starter', 'pro'];
  const emails = [
    'alex@startupxyz.io', 'morgan@devtools.co', 'jordan@saasapp.com',
    'casey@indiefounder.dev', 'riley@microapp.io', 'drew@buildinpublic.co',
    'quinn@solodev.net', 'avery@founderhive.com', 'blake@nanoapp.io',
    'sam@launchpad.dev', 'taylor@indie.tools', 'jamie@solobuilt.com',
    'reese@smallsaas.io', 'charlie@hackertools.dev', 'finley@buildr.co'
  ];

  const now = Date.now();
  const DAY_MS = 86400000;

  // Distribute 45 responses over 30 days
  // Distribution: ~30% promoters (9-10), ~50% passives (7-8), ~20% detractors (0-6)
  const scoreDistrib = [
    // detractors
    1, 2, 3, 4, 4, 5, 6, 6, 6,
    // passives
    7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8,
    // promoters
    9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10
  ];

  scoreDistrib.forEach((score, i) => {
    const daysAgo = Math.floor((i / 45) * 30);
    const date = new Date(now - daysAgo * DAY_MS - Math.random() * DAY_MS * 0.8);
    const segment = score >= 9 ? 'promoter' : score >= 7 ? 'passive' : 'detractor';
    const commentPool = comments[segment];
    const comment = commentPool[Math.floor(Math.random() * commentPool.length)];
    const email = emails[i % emails.length];

    db.prepare(`INSERT INTO responses (id, project_id, score, comment, respondent_email, segment, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
      uuidv4(), projectId, score, comment, email, segment, date.toISOString()
    );
  });

  console.log('[db] Seeded demo project with 45 responses.');
}

seed();

module.exports = db;
