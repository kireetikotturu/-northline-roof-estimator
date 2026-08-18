# Northline Roofing — Config-Driven Estimator & Owner Panel

A full-stack, **configuration-driven** web application for a roofing company. The
entire public estimator — every question, option, limit, and price — is fetched from
a database at runtime. Nothing about pricing or form structure is hardcoded in the
frontend, so the business owner can change rates, edit question copy, or hide a
question entirely from a web dashboard, with zero code changes and zero redeploys.

**Live demo (Public Estimator):** https://northline-roof-estimator-9ig83lahw-kireetikotturus-projects.vercel.app/
**Live API (Backend):** https://northline-roof-estimator-3r6h.onrender.com
**Owner Panel:** https://northline-roof-estimator-9ig83lahw-kireetikotturus-projects.vercel.app/admin/login

> The backend is hosted on Render's free tier, which spins down after periods of
> inactivity. The first request after a while can take 30–60 seconds to wake up —
> that's expected, not a bug.

---

## 1. The problem this solves

Northline Roofing was fielding a lot of "tire-kicker" phone calls — people who just
wanted a ballpark number before deciding whether to bother getting a real quote.
Every one of those calls costs Dale (the owner) or Marcus (his bookkeeper) time they
could spend on real jobs. At the same time, roofing prices change often (material
costs fluctuate, labor rates shift seasonally), and neither Dale nor Marcus can edit
code.

This project solves both problems with two connected surfaces:

1. **Public Estimator** — customers answer a handful of quick questions about their
   roof and immediately get a realistic cost *range*, no phone call required.
2. **Owner Panel** — Dale or Marcus can log in, update rates/multipliers, toggle a
   question on or off, edit labels, and review every lead that's come in — all
   through a UI, with changes going live instantly.

The pricing formula and every rate are kept **entirely server-side**, so the number a
customer sees can never be tampered with from the browser, and the business's
pricing logic is never exposed in the frontend's source code.

---

## 2. Tech stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 (Vite), Tailwind CSS, Framer Motion, React Router, Axios | Fast dev/build via Vite; Tailwind + Framer Motion give a polished, animated UI without hand-rolled CSS; the whole UI is driven by API responses rather than fixed markup. |
| Backend | Node.js + Express | A small, predictable REST API — one controller per concern (config, estimate, auth, admin). |
| Database | MongoDB + Mongoose | The `Config` document (questions → options → pricing fields) is naturally a single nested document, read as one blob far more often than queried piecemeal — a good fit for a document database. |
| Auth | JWT (`jsonwebtoken`), Bearer token | Works reliably across two separately-hosted origins (Vercel + Render) without the cross-site cookie configuration headaches (`SameSite`, `Secure`, exact-domain matching) that session cookies bring. |
| Hosting | Vercel (frontend) · Render (backend) · MongoDB Atlas (database) | Free tiers, and the exact combination recommended for this kind of split-deployment app. |

---

## 3. Architecture — how the pieces connect

```
┌─────────────────────┐        HTTPS / JSON        ┌──────────────────────┐        Mongoose        ┌──────────────┐
│   React Frontend     │ ─────────────────────────► │   Express Backend     │ ──────────────────────►│   MongoDB     │
│   (Vercel)           │ ◄───────────────────────── │   (Render)            │ ◄──────────────────────│   (Atlas)     │
│                       │                             │                       │                         │              │
│ • Public Estimator    │   GET  /api/config          │ • configController    │    Config collection    │ • Config doc  │
│ • Owner Panel         │   POST /api/estimate        │ • estimateController  │    (versioned)           │   (active: T) │
│   (JWT-protected)     │   POST /api/auth/login       │ • authController      │    Lead collection      │ • Lead docs   │
│                       │   GET/PUT /api/admin/config │ • adminController     │                          │               │
│                       │   GET  /api/admin/leads     │ • calculator.js       │                          │               │
└─────────────────────┘   (Bearer JWT on /admin/*)   └──────────────────────┘                         └──────────────┘
```

**Key architectural decisions:**

- **Rates never leave the server.** `GET /api/config` (public) strips every pricing
  field (`rate_per_sqft`, `multiplier`, `tear_off_per_sqft`) before responding —
  the frontend only ever receives question labels, types, and option labels. Only the
  JWT-protected `GET /api/admin/config` returns full pricing data, for the owner's
  editor.
