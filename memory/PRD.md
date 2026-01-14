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
- `/app/frontend/src/components/AppHeader.jsx` - Compliant balance display
- `/app/frontend/src/components/MoveTab.jsx` - "Record Rewards" language
- `/app/frontend/src/components/TermsPage.jsx` - Updated legal terms

### Backend
- `/app/backend/server.py` - All API endpoints (no tx signing)
