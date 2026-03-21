# CodeStreet: The Feature Futures Exchange

## Concept
CodeStreet turns the boring process of Software Roadmaps into a high-stakes Financial Exchange.
Instead of "Upvoting" a feature, users "Invest" in it (Pledge Bounty).
- **Features are Stocks:** Each feature request has a "Price" determined by its Vote Count and Total Pledged Amount.
- **Users are Investors:** They build a Portfolio of features they want to see built.
- **You are the Exchange:** As the Admin/SaaS Owner, you take a **5% Transaction Fee** on every pledge.

## The Goal
To make software development exciting and profitable.
- **For Users:** Gamified validation. If they back a winning feature (one that gets built), they earn "Reputation Dividends" (future discount codes or status).
- **For You (Admin):** Direct revenue stream from the platform fees.

## Key Mechanics
1. **IPO (Initial Proposal Offering):** Users pay a listing fee (simulated or real) to post a feature.
2. **Trading:** Users pledge money to boost a feature's "Market Cap".
3. **Volatility:** Random market events (Bull Runs, Crashes) simulate a living economy to keep users engaged.
4. **Insider Trading:** The Admin Dashboard shows "Whale Alerts" and "Undervalued Assets" to help you spot trends.

## Technical Strategy (Android First)
- **PWA Core:** The app is built as a Progressive Web App (PWA) to be installable on Android.
- **Offline First:** Service Workers cache the Board and Portfolio for offline viewing.
- **Notifications:** "Market Moving" events trigger local notifications.

## Validation Strategy
To refine the business model and ensure the gamified stock market loop works before a full public launch, we use built-in simulation tools to test market dynamics and user behavior internally.

1. **Market Simulation Testing:**
   - **`POST /api/market/simulate`:** Generates organic-looking "pledges" (buy orders) and "votes" across random features. This tests the 5% standard Vig and 15% Dark Pool fee collection, ensuring the Admin Wealth Dashboard accurately tracks projected ARR.
   - **`POST /api/market/crash`:** Triggers a 20% drop in active feature market caps. This tests the Short Selling mechanics and ensures the platform correctly calculates negative price pressure, validating the risk/reward loop for "investors".

2. **Gamification Loops Validation:**
   - Test the "Daily Dividend" (1% equity claim) and "Mining" mechanics. These features create daily active user (DAU) retention loops.
   - Use the `UserProfile` component's "Mystery Crate" (Lootbox) mechanic to ensure users are incentivized to spend their virtual cash to win random feature shares, keeping the economy active.
   - Verify the `SniperMode` feature provides enough deterministic "Wall St." style analytics to justify the $99/mo CodeStreet PRO subscription.
