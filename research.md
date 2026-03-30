# Delighted-Exit NPS Tool for Indie SaaS
**Slug**: `nps-survey-micro-saas`
**Date**: 2026-03-30
**Score**: 21/25

## Problem

Delighted — the simplest, most beloved NPS tool on the market — is permanently shutting down June 30, 2026 (owned by Qualtrics, which is consolidating to its enterprise AI suite). Thousands of indie SaaS founders, small teams, and solo builders who relied on Delighted's simple widget + email survey + trend dashboard now have nowhere affordable to go.

- Qualtrics is offering **no refunds** and **no migration help** — users must manually export CSVs project by project
- Annual renewals stopped July 2025; platform goes dark June 30, 2026
- The cheapest credible NPS replacement is Retently at **$100/mo** (1,000 sends) or Survicate at **€99/mo**
- Indie teams at $0–$30K MRR cannot justify 5–10× price increases for the same core functionality
- Every "Delighted alternatives 2026" article on Retently, Simplesat, and Eletive confirms the gap: no affordable, pure-play NPS/CSAT tool exists in the $15–29/mo range

## Market

- **NPS Software global market**: ~$5B (2025), growing ~12% YoY
- **Indie/small SaaS segment**: Estimated $50–100M TAM (1–100 employee SaaS companies)
- **Immediate displacement pool**: Thousands of active Delighted accounts, majority on free or $17–99/mo plans — all need a replacement by June 30, 2026
- **Search signal**: "Delighted alternatives 2026" articles are proliferating on G2, Capterra, Retently blog, Eletive blog — clear demand-led discovery channel
- **Willingness to pay**: Delighted users were paying $17–249/mo; targeting $19/mo recaptures the majority

## Existing Solutions (Competitor Matrix)

| Tool | Pricing | Key Weakness |
|---|---|---|
| **Delighted** (sunsetting) | Free / $99–$249/mo | Shutting down June 30, 2026 — exits the market entirely |
| **Retently** | $100–$599/mo | 5× too expensive for indie; no team under $5K MRR can justify |
| **Survicate** | €99–€299/mo | Same problem; general survey platform not pure NPS |
| **SurveySparrow** | $25/user/mo | Per-user pricing balloons fast; general survey tool |
| **Nicereply** | $59–$359/mo | Help-desk oriented (Zendesk/Freshdesk); $59 minimum is still steep |
| **Simplesat** | ~$49+/mo (opaque) | Also help-desk focused, not product-native; opaque pricing |
| **Refiner.io** | ~$79/mo | More product analytics than NPS; heavy for the job-to-be-done |
| **Typeform** | $50+/mo | Not NPS-specific; no NPS scoring/trend; general form builder |

**The gap**: No purpose-built NPS/CSAT tool for indie SaaS at $15–29/mo with a clean JS widget, email delivery, and trend dashboard. This is the exact feature set Delighted offered.

## The Improvement Angle

Build a **Delighted-like experience** at $19/mo:
- One-click JS embed (copy-paste `<script>` tag → NPS widget live in 60 seconds)
- Email survey delivery (CSV upload or API — send NPS surveys to any list)
- NPS score trend dashboard (7 / 30 / 90-day rolling views)
- Promoter / Passive / Detractor breakdown + verbatim responses
- Webhook delivery for new responses (send to Slack, Zapier, etc.)
- CSV export (migration-friendly — Delighted users know this workflow)

No Salesforce integration, no sentiment AI, no enterprise SSO — just the clean core Delighted users loved, for 5× less.

## Proposed Solution

**PulseScore** — a drop-in Delighted replacement for indie SaaS founders.

**Core flows:**
1. **Create survey project** → choose NPS or CSAT type, set branding (logo, color)
2. **Install widget** → copy one `<script>` tag → floating NPS widget appears after configurable delay or trigger
3. **Send email survey** → CSV upload or manual list → personalized NPS email dispatched
4. **Collect responses** → stored, deduplicated (no survey spam to same user < 90 days)
5. **View dashboard** → live NPS score, trend chart, response list, promoter/detractor breakdown
6. **Export & integrate** → CSV export + webhook to Slack/Zapier on new response

## Revenue Model

| Tier | Price | Limits | Target |
|---|---|---|---|
| Free | $0 | 50 responses/mo, 1 project | Testers, early-stage |
| Starter | $19/mo | 500 responses/mo, 3 projects, widget + email | Ex-Delighted free users |
| Pro | $49/mo | 5,000 responses/mo, unlimited projects, API + webhooks | Paying Delighted migrants |

**Path to $10K MRR:**
- Mix assumption: 70% Starter ($19) + 30% Pro ($49)
- Weighted ARPU: ~$27.50/mo
- Required accounts: ~364 paying customers
- Acquisition: "Delighted migration" content, Reddit/indie hacker posts, Product Hunt launch before June 30 deadline
- Timeline: Launch by May 1 → June 30 shutdown creates natural urgency spike → 200+ paying customers plausible by July

## MVP Scope

**v0.1 ruthlessly minimal (target: 4 weeks to launch):**
- [ ] Account creation (email + password)
- [ ] Survey project CRUD (name, type NPS/CSAT, branding color)
- [ ] JS embed snippet generation (floating widget, 0–1–10 scale + comment field)
- [ ] Response collection endpoint (`POST /r/:surveyId`)
- [ ] NPS score calculator (promoter/passive/detractor segmentation)
- [ ] 30-day trend chart (Chart.js line graph)
- [ ] Response list table (date, score, comment, respondent email)
- [ ] CSV export of all responses
- [ ] Email survey send (SMTP via Nodemailer, CSV upload or paste list)
- [ ] Webhook config (POST payload to user URL on new response)
- [ ] Stripe billing ($19 / $49 plans)
- [ ] Landing page with "Delighted migration" copy + free CSV import

**Out of v0.1:**
- Slack native app, SSO, sentiment AI, mobile SDK, Salesforce/HubSpot connectors

## Unfair Advantage

- **Timing**: June 30, 2026 deadline creates a 90-day forced-migration event — every Delighted user needs a decision by May/June. A launch in May hits the urgency peak.
- **Positioning**: "The simple Delighted replacement at $19/mo" is a self-writing headline. No need to invent demand — it already exists.
- **Price gap**: 5× cheaper than the cheapest serious alternative (Retently $100/mo). Undercut is not marginal — it's structural.
- **Migration story**: One-click CSV import of Delighted responses keeps historical data intact — the single biggest fear of migrating users.

## Rejected Candidates

| Slug | Theme | Reason Rejected |
|---|---|---|
| `notion-client-status-digest` | workflow-automation | Notion Custom Agents (Feb 2026) now solve this natively within Business/Enterprise plans; thin moat |
| `creator-digital-storefront` | niche-marketplace | Market saturated — Sellfy ($22/mo), Payhip ($29/mo), Podia ($39/mo) all exist; no differentiation angle |
| `youtube-thumbnail-ab-tester` | design-content | YouTube has native free A/B testing (Test & Compare); CollabPals is free; no reason to pay |
| `freelancer-1099-income-tracker` | hr-legal | Bonsai, FlyFin, QuickBooks SE cover the domestic case; international niche too small for quick $10K MRR |