- **Pricing math happens in exactly one place** — `server/src/services/calculator.js`
  — and nowhere else. The frontend sends raw answers; the server computes and returns
  only the final `{ estimate_low, estimate_high }` range.
- **Config changes are versioned, not overwritten.** Saving in the Owner Panel doesn't
  mutate the live document — it deactivates the current one and inserts a new document
  with `config_version + 1`. Every `Lead` stores the exact `config_version` that priced
  it, so a later rate change never silently rewrites a past customer's estimate.
- **Two independently deployable services.** The frontend is a static Vite build
  (Vercel); the backend is a long-running Node process (Render). They only ever talk
  over HTTP(S), governed by CORS (`CLIENT_ORIGIN` on the backend must exactly match
  the frontend's deployed origin).

---

## 4. Folder structure

```
roof-estimator-monorepo/
├── client/                              # Frontend — React (Vite) + Tailwind
│   ├── public/
│   │   └── roof-favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── dynamic/
│   │   │   │   └── QuestionField.jsx     # Renders ONE question (number or select) — purely config-driven, no hardcoded copy
│   │   │   ├── estimator/
│   │   │   │   ├── Hero.jsx              # Landing hero + animated roof-pitch signature graphic
│   │   │   │   ├── StepWizard.jsx        # Orchestrates the entire public flow: fetch config → step through questions → contact → submit
│   │   │   │   ├── ProgressBar.jsx       # Step indicator
│   │   │   │   ├── ContactForm.jsx       # Final "your details" step (name/phone/email)
│   │   │   │   └── ResultDisplay.jsx     # Animated count-up reveal of the estimate range
│   │   │   ├── owner/
│   │   │   │   ├── ConfigEditor.jsx      # Rates / multipliers / question toggles / labels
│   │   │   │   └── LeadsTable.jsx        # Expandable table of captured leads
│   │   │   └── ui/
│   │   │       ├── Navbar.jsx, Footer.jsx, Logo.jsx, ThemeToggle.jsx
│   │   ├── pages/
│   │   │   ├── EstimatorPage.jsx         # Public route "/"
│   │   │   ├── AdminLogin.jsx            # "/admin/login"
│   │   │   └── AdminDashboard.jsx        # "/admin" (JWT-protected)
│   │   ├── context/ThemeContext.jsx      # Light/dark mode, persisted to localStorage
│   │   ├── hooks/useAuth.js              # Owner session state (verifies JWT on load)
│   │   ├── services/api.js               # Every backend call lives here — single source of truth for API access
│   │   ├── App.jsx                       # Routes + auth guard (ProtectedRoute)
│   │   ├── main.jsx                      # React entry point
│   │   └── index.css                     # Tailwind layers + design tokens (buttons, cards, fields, focus states)
│   ├── index.html
│   ├── tailwind.config.js                # Color palette, fonts, custom animations/keyframes
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
│
├── server/                              # Backend — Express REST API
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                     # Mongoose connection setup
│   │   │   └── seed.js                   # Seeds the active Config (v3) + two demo leads
│   │   ├── models/
│   │   │   ├── Config.js                 # Questions, options, business info, global modifiers — Mongoose schema
│   │   │   └── Lead.js                   # Captured customer + submitted answers + calculated estimate + config_version
│   │   ├── controllers/
│   │   │   ├── configController.js       # GET /api/config — public, rates stripped
│   │   │   ├── estimateController.js     # POST /api/estimate — public, validates + calculates + stores lead
│   │   │   ├── authController.js         # POST /api/auth/login, GET /api/auth/verify
│   │   │   └── adminController.js        # GET/PUT /api/admin/config, GET /api/admin/leads — all JWT-protected
│   │   ├── middleware/
│   │   │   └── auth.js                   # requireOwnerAuth — verifies the Bearer JWT on every /api/admin/* route
│   │   ├── services/
│   │   │   └── calculator.js             # THE pricing formula + server-side answer validation — the only place math happens
│   │   ├── routes/
│   │   │   ├── configRoutes.js, estimateRoutes.js, authRoutes.js, adminRoutes.js
│   │   └── index.js                      # App wiring: CORS, JSON parsing, rate limiting, route mounting, DB connect + boot
│   ├── package.json
│   └── .env.example
│
├── DECISIONS.md                          # Architectural decisions, pricing formula explained in plain language, scope notes
├── AI_LOG.md                             # AI tool usage log (required by the assignment brief)
├── README.md                             # You are here
└── package.json                          # Root orchestration scripts (npm run dev, install:all, seed, etc.)
```

---

## 5. How it works, end to end (every function, in order)

1. **A customer visits the site.**
   `EstimatorPage` mounts and calls `fetchPublicConfig()` (from `services/api.js`),
   which hits `GET /api/config`.

2. **The backend resolves the active config.**
   `configController.getPublicConfig()` queries MongoDB for the one `Config` document
   with `active: true`, filters to only `active` questions, sorts them by `order`, and
   strips every pricing field from each option before responding. The response shape
   is: `{ config_version, business, questions: [{ key, label, type, unit, required,
   min, max, options: [{ value, label }] }] }`.

3. **`StepWizard` renders the wizard from that response.**
   For each question, `QuestionField` decides whether to render a number input or a
   set of selectable option cards, based purely on `question.type` — the component has
   no knowledge of specific question keys like `"roof_area"` or `"material"`. Answers
   are held in local state, keyed by `question.key`.

4. **The customer steps through questions, then fills in contact info.**
   `ContactForm` validates name/phone/email client-side (for UX — real validation
   happens server-side too) before enabling submit.

5. **On submit, `submitEstimate()` calls `POST /api/estimate`** with
   `{ name, phone, email, answers }`.

6. **The backend re-fetches the active config itself** (it never trusts anything the
   browser might have cached), then:
   - `validateAnswers()` checks every active question's `required`/`min`/`max`/valid
     option constraints against the submitted answers.
   - `calculateEstimate()` runs the actual formula (see below) using the *unstripped*
     config it just fetched from the database.
   - The result is saved as a new `Lead` document, tagged with the `config_version`
     that produced it.
   - The response returns only `{ estimate_low, estimate_high, currency }` — never
     the rates that produced them.

7. **`ResultDisplay` shows the range** with an animated count-up, plus a "call us" link
   and a "start over" button.

8. **The owner logs in at `/admin/login`.**
   `AdminLogin` calls `ownerLogin()` → `POST /api/auth/login`, which checks the
   submitted username/password against `ADMIN_USERNAME`/`ADMIN_PASSWORD` env vars and,
   on success, signs a JWT (`jsonwebtoken`, expiring per `JWT_EXPIRES_IN`). The token
   is stored in `localStorage` and attached as `Authorization: Bearer <token>` on every
   subsequent `/api/admin/*` request (see the Axios interceptor in `services/api.js`).

9. **`useAuth()` verifies the session on every page load** by calling
   `GET /api/auth/verify`, so a stale/expired token gets cleared automatically instead
   of silently failing later.

10. **In the Owner Panel's "Pricing & questions" tab (`ConfigEditor`):**
    the owner edits business info, global modifiers (waste factor, permit fee, spread
    %), and per-question labels/min/max/active-state/option rates. On save,
    `saveAdminConfig()` calls `PUT /api/admin/config`, which — instead of overwriting
    the live document — deactivates it and inserts a fresh one with
    `config_version + 1`. The change is live for the *next* public visitor immediately,
    with no redeploy.

11. **In the "Leads" tab (`LeadsTable`):**
    `fetchLeads()` calls `GET /api/admin/leads`, returning every submission newest-first.
    Clicking a row expands it to show the exact answers that customer gave and which
    `config_version` priced them.

---

## 6. The pricing formula (plain language)

Given a customer's answers (roof area, material, pitch, story count, tear-off layers)
and the business's fixed modifiers (waste factor, permit fee, spread %):

1. **Base material cost** = roof area × the chosen material's rate per sq ft, marked up
   by the waste factor (materials are always over-ordered a bit — default 10%).
2. **Tear-off cost** = roof area × the chosen layer option's tear-off rate (removing
   old roofing costs more per existing layer).
