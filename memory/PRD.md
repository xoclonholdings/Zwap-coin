# ZWAP! Coin App - Product Requirements Document

## Original Problem Statement
Build a cryptocurrency rewards app for ZWAP! Coin with:
- Tab for pedometer (MOVE) - "Move & Earn"
- Tab for games (PLAY) - "Play & Earn"
- Tab for marketplace (SHOP) - "Shop with ZWAP!"
- Tab for crypto exchange (SWAP) - "Swap your ZWAP!"

**Tagline: "MOVE. PLAY. SWAP. SHOP."**

---

## Compliance Architecture (Apple/Google)

### Current State ✅
- Users earn ZWAP tokens in-app via games and step tracking
- All balances stored in backend database (MongoDB)
- "Claiming" updates DB only - no on-chain transactions
- Wallets linked for read-only display only
- Swaps occur via embedded external services (iframe)

### Compliance Rules
1. App observes, displays, and tracks rewards only
2. App NEVER moves crypto internally
3. All on-chain actions are user-initiated externally
4. Copy does not imply financial ownership inside app
5. Swaps/conversions happen via third-party services
6. Wallet display is read-only
7. No transaction signing occurs in-app

### Platform-Safe Language
- ❌ Avoid: "portfolio", "your funds", "instant exchange", "profit", "real trading"
- ✅ Use: "earned rewards", "claim to wallet", "linked wallet", "external swap"

---

## Architecture

### Backend (FastAPI + MongoDB + Web3.py)
- `server.py` - All API endpoints
- Polygon RPC integration via Alchemy (read-only)
- No transaction signing/sending from backend

### Frontend (React + Tailwind + Framer Motion)
- Splash → Dashboard flow
- Persistent header with wallet connection
- SWAP tab with embedded external services (iframe)
- Compliant copy throughout

### ZWAP Contract (Polygon)
```
Address: 0xe8898453af13b9496a6e8ada92c6efdaf4967a81
Network: Polygon PoS (Chain ID: 137)
Symbol: ZWAP
Decimals: 18
Total Supply: 30,000,000,000
```

---

## What's Been Implemented

### Core Features
- [x] Wallet connection (WalletConnect - read-only)
- [x] Dashboard with feature grid
- [x] MOVE tab - Step tracking with rewards
- [x] PLAY tab - Games (zBrickles, zTrivia)
- [x] SHOP tab - Marketplace with carousel
- [x] SWAP tab - **Embedded external swap services**
- [x] PWA Support

### Token System
- [x] ZWAP! Coin - Main reward token (in-app tracking)
- [x] Z Points - Game-only loyalty currency
- [x] Daily earning caps enforced

### Compliance Updates (Jan 2025)
- [x] SwapTab rewritten - Uses embedded iframe for external services
- [x] Language updated - "Reward Balances", "Linked Wallet", "In-App Rewards"
- [x] "Record Rewards" replaces "Claim" for in-app actions
- [x] Read-only notices added to balance displays
- [x] Terms of Use updated with compliant language
- [x] Compliance constants file created

### UI/UX
- [x] Animated splash screen
- [x] Glowing icons on all tabs
- [x] Profile badge with settings indicator
- [x] Scrollable sidebar
- [x] AboutPage scrolling fixed

---

## Feature Details

### SWAP Tab (Compliant Design)
```
User Flow:
1. User opens SWAP tab
2. Sees reward balances (read-only display)
3. Sees live prices (information only)
4. Chooses external service (Jumper, 1inch, QuickSwap)
5. Service opens in embedded iframe
6. User connects wallet IN the external service
7. User completes swap via third-party
8. User closes embedded window, returns to app
```

**Compliance:**
- App does NOT process transactions
- External service handles all wallet connections
- Clear labeling: "External Service • Swaps processed externally"
- No signing occurs in ZWAP! app code

### Future: Claim to Wallet
```
Planned Flow:
1. User taps "Claim to Wallet"
2. App shows claim amount and destination
3. User confirms in their wallet app (external)
4. Treasury wallet sends tokens on-chain
5. Transaction confirmed, balances updated
```

**Key:** User must sign externally. App never initiates transactions.

---

## Prioritized Backlog

### P0 (Ready for Store Submission)
- [x] Compliant SWAP tab (embedded external services)
- [x] Compliant language throughout app
- [x] Read-only wallet display
- [ ] Final compliance review
- [ ] App Store metadata preparation

