# Northline Roofing — Config-Driven Estimator & Owner Panel

A full-stack, configuration-driven web app for a roofing company. Nothing about the
questions, options, or pricing rates is hardcoded in the frontend — the entire public
estimator is rendered from what the database returns, and the Owner Panel lets a
non-technical user (Dale/Marcus) change rates and question copy without a code
deploy.

**Live demo:** _add your deployed Vercel URL here after deploying_
**Live API:** _add your deployed Render URL here after deploying_

---

## 1. What's in this project

Two surfaces, one API, one database:

1. **Public Estimator** (`/`) — a mobile-responsive, multi-step wizard. On load it calls
   `GET /api/config` and renders whatever active questions come back. A customer enters
   their contact info, and `POST /api/estimate` calculates and returns a real cost range
   (computed **entirely server-side**).
2. **Owner Panel** (`/admin`) — a JWT-protected dashboard. Lets the owner edit rates,
   multipliers, question labels, and active/hidden state (`PUT /api/admin/config`), and
   view every captured lead with their submitted answers (`GET /api/admin/leads`).

---

## 2. Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), Tailwind CSS, Framer Motion, React Router, Axios |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (`jsonwebtoken`), Bearer token |
| Deployment target | Vercel (client) + Render (server) + MongoDB Atlas (database) |

See `DECISIONS.md` for the reasoning behind these choices, the pricing formula
explained in plain language, and what was intentionally left out of scope.

---

## 3. Folder structure

```
roof-estimator-monorepo/
├── client/                         # Frontend — React (Vite) + Tailwind
│   ├── public/
│   │   └── roof-favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── dynamic/
│   │   │   │   └── QuestionField.jsx      # Renders one question (number or select) — purely config-driven
│   │   │   ├── estimator/
│   │   │   │   ├── Hero.jsx               # Landing hero + animated roof-pitch signature graphic
│   │   │   │   ├── StepWizard.jsx         # Orchestrates the whole public flow
│   │   │   │   ├── ProgressBar.jsx
│   │   │   │   ├── ContactForm.jsx        # Final "your details" step
│   │   │   │   └── ResultDisplay.jsx      # Animated estimate range reveal
│   │   │   ├── owner/
│   │   │   │   ├── ConfigEditor.jsx       # Rates / multipliers / question toggles
│   │   │   │   └── LeadsTable.jsx         # Expandable leads table
│   │   │   └── ui/
│   │   │       ├── Navbar.jsx, Footer.jsx, Logo.jsx, ThemeToggle.jsx
│   │   ├── pages/
│   │   │   ├── EstimatorPage.jsx          # Public route "/"
│   │   │   ├── AdminLogin.jsx             # "/admin/login"
│   │   │   └── AdminDashboard.jsx         # "/admin" (protected)
│   │   ├── context/ThemeContext.jsx       # Light/dark mode, persisted to localStorage
│   │   ├── hooks/useAuth.js               # Owner session state (JWT in localStorage)
│   │   ├── services/api.js                # Every backend call lives here
│   │   ├── App.jsx                        # Routes + auth guard
│   │   ├── main.jsx
│   │   └── index.css                      # Tailwind layers + design tokens (buttons, cards, fields)
│   ├── index.html
│   ├── tailwind.config.js                 # Color palette, fonts, custom animations
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
│
├── server/                         # Backend — Express REST API
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                      # Mongoose connection
│   │   │   └── seed.js                    # Seeds an active Config (v3) + demo leads
│   │   ├── models/
│   │   │   ├── Config.js                  # Questions, options, business info, modifiers
│   │   │   └── Lead.js                    # Captured customer + answers + calculated estimate
│   │   ├── controllers/
│   │   │   ├── configController.js        # GET /api/config (public, rates stripped)
│   │   │   ├── estimateController.js      # POST /api/estimate (public)
│   │   │   ├── authController.js          # POST /api/auth/login, GET /api/auth/verify
│   │   │   └── adminController.js         # GET/PUT /api/admin/config, GET /api/admin/leads
│   │   ├── middleware/auth.js             # requireOwnerAuth — verifies the JWT
│   │   ├── services/calculator.js         # THE pricing formula + answer validation (server-only)
│   │   ├── routes/                        # One router file per resource
│   │   └── index.js                       # App wiring: CORS, rate limiting, route mounting, boot
│   ├── package.json
│   └── .env.example
│
├── DECISIONS.md                    # Architectural decisions + pricing formula explained
├── AI_LOG.md                       # AI tool usage log
├── README.md                       # You are here
└── package.json                    # Root orchestration scripts (npm run dev, etc.)
```

---

## 4. How it works, end to end

1. **Someone visits the site.** `EstimatorPage` calls `GET /api/config`. The server looks
   up the one `Config` document with `active: true`, strips out every pricing field
   (`rate_per_sqft`, `multiplier`, `tear_off_per_sqft`) and inactive question, and
   returns just `{ config_version, business, questions }`.
2. **`StepWizard` renders that response.** Each question becomes one step; `QuestionField`
   picks a number input or a set of selectable cards based on `question.type` — nothing
   in this component is hardcoded to a specific question key or label.
3. **The customer answers, then enters contact info,** and the wizard calls
   `POST /api/estimate` with `{ name, phone, email, answers }`.
