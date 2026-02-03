# AGENTS.md

This file serves as a context and instruction guide for AI agents working on this repository.

## Project Context
CodeBounty is a crowdfunded feature marketplace. The goal is to allow users to propose and pledge money for features, which developers can then build.

## Technology Strictures
- **Frontend:** React, Vite, Tailwind CSS. Use functional components and hooks.
- **Backend:** Node.js, Express, SQLite. Ensure SQL injection protection.
- **Package Manager:** `pnpm` is the designated package manager.
- **Formatting:** Ensure code is clean and readable.

## Future Roadmap

1. **Authentication System:** Implement user authentication (Auth0 or custom JWT) to allow users to track their pledges and developers to claim bounties securely.
2. **Payment Integration:** Integrate Stripe or similar to handle actual payments instead of simulated pledges.
3. **Real-time Updates:** Implement WebSockets (Socket.io) to push updates (new pledges, comments) to clients in real-time.

## Protocol
- Always run tests before submitting.
- Update this file if you learn something new about the codebase.
