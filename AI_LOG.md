# AI_LOG.md

Log of AI-assisted development for this assignment.

## Tools used

- **Claude (Anthropic)** — used for the full initial scaffold: backend models/controllers/routes, the pricing engine, the React frontend (estimator wizard, Owner Panel, design system), and this documentation set (`README.md`, `DECISIONS.md`, this file).

> **Note to whoever is submitting this assignment:** this file currently documents the AI-assisted scaffolding session. Before submitting, you should run the project yourself, review the code, make your own edits, and update the "Authored / modified directly" section below to reflect what you personally changed, tested, or added — that's the part the brief actually wants to see from you.

## Example: an AI output that was wrong, and how it was corrected

**Issue — auth strategy mismatch with deployment topology.** The brief's own example middleware (`server/src/middleware/auth.js` in the assignment doc) shows HTTP Basic Auth checked against `req.headers.authorization` on every request. The first draft carried this pattern forward literally as the Owner Panel's *only* auth mechanism. That breaks down for this project's actual deployment shape: the frontend (Vercel) and backend (Render) live on different origins, and neither a browser-native Basic Auth prompt nor a `Set-Cookie` session survives that split cleanly without extra cross-origin cookie configuration (`SameSite=None; Secure`, exact-domain matching, etc.) that's easy to get subtly wrong.

**Correction.** Kept the *shape* of the brief's middleware (a `requireOwnerAuth` function guarding `/api/admin/*`) but swapped the credential-checking mechanism: `POST /api/auth/login` verifies the `ADMIN_USERNAME` / `ADMIN_PASSWORD` env vars once and issues a signed JWT; the Owner Panel frontend stores that token and sends it as `Authorization: Bearer <token>` on every subsequent admin call, verified in `middleware/auth.js` with `jsonwebtoken`. This keeps the same "no valid credentials → 401" contract the brief describes, while working reliably across two separate deployed origins.

**Issue — tooling slip, not a logic bug.** While scaffolding the monorepo's folders, an early shell command used brace-expansion syntax (`mkdir -p "src/{config,controllers,...}"`) that got quoted incorrectly and created a single literal folder named `{config,controllers,...}` instead of expanding it. This was caught immediately by listing the directory tree before writing any files into it, and fixed by removing the bad folder and re-running `mkdir -p` with proper (unquoted) brace expansion.

## Authored / modified directly

*(fill this in with your own name attached to what you changed — see the note above)*

- [ ] Ran the project locally end-to-end and confirmed the checklist in the assignment brief passes
- [ ] Reviewed the pricing formula in `calculator.js` against `DECISIONS.md` and confirmed it matches the brief
- [ ] Customized business copy / colors / seed data as needed
- [ ] Wrote the actual `MONGODB_URI`, `JWT_SECRET`, and deployed URLs into the real `.env` files (never commit these)
- [ ] Any bug fixes, refactors, or additional features made after the initial scaffold