4. **The server re-fetches the active config itself** (never trusts a config the
   browser might have cached), validates every answer against `min`/`max`/`required`/
   valid option values, and runs `calculateEstimate()` — the exact formula documented
   in `DECISIONS.md`. The browser only ever receives the final `{ estimate_low,
   estimate_high }`, never the rates that produced them.
5. **The lead is stored** with the `config_version` that produced it, so a later price
   change never rewrites history.
6. **The owner logs in** at `/admin/login` (`POST /api/auth/login`), gets a JWT, and
   is redirected to `/admin`. Every `/api/admin/*` call afterward sends that JWT as
   `Authorization: Bearer <token>`; `middleware/auth.js` rejects anything else with 401.
7. **In the Config tab,** the owner edits rates/multipliers/labels/active-toggles and
   saves. `PUT /api/admin/config` doesn't overwrite the current document — it deactivates
   it and inserts a new one with `config_version + 1`, so the change takes effect
   immediately for the next public visitor with zero redeploy, while old leads keep
   pointing at the config version that actually priced them.
8. **In the Leads tab,** the owner sees every submission, newest first, and can expand
   a row to see the exact answers a customer gave.

---

## 5. Running locally

### Prerequisites
- Node.js v18+ and npm
- A MongoDB connection string — either:
  - **MongoDB Atlas** (free tier, recommended, no local install): create a cluster at
    mongodb.com/atlas, create a database user, and copy the connection string, or
  - a local MongoDB instance (`mongodb://127.0.0.1:27017/roof-estimator`)

### Steps (from a clean clone)

```bash
# 1. Install dependencies for both server and client
npm run install:all

# 2. Configure the backend
cp server/.env.example server/.env
# → open server/.env and fill in DATABASE_URL (and change JWT_SECRET / ADMIN_PASSWORD
#   before deploying anywhere real)

# 3. Configure the frontend
cp client/.env.example client/.env
# → VITE_API_BASE_URL defaults to http://localhost:5000/api, which matches step 4

# 4. Seed the database (creates the active Config + two demo leads)
npm run seed

# 5. Run both apps together
npm run dev
```

- Frontend: **http://localhost:5173**
- Backend: **http://localhost:5000** (health check at `/api/health`)
- Owner Panel: **http://localhost:5173/admin/login**

If you'd rather run them in two separate terminals: `npm run dev:server` and
`npm run dev:client`.

---

## 6. Environment variables

### `server/.env`

| Variable | Description |
|---|---|
| `DATABASE_URL` | MongoDB connection string |
| `PORT` | Port the API listens on (default `5000`) |
| `JWT_SECRET` | Long random string used to sign owner session tokens — **change this before deploying** |
| `JWT_EXPIRES_IN` | Owner session lifetime, e.g. `12h` |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Owner Panel login credentials |
| `CLIENT_ORIGIN` | Comma-separated list of allowed CORS origins (your deployed frontend URL + `http://localhost:5173`) |

### `client/.env`

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API, e.g. `http://localhost:5000/api` locally or `https://your-api.onrender.com/api` in production |

---

## 7. Admin test credentials

```
Username: admin
Password: roofing2026!
```

(Defined in `server/.env` — change them before a real deployment.)

---

## 8. Deploying

### Database — MongoDB Atlas
1. Create a free cluster, a database user, and allow network access from anywhere
   (`0.0.0.0/0`) or from Render's IP range.
2. Copy the connection string for `DATABASE_URL`.

### Backend — Render
1. New **Web Service**, point it at this repo, root directory `server/`.
2. Build command: `npm install` — Start command: `npm start`.
3. Add the environment variables from `server/.env.example` in Render's dashboard
   (with real values), setting `CLIENT_ORIGIN` to your Vercel URL once you have it.
4. After the first deploy, run the seed script once — either via Render's shell
   (`npm run seed`) or by adding it as a one-off job.

### Frontend — Vercel
1. New Project, point it at this repo, root directory `client/`.
2. Framework preset: Vite. Build command: `npm run build`. Output dir: `dist`.
3. Add `VITE_API_BASE_URL` = your Render URL + `/api`.
4. Deploy, then go back to Render and update `CLIENT_ORIGIN` to the final Vercel URL.

---

## 9. Verification checklist (from the assignment brief)

- [x] **Frontend Check** — no component hardcodes a rate, multiplier, or question
  string; `GET /api/config` strips pricing fields before the *public* estimator ever
  sees them (see `configController.js`). `ConfigEditor.jsx` (Owner Panel only) references
  the field *names* `rate_per_sqft`/`multiplier`/`tear_off_per_sqft` so it can render an
  input for whichever pricing field a given option actually has — it never hardcodes a
  *value*; every number displayed there is fetched live from `GET /api/admin/config`.
- [ ] **Owner Panel Check** — after deploying, change a rate in the Owner Panel and
  confirm the public estimator reflects it immediately in an incognito window.
- [x] **Auth Check** — `/api/admin/*` returns `401` without a valid Bearer token;
  the `/admin` frontend route redirects to `/admin/login` when unauthenticated.
- [ ] **Repo Hygiene Check** — commit progressively as you customize this rather than
  in one bulk commit before submitting.
- [x] **Mandatory Files Check** — `DECISIONS.md`, `AI_LOG.md`, `README.md` are all
  present at the repo root.
