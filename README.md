# PulseScore
> NPS and CSAT survey tool for indie SaaS founders — widget embed, email surveys, and trend dashboard in one place.

## What This Is

PulseScore is a working mockup of a lightweight NPS survey product. It demonstrates the three core flows that Delighted users rely on: embedding a floating NPS widget in their app, sending NPS surveys by email, and viewing their NPS score with a 30-day trend chart. The mockup ships with 45 seeded responses so every screen is live with realistic data from the moment you click Run.

## How to Run

### On Replit (recommended)
1. Go to: https://replit.com/new/github/Gabangxa/pulsescore
2. Click **Run** — no configuration needed
3. Open the web preview

### Locally
```bash
npm install
npm start        # http://localhost:3000
```

## What's Built

- `GET /` — Landing page: headline, feature grid, competitor comparison table, CTA
- `GET /dashboard` — Main app: NPS score, breakdown, 30-day trend chart, response table with 5 tabs
- `GET /widget.js` — Self-contained embeddable NPS widget script (floating, bottom-right)
- `GET /survey/:token` — Standalone email survey response page (for survey links sent by email)
- `POST /api/response` — Saves an NPS response, fires webhook if configured, returns `{ ok: true }`
- `POST /api/send-survey` — Sends NPS emails via Nodemailer/Ethereal; returns `{ ok: true, sent: N }`
- `GET /api/responses` — Returns all responses + computed NPS score, breakdown percentages, 30-day chart data
- `GET /api/export` — Returns a CSV download of all responses (Date, Score, Comment, Email, Segment)
- `POST /api/webhook-test` — Fires a test POST to a user-supplied URL
- `GET /api/projects` — Lists all projects
- `POST /api/projects` — Creates a new project

## How It's Supposed to Work

1. User visits `/` — sees the landing page explaining PulseScore as the Delighted replacement
2. User clicks "Start free" → arrives at `/dashboard` already populated with 45 seeded responses
3. Dashboard shows NPS score (e.g. `+47`), promoter/passive/detractor bars, and a 30-day trend chart
4. User clicks **Install Widget** tab → sees a `<script>` embed tag with a one-click copy button and a live inline widget preview
5. User clicks **Send Survey** tab → pastes email addresses → hits "Send NPS Survey" → receives toast: "Sent to N recipients"
6. A recipient follows the survey link → `/survey/:token` → picks score 0–10 → adds comment → submits → sees thank-you screen
7. New response appears in the dashboard Responses tab in real time (refresh loads it)

## Stack

- Runtime: Node.js 20
- Framework: Express 4
- Frontend: Plain HTML + CSS + vanilla JS (no build step)
- Database: better-sqlite3 (embedded SQLite — no external DB)
- Email: Nodemailer + Ethereal SMTP (test accounts, no credentials needed)
- Charts: Chart.js 4 via CDN
- Deployment: Replit (cloudrun)

## What's Not Built Yet

- Auth / user accounts (mockup runs in single-tenant demo mode)
- Real Stripe billing
- Multi-project UI (sidebar shows one project; API supports multiple)
- CSV import of Delighted export history
- Slack native app (webhook covers the use case)
- Sentiment AI on responses
- 7-day and 90-day chart range toggles

## Files

```
pulsescore/
├── server.js          — Express app entry point; listens on PORT || 3000, binds 0.0.0.0
├── db.js              — SQLite setup via better-sqlite3; seeds 45 demo responses on first run
├── package.json       — Dependencies + "start" script
├── .replit            — Replit run config (cloudrun, port 3000 → 80)
├── replit.nix         — Nix environment (nodejs-20_x)
├── routes/
│   ├── api.js         — All /api/* routes (responses, export, send-survey, webhook-test)
│   └── pages.js       — Page routes (/, /dashboard, /survey/:token)
├── public/
│   ├── style.css      — Global base styles
│   ├── dashboard.js   — Dashboard page JS: Chart.js calls, fetch /api/responses, tab switching
│   └── widget.js      — Self-contained embeddable NPS widget (served at GET /widget.js)
└── views/
    ├── landing.html   — Marketing landing page with competitor table
    ├── dashboard.html — Full app dashboard with 5-tab layout
    └── survey.html    — Standalone email survey response page
```

---
*Mockup generated 2026-03-30 · Research: research.md*
