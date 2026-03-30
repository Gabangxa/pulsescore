# Mockup Brief: PulseScore

**Product name**: PulseScore
**Slug**: `nps-survey-micro-saas`
**Research file**: `research/2026-03-30-0900/research.md`

---

## What to Build

A Delighted-replacement NPS/CSAT survey tool for indie SaaS founders. The MVP is a web app where a user can:

1. Sign up → create an NPS survey project
2. Get a copy-paste `<script>` embed tag → NPS widget (0–10 scale + comment) floats on their app
3. Manually send NPS email surveys to a list of addresses
4. View a live dashboard: NPS score, 30-day trend chart, promoter/passive/detractor breakdown, response list
5. Export all responses as CSV
6. Configure a webhook URL to receive a POST on every new response

No auth integration, no Stripe billing, no AI — just the working mockup of those 5 flows.

---

## Pages / Routes Required

### Frontend pages (HTML/CSS/JS)
1. **`/`** — Landing page
   - Headline: "The simple Delighted replacement. $19/mo."
   - Subhead: "Delighted shuts down June 30, 2026. PulseScore gives you everything you loved — widget, email surveys, trend dashboard — for 5× less."
   - CTA button: "Start free — no credit card"
   - Feature grid (3 cards): "Embed in 60 seconds" / "Email surveys" / "NPS trend dashboard"
   - Competitor comparison table: PulseScore vs Delighted vs Retently vs Survicate (price + key features)
   - Footer: "PulseScore — Built for indie SaaS founders"

2. **`/dashboard`** — Main app dashboard
   - Left sidebar: project list + "New Project" button
   - Main area: NPS score big number (e.g. "+47"), Promoter/Passive/Detractor % badges
   - Chart.js line chart: 30-day NPS trend (seed with mock data)
   - Responses table: columns = Date | Score | Comment | Respondent Email | Segment
   - Tab strip: "Overview" | "Responses" | "Send Survey" | "Install Widget" | "Settings"

3. **`/dashboard` → "Install Widget" tab** — Embed instructions
   - Show generated `<script>` tag (copy button)
   - Live preview iframe of the NPS widget

4. **`/dashboard` → "Send Survey" tab** — Email survey sender
   - Textarea: paste email addresses (one per line or comma-separated)
   - "Send NPS Survey" button → POST to `/api/send-survey`
   - Status toast: "Sent to N recipients"

5. **`/widget.js`** — The embeddable JS widget
   - Loads a floating NPS survey overlay (bottom-right corner)
   - Asks "How likely are you to recommend us? (0–10)" with number buttons
   - Follow-up: comment textarea
   - On submit: POST to `/api/response`
   - Shows thank-you message, then closes

6. **`/survey/:token`** — Email survey response page
   - Standalone page (for email survey links)
   - Same 0–10 NPS + comment flow as widget
   - On submit: POST to `/api/response`

### Backend routes (Express)
- `GET /` — landing page
- `GET /dashboard` — dashboard app
- `GET /widget.js` — serve embed JS
- `GET /survey/:token` — email survey page
- `POST /api/response` — save response `{ surveyId, score, comment, respondent }`
- `POST /api/send-survey` — send NPS emails to list (Nodemailer + Ethereal for demo)
- `GET /api/responses` — return all responses as JSON (for dashboard)
- `GET /api/export` — return CSV of all responses
- `POST /api/webhook-test` — fire a test webhook POST to configured URL

---

## Data (Seed / Mock)

Pre-seed the database with 45 realistic NPS responses spread over 30 days:
- Mix of scores 0–10 (realistic distribution: ~30% promoters 9–10, ~50% passives 7–8, ~20% detractors 0–6)
- Mix of comments (positive: "love the product", "great UX"; negative: "pricing is confusing", "docs need work")
- Calculated NPS: promoter% - detractor% → show as a real integer (e.g. +32)
- Chart data: daily NPS average over 30 days (seed as slightly trending up)

---

## Tech Stack

`Node.js + Express (HTML/CSS/JS)`

**Dependencies (all npm, no build step):**
- `express` — HTTP server
- `better-sqlite3` — embedded SQLite (no external DB needed on Replit)
- `nodemailer` — email sending (use Ethereal for mock SMTP in demo)
- `chart.js` via CDN in HTML (no npm install)
- `node-fetch` — webhook delivery
- `uuid` — survey/response token generation
- `csv-stringify` — CSV export

**No React, no Vite, no Next.js, no build step.**

---

## File Structure

```
pulsescore/
├── package.json
├── server.js              ← main Express app
├── db.js                  ← better-sqlite3 setup + seed
├── routes/
│   ├── api.js             ← all /api/* routes
│   └── pages.js           ← GET /, /dashboard, /survey/:token
├── public/
│   ├── style.css          ← global styles
│   ├── dashboard.js       ← dashboard page JS (Chart.js calls, fetch /api/responses)
│   └── widget.js          ← embeddable widget script (served at /widget.js)
└── views/
    ├── landing.html
    ├── dashboard.html
    └── survey.html
```

---

## Visual Style

- Clean, minimal SaaS aesthetic. White background, dark text.
- Primary color: `#6366f1` (indigo — professional, not startup-neon)
- Font: system-ui stack (no Google Fonts CDN needed)
- NPS score: display as large `+47` style number, green for positive, red for negative
- Charts: Chart.js default palette with `#6366f1` line color
- Mobile-responsive grid (CSS Grid/Flexbox, no framework)
- Widget: white card, bottom-right fixed position, soft shadow, smooth slide-in animation

---

## Acceptance Criteria

The mockup is complete when:
- [ ] `GET /` returns the landing page with competitor table visible
- [ ] `GET /dashboard` shows NPS score, trend chart (seeded data), and response table
- [ ] `GET /widget.js` returns the embeddable JS
- [ ] `POST /api/response` saves a response and returns `{ ok: true }`
- [ ] `GET /api/export` returns a valid CSV with all seeded responses
- [ ] `POST /api/send-survey` logs "Sent to N recipients" (Ethereal or console OK for demo)
- [ ] Dashboard "Install Widget" tab shows a `<script>` tag and a preview of the widget
- [ ] Server listens on `process.env.PORT || 3000`, bound to `0.0.0.0`

---

## Repo & Publishing Instructions

1. Create GitHub repo: `Gabangxa/pulsescore` (public)
2. Push all code
3. Import repo into Replit at replit.com/new — click Run. No config needed.
4. Return the GitHub repo URL and Replit import URL in your completion report.
