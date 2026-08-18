# DECISIONS.md

Architectural decision record for the Northline Roofing Config-Driven Estimator & Owner Panel.

## 1. Stack choice

| Layer | Choice | Why |
|---|---|---|
| Frontend | React (Vite) + Tailwind CSS | Vite gives fast local dev/HMR and a simple static build for Vercel/Netlify. Tailwind lets a fully dynamic, config-driven UI stay visually consistent without hand-rolled CSS per component. |
| Backend | Node.js + Express | Matches the brief's reference code directly (the provided `calculator.js` and `auth.js` snippets are Express-shaped), minimal boilerplate, easy to reason about as a small REST API. |
| Database | MongoDB + Mongoose | The brief's own schema examples (`Config.js`) are Mongoose schemas. A document database is also a natural fit for `Config`, which is a single nested document (questions → options) that's read as one blob far more often than it's queried piecemeal — there's no real relational structure to normalize here. |
| Auth | JWT (Bearer token) | Simpler to reason about across two separately-deployed origins (Vercel frontend, Render backend) than cookie-based sessions, which run into cross-site cookie configuration (`SameSite`, `Secure`, exact domain matching) that adds risk for a small assignment. The token is generated on login and sent as `Authorization: Bearer <token>` on every `/api/admin/*` call. |
| Deployment | Vercel (client) + Render (server) + MongoDB Atlas (DB) | Free tiers of all three, and it's the exact combination the brief recommends. |

I used plain JavaScript (not TypeScript) for both client and server to keep the assignment's turnaround fast without sacrificing structure — the codebase is small enough that JSDoc-style comments and consistent shapes cover most of what types would buy here.

## 2. The pricing formula, in plain language

A roofing estimate has five inputs from the customer (roof area, material, pitch, story count, tear-off layers) and three fixed business rules (waste factor, permit fee, spread percentage). The math:

1. **Base material cost** — roof area × the selected material's rate per square foot, inflated by the waste factor (materials are always over-ordered a bit to cover cuts and mistakes — default 10%).
2. **Tear-off cost** — roof area × the selected layer option's tear-off rate (removing old roofing costs more per layer).
3. **Adjusted subtotal** — (base material cost + tear-off cost), scaled up by the pitch multiplier (steeper roofs are slower and riskier to work on) and the stories multiplier (taller buildings need more scaffolding/safety gear).
4. **Total base estimate** — adjusted subtotal + a flat permit fee.
5. **Final range** — the base estimate minus/plus a spread percentage (default 12%), because no estimate given before an on-site visit is a single exact number.

This entire calculation happens in `server/src/services/calculator.js` and **only** there. The frontend never receives `rate_per_sqft`, `multiplier`, or `tear_off_per_sqft` values — `GET /api/config` strips them out before the response leaves the server (see `configController.js`) — so there is no way to reconstruct or tamper with the formula from the browser.

## 3. Out of scope (and why)

- **Complex role permissions.** The brief describes two people (Dale, the owner; Marcus, the bookkeeper) sharing responsibility for the Owner Panel, but doesn't ask for different permission levels between them. I implemented a single shared admin login (`ADMIN_USERNAME` / `ADMIN_PASSWORD` in `.env`) rather than a users table with roles — it satisfies "Owner Panel must require authentication" without inventing a permissions model nobody asked for.
- **Multi-tenancy.** This is a single-business tool for Northline. There's one active `Config` document at a time; nothing in the schema partitions data by business/tenant.
- **Payment processing / scheduling.** The brief's flow ends at "capture the lead and show a range" — no booking calendar, deposit collection, or CRM pipeline was requested.
- **Per-user leads editing/soft-delete.** The Owner Panel can view leads but there's no delete/edit/export UI, since the brief only asks for a "responsive data table displaying... and expanding details."
- **Fine-grained question type validation UI in the editor** (e.g. drag-to-reorder, add/remove entire questions). The editor supports editing existing questions/options, toggling active state, and editing rates/labels/min/max — which covers "update rates, toggle questions on/off, edit labels" as literally specified. Adding or deleting whole questions would need schema-shape validation beyond the assignment's scope and risks letting a non-technical user break the calculation engine (e.g. deleting the `material` question entirely).

## 4. Seed data note

The brief references "the seed configuration (Version 3) provided in the brief," but no literal JSON payload was included in the assignment document I received — only the *shape* of a config (via the Mongoose schema and the calculator's expected fields: `material`, `pitch`, `stories`, `layers`). I authored a reasonable seed dataset for a roofing company from scratch (`server/src/config/seed.js`), starting the version counter at `3` as the brief implies, and deliberately reused the exact values the brief's own verification checklist calls out (`"asphalt_3tab"` as a material `value`, `4.25` as its `rate_per_sqft`) so the checklist's "Frontend Check" step behaves as intended: search the client codebase for those strings and confirm they don't appear anywhere outside of comments/docs.

**Numeric string normalization:** the brief calls out that seed data may contain multiplier values as strings (e.g. `multiplier: "1.12"`). I seeded `1.12` as a real number for cleanliness, but `calculator.js` defensively wraps every rate/multiplier read in `Number(...)` regardless, so the pricing engine tolerates either a numeric or string value in the database without crashing or silently miscalculating.

**Legacy version / lead structure:** because `PUT /api/admin/config` never mutates the active config in place — it deactivates the current document and inserts a new one with `config_version + 1` (see `adminController.updateConfig`) — every `Lead` keeps a `config_version` that always points to the exact pricing rules that produced its stored estimate, even after the owner changes prices later. Old leads are never silently recalculated against new rates.

## 5. Questions I'd ask Dale before a production launch

1. Should material/pitch/stories options be addable or removable by the owner, or should the question set stay fixed and only rates/copy change?
2. Do Dale and Marcus need separate logins (e.g. to see who last changed a price), or is a shared login acceptable long-term?
3. What should happen to a lead if a customer's answers fall outside every question's active options (e.g. an "other" material) — turn them away, or capture a note for manual follow-up?
4. Is a 12% spread the right default for every job size, or should the spread widen for very large/small roofs where uncertainty is higher?
5. Should leads ever be exported (CSV/email) for Marcus's bookkeeping workflow, or is the in-app table sufficient?
6. Any compliance requirement around storing customer PII (name/phone/email) — a retention window, a way to delete a lead on request?
