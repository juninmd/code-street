# CodeStreet: The Feature Futures Exchange (SaaS)

CodeStreet is the world's first **Crowdfunded Roadmap Platform**.

It turns feature requests into financial assets. Users "pledge" money to features they want, and developers "short" the time to build them. This is a B2B SaaS platform designed for product teams to monetize their backlog.

## Key Features

- **Feature Futures Market:** Buy shares in features. Real money, real prioritization.
- **Sniper Mode:** AI-driven market analysis to find undervalued features (High Demand / Low Funding).
- **Executive Dashboard:** A SaaS-style revenue dashboard for the platform admin to track the 5% rake and projected ARR.
- **PWA Ready:** Installable on Android and iOS for a native app experience.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4
- **Backend:** Node.js, Express, SQLite3
- **Package Manager:** pnpm

## Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Running the App

To run both the frontend and backend concurrently:

**Backend:**
```bash
pnpm server
```

**Frontend:**
```bash
pnpm dev
```

The backend runs on port 3000, and the frontend proxies API requests to it.

## API Endpoints

- `GET /api/features`: List features.
- `GET /api/pledges/recent`: Live market activity feed.
- `GET /api/stats`: Platform revenue statistics.
