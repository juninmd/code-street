# AGENTS.md

This file serves as a context and instruction guide for AI agents working on this repository.

## Project Context
**CodeStreet: The AI Asset Exchange.**

This is a high-fidelity financial simulation and micro-SaaS marketplace.
- **The Core Product:** A stock market for "AI Agents". Users invest (pledge) to fund the development of autonomous agents.
- **The "Rich" Factor:** The platform owner (The Admin) collects a 5% "Underwriting Fee" on all IPOs and trades. The "Executive Dashboard" tracks these dividends.
- **The Surprise:** A real-time Ticker Tape, "Insider Analytics", and a gamified investment portfolio.

## Technology Strictures
- **Frontend:** React 19, Vite, Tailwind CSS (v4). Use functional components and hooks.
- **Backend:** Node.js, Express, SQLite.
- **Mobile First:** The application must function as an installable PWA on Android/iOS.
- **Formatting:** Ensure code is clean and readable.

## Key Components
- **LiveTicker.jsx:** Real-time scrolling market data.
- **SniperMode.jsx:** AI-driven undervalued asset highlighting.
- **AdminWealth.jsx:** The "Hedge Fund" view for tracking AUM (Assets Under Management).
- **FeatureDetail.jsx:** The "IPO" page where users buy shares.

## Protocol
- Always run tests before submitting.
- Update this file if you learn something new about the codebase.