### P1 (Post-Launch)
- [ ] Claim to Wallet feature (external signing)
- [ ] Stripe webhook for subscriptions
- [ ] Ad integration (rewarded video)
- [ ] Native app builds (Capacitor)

### P2 (Future)
- [ ] Real token distribution from treasury
- [ ] Additional games
- [ ] Higher subscription tiers

---

## Ownership Structure

**ZWAP!™️** is a Web3 asset:
- Owned by: **Zupreme Imports LLC**
- Operated by: **Gratia Dei Unlimited**
- Held by: **XOCLON Holdings Inc**

---

## Key Files

### Compliance
- `/app/frontend/src/constants/compliance.js` - Platform-safe language constants

### Components
- `/app/frontend/src/components/SwapTab.jsx` - Embedded external swap
- `/app/frontend/src/components/AppHeader.jsx` - Compliant balance display, sidebar with Learn link
- `/app/frontend/src/components/MoveTab.jsx` - "Record Rewards" language
- `/app/frontend/src/components/TermsPage.jsx` - Updated legal terms
- `/app/frontend/src/components/WalletPage.jsx` - Wallet onboarding with education content
- `/app/frontend/src/components/LearnPage.jsx` - 6-module education section (accordion)
- `/app/frontend/src/components/AboutPage.jsx` - Updated CTA with wallet-conditional routing
- `/app/frontend/src/data/education.js` - Education knowledge spine (6 modules, trivia, ticker facts)

### Backend
- `/app/backend/server.py` - All API endpoints (no tx signing)
- `/app/backend/admin_routes.py` - Admin panel endpoints (users, treasury, games, marketplace, swap, account settings)

### Admin Panel
- `/app/frontend/src/components/AdminPanel.jsx` - Full admin panel frontend
- Access: `/admin` route, triggered by triple-tapping shield icon on About page
- Login: Admin API key (default from env: `ADMIN_API_KEY`)
- Sections: Dashboard, Users, Treasury, Games, Marketplace, Swap Config, Settings, Account
- Account Settings (Completed Dec 2025):
  - Change admin key (stored as SHA-256 hash in `admin_settings` collection)
  - Update admin email and notification preferences  
  - Dual authentication: env var key OR database-stored hash key
  - Last login and key change timestamps tracked

---

## Admin Panel DB Collections
- `admin_settings` - Admin credentials and preferences (`_id: "admin"`)
- `admin_logs` - Audit trail of all admin actions
- `system_config` - System-wide settings (maintenance mode, claim limits)
- `game_configs` - Per-game configuration
- `swap_configs` - Per-token swap settings
- `rewards_ledger` - Immutable rewards audit trail

---

## Completed Work (Dec 2025)
- [x] Admin Account Settings - Change key, email, notifications
- [x] Dual admin auth (env var + DB hash)
- [x] Full admin panel with 8 sections
- [x] Codebase imported from GitHub repo
- [x] Frontend Routing & Education Layer:
  - Wallet-gated navigation (dashboard/move/play/shop/swap require wallet)
  - WalletPage (/wallet) with crypto wallet education, privacy assurance, Learn hint
  - LearnPage (/learn) with 6 accordion modules from education spine
  - Learn accessible from User Badge sidebar (between Profile and Contact)
  - AboutPage CTA: "Ready to Bridge Into the Future?" with conditional routing
  - NewsTicker pulls "Did You Know?" facts from education spine
  - Splash screen conditional routing (wallet → dashboard, no wallet → /wallet)
  - Education spine powers: Learn section, Trivia, Ticker, Wallet page content
- [x] Backend modular structure imported (routers/, services/) for future use

## Prioritized Remaining Tasks

### P0 (Critical)
- [ ] Real on-chain ZWAP token claims (treasury → user wallet)
- [ ] Final compliance review

### P1 (High)
- [ ] Stripe webhook automation for subscription upgrades
- [ ] Anti-cheat system (GPS spoofing/bot detection)
- [ ] Ad integration (web-compatible, not Unity Ads)

### P2 (Medium)  
- [ ] Progressive game difficulty
- [ ] New games: zTetris, zSlots
- [ ] Reward caps enforcement per tier
- [ ] Add USDT to SWAP tab
- [ ] Higher tiers (Sustainer)

### P3 (Backlog)
- [ ] Native app builds (Capacitor)
- [ ] App Store metadata
