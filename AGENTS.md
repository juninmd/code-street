# AGENTS.md

This file serves as a context and instruction guide for AI agents working on this repository.

## Project Context
**CodeStreet: The Crowdfunded Roadmap Platform (SaaS).**

This is a serious business tool disguised as a stock market.
- **The Core Product:** A platform where users vote with their wallets. Companies use this to prioritize features based on actual revenue potential, not just "upvotes".
- **The "Rich" Factor:** The platform owner (The Admin) collects a 5% fee on all pledges. The "Executive Dashboard" visualizes this wealth accumulation.
- **The Surprise:** The "Whale Alert" system creates FOMO (Fear Of Missing Out) by broadcasting large investments in real-time.

## Technology Strictures
- **Frontend:** React 19, Vite, Tailwind CSS (v4). Use functional components and hooks.
- **Backend:** Node.js, Express, SQLite.
- **Mobile First:** The application must function as an installable PWA on Android/iOS.
- **Formatting:** Ensure code is clean and readable.

## Key Components
- **WhaleAlert.jsx:** Global notification system for high-value pledges.
- **AdminWealth.jsx:** The "C-Suite" view for tracking platform revenue (SaaS metrics).
- **FeatureDetail.jsx:** The "IPO" page where users buy shares.

## Protocol
- Always run tests before submitting.
- Update this file if you learn something new about the codebase.
