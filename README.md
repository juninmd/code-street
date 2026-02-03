# CodeBounty

CodeBounty is a crowdfunded marketplace where users pledge money to feature requests (Bounties) and developers can claim them.

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

To run both the frontend and backend concurrently (ensure you have a way to run them, or run them in separate terminals):

**Backend:**
```bash
pnpm server
```

**Frontend:**
```bash
pnpm dev
```

The backend runs on port 3000, and the frontend proxies API requests to it.

## Scripts

- `pnpm dev`: Start frontend dev server.
- `pnpm server`: Start backend server.
- `pnpm build`: Build frontend.
- `pnpm test`: Run tests.

## API Endpoints

- `GET /api/features`: List features.
- `POST /api/features`: Create a feature.
- `GET /api/stats`: Get platform stats.
