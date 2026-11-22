# AGENTS.md

CodeStreet: a stock-market simulation SaaS (React 19 SPA with an Express + SQLite backend). Users trade simulated assets, IPOs and options; payments go through Stripe, and AI features use Gemini. Product text is in Portuguese.

## Stack
- Frontend: React 19, Vite, Tailwind v4 (`@tailwindcss/vite`), React Router, Recharts, PWA (`vite-plugin-pwa`)
- Backend: Express, SQLite (`sqlite3`), Stripe, `@google/genai` (Gemini; needs `GEMINI_API_KEY`)
- Tests: Jest with jsdom and Testing Library (frontend and `server/tests/`), supertest, Playwright (visual checks)
- Package managers: `pnpm-lock.yaml` and `package-lock.json` are both committed. Do not hand-edit either

## Commands
- Dev frontend: `npm run dev` (Vite)
- Backend: `npm run server` (`node server/index.js`)
- Build and preview: `npm run build`, `npm run preview`
- Tests: `npm test` (Jest with `NODE_ENV=test`)
- Visual check before a PR: `python verify_visuals.py` (root). Keep the evidence in a dated `verification/` folder

## Structure
- `src/`: React app. `App.jsx` and `Layout.jsx` are the shell; `src/components/` holds the trading, IPO, options, dashboard and profile UI, each with a test file
- `server/`: `index.js` (Express routes), `db.js` (schema), `dbAccess.js`, `adminAuth.js`, `gemini.js`, `tests/`
- `public/`: manifest and static assets
- Root docs: `ROADMAP.md`, `STRATEGY.md`, `MONETIZATION.md`, `DECISION.md`, `CONTRIBUTING.md`

## Conventions
- **Money is integer cents or high-precision decimals on the backend. Never floats for balances.** IPO pricing, the 5% fee and settlement follow this rule
- **Atomicity:** buy and sell operations run inside atomic SQLite transactions to avoid races in volatile market states
- **Underwriting fee:** the 5% fee applies to every transaction, with no exceptions
- **Schema changes:** ship with migration or seed scripts. Today the schema lives in `server/db.js`
- **API:** semantic, versioned REST endpoints that return useful metadata (pagination info, timestamps). Validate every input (the older note suggests Zod or Joi; neither is a dependency today)
- **Frontend:** use React 19 features to reduce client payload. Follow the Tailwind v4 design tokens. Components stay modular and accessible
- **PWA:** the service worker cache prioritizes the ticker tape and user balances, so basic offline use works
- **Audit:** after high-load simulations, check the audit logs and confirm no balance diverged
- **Workflow:** Inquiry -> Strategy -> Act -> Validate. Validate means the security and correctness check and the visual check above

## Gotchas
- `GEMINI.md` at the root holds agent memory (learnings and an active plan). Gemini tooling reads it automatically, so change it only on purpose
- `verify_visuals.py` writes `verification_*.png` to the repo root. These are ignored by `.gitignore`; do not commit them

<!-- base-actions-main-policy -->
## GitHub Actions — padrão obrigatório (@main)

- Referencie as actions internas sempre pelo branch, nunca por SHA:
  - `uses: juninmd/base-actions/<action>@main`
  - `uses: juninmd/base-actions/.github/workflows/<arquivo>.yml@main`
- Não fixe `@<sha>` em `juninmd/base-actions`: a atualização é centralizada no
  `main` e passa a valer no próximo run.
- PRs cujos checks não iniciam por billing/spending limit são mesclados pelo bot central
  `juninmd/base-actions/.github/workflows/auto-merge-billing-blocked.yml`.
  Para impedir o merge automático de um PR, aplique a label `do-not-merge`.