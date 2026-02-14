# AGENTS.md

This file serves as a context and instruction guide for AI agents working on this repository.

## Project Context
**CodeStreet: The Crowdfunded Roadmap Platform (SaaS).**

This is a serious B2B product management tool.
- **The Core Product:** A platform where users vote with their wallets. Companies use this to prioritize features based on actual revenue potential.
- **The "Rich" Factor:** The platform owner (The Admin) collects a 5% fee on all pledges. The "Executive Dashboard" visualizes this wealth accumulation and ARR (Annual Recurring Revenue).
- **The Surprise:** "Sniper Mode" highlights undervalued features, encouraging users to pledge where their money has the most leverage.

## Technology Strictures
- **Frontend:** React 19, Vite, Tailwind CSS (v4). Use functional components and hooks.
- **Backend:** Node.js, Express, SQLite.
- **Mobile First:** The application must function as an installable PWA on Android/iOS.
- **Formatting:** Ensure code is clean and readable.

## Key Components
- **SniperMode.jsx:** AI-driven feature highlighting.
- **PaymentModal.jsx:** Simulated payment gateway (Stripe-style).
- **AdminWealth.jsx:** The "C-Suite" view for tracking SaaS metrics.
- **FeatureDetail.jsx:** The "IPO" page where users buy shares.

## Protocol
- Always run tests before submitting.
- Update this file if you learn something new about the codebase.