3. **Adjusted subtotal** = (base material cost + tear-off cost) × pitch multiplier ×
   stories multiplier (steeper roofs and taller buildings cost more to work safely on).
4. **Total base estimate** = adjusted subtotal + a flat permit fee.
5. **Final range** = base estimate ± a spread percentage (default 12%), since no number
   given before an on-site visit is ever a single exact figure.

This lives in exactly one file: `server/src/services/calculator.js`. See
`DECISIONS.md` for the full mathematical notation and reasoning.

---

## 7. Running locally

### Prerequisites
- Node.js v18+ and npm
- A MongoDB connection string (MongoDB Atlas free tier, or a local MongoDB instance)

### Steps (from a clean clone)

```bash
# 1. Install dependencies for the root, server, and client
npm run install:all

# 2. Configure the backend
cp server/.env.example server/.env
# → fill in DATABASE_URL, and set your own JWT_SECRET / ADMIN_PASSWORD

# 3. Configure the frontend
cp client/.env.example client/.env
# → VITE_API_BASE_URL defaults to http://localhost:5000/api, matching the local server

# 4. Seed the database (creates the active Config + two demo leads)
npm run seed

# 5. Run both apps together
npm run dev
```

- Frontend: **http://localhost:5173**
- Backend: **http://localhost:5000** (health check at `/api/health`)
- Owner Panel: **http://localhost:5173/admin/login**

Run them separately with `npm run dev:server` and `npm run dev:client` if preferred.

---

## 8. Environment variables

### `server/.env`

| Variable | Description |
|---|---|
| `DATABASE_URL` | MongoDB connection string |
| `PORT` | Port the API listens on (default `5000`) |
| `JWT_SECRET` | Long random string used to sign owner session tokens |
| `JWT_EXPIRES_IN` | Owner session lifetime, e.g. `12h` |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Owner Panel login credentials |
| `CLIENT_ORIGIN` | Comma-separated list of allowed CORS origins — **must exactly match the deployed frontend URL, no trailing slash** |

### `client/.env`

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API, **including `/api`** — e.g. `http://localhost:5000/api` locally, or `https://your-api.onrender.com/api` in production |

> **Two mistakes worth flagging from getting this deployed:** (1) `CLIENT_ORIGIN` on
> the backend must match the frontend's `Origin` header exactly — a trailing slash
> will silently break CORS with a 403. (2) `VITE_API_BASE_URL` must end in `/api` —
> Vite bakes this value in at *build* time, so changing it on Vercel requires a
> redeploy, not just a saved setting.

---

## 9. Admin test credentials

```
Username: admin
Password: roofing2026!
```
(Defined in `server/.env` on your own deployment — change before sharing publicly.)

---

## 10. Deployment (already live — for reference / redeploying)

### Database — MongoDB Atlas
Free M0 cluster, a database user, network access opened to `0.0.0.0/0` (or Render's IP
range), connection string set as `DATABASE_URL`.

### Backend — Render
Web Service → root directory `server/` → build `npm install` → start `npm start` →
env vars from `server/.env.example` with real values. Seed once via Render's Shell tab:
`npm run seed`.

### Frontend — Vercel
Project → root directory `client/` → framework preset Vite → build `npm run build` →
output `dist` → env var `VITE_API_BASE_URL` = Render URL + `/api`.

After both are live, `CLIENT_ORIGIN` on Render must be updated to the final Vercel URL
(no trailing slash), which triggers an automatic redeploy.

---

## 11. Verification checklist (from the assignment brief)

- [x] **Frontend Check** — no component hardcodes a rate, multiplier, or question
  string. `GET /api/config` strips every pricing field before the public estimator
  ever sees it. `ConfigEditor.jsx` (Owner Panel only) references pricing field *names*
  so it can render the right input type — every number shown there is fetched live
  from `GET /api/admin/config`, never hardcoded.
- [x] **Owner Panel Check** — changing a rate in the Owner Panel takes effect
  immediately for the next public estimator load, with no redeploy (verified live).
- [x] **Auth Check** — `/api/admin/*` returns `401` without a valid Bearer token; the
  `/admin` frontend route redirects to `/admin/login` when unauthenticated.
- [x] **Repo Hygiene Check** — incremental commits by concern (server models → pricing
  engine → API → seed → client scaffold → theming → wizard → owner panel → docs).
- [x] **Mandatory Files Check** — `DECISIONS.md`, `AI_LOG.md`, `README.md` all present
  at the repo root.
- [x] **Live deployed URL** — both frontend and backend are deployed and linked above.