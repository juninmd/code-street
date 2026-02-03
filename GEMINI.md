# GEMINI.md

## Learnings

- The project uses `sqlite3` directly. A future improvement could be using an ORM like Prisma or Sequelize for better type safety and migration management, though for now the raw SQL approach is simple and effective.
- The `api/stats` endpoint was identified as a performance bottleneck due to sequential queries.
- Tailwind v4 is used, which has a different configuration approach (CSS-first) compared to v3.

## Active Plan
- Optimizing backend performance.
- Establishing test infrastructure.
