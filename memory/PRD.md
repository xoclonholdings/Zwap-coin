# ZWAP! Coin App - Product Requirements Document

## Original Problem Statement
Build a cryptocurrency app for ZWAP! Coin with:
- Tab for pedometer (MOVE) - Track real steps as faucet with tiered earning
- Tab for games (PLAY) - Brickles-style tap game as faucet for earning ZWAP
- Tab for marketplace (SHOP) - "Zupreme Imports" with digital items
- Tab for crypto exchange (SWAP) - One tap swap for ZWAP to BTC, ETH, POL, SOL

**Tagline: "MOVE. PLAY. SWAP. SHOP."**

## Architecture

### Backend (FastAPI + MongoDB)
- `server.py` - Main API with endpoints for users, games, shop, swap, subscriptions

### Frontend (React + Tailwind + Framer Motion)
- `App.js` - Main app with context, routing, API functions
- `SplashScreen.jsx` - Animated splash with tagline
- `Dashboard.jsx` - Main dashboard with feature grid
- `AppHeader.jsx` - Persistent header with wallet/balances/profile
- `NewsTicker.jsx` - Animated footer ticker
- `FirstTimeUserPrompt.jsx` - Prompt for unconnected users
- `MoveTab.jsx`, `PlayTab.jsx`, `ShopTab.jsx`, `SwapTab.jsx` - Main tabs

## What's Been Implemented

### Phase 1 (2025-01-08)
- [x] Welcome screen with Swap/Earn/Shop actions
- [x] Wallet connection modal (MetaMask, Trust, Speed, Help)
- [x] Dashboard with balance, progress, features
- [x] MOVE tab - Real step tracking with DeviceMotion API
- [x] PLAY tab - Brickles game with paddle/ball physics
- [x] SHOP tab - Zupreme Imports marketplace
- [x] SWAP tab - Exchange with live prices
- [x] PWA Support - manifest.json, service worker

### Phase 2 (2025-01-10)
- [x] Z Points System - Game-only loyalty currency (1000 zPts = 1 ZWAP)
- [x] Tiered Subscriptions - Starter (free) and Plus ($12.99/mo)
- [x] 4 Games - zBrickles, zTrivia (Starter), zTetris, zSlots (Plus only)
- [x] Dual Payment Shop - Pay with ZWAP! Coin or Z Points
- [x] Stripe Integration - Plus subscription checkout

### Phase 3 (2025-01-11) - UI Overhaul
- [x] Animated Splash Screen - "MOVE. PLAY. SWAP. SHOP." tagline repositions under large logo
- [x] Welcome Screen Removed - Splash goes directly to Dashboard
- [x] First-Time User Prompt - Shows when unconnected users click interactive features
- [x] AppHeader Redesign:
  - Logo + "Connect Wallet" button on LEFT
  - Balances + 👤 emoji profile badge on RIGHT
  - All elements 2x larger with animated glows
- [x] Contact Option - Added to User Settings (mailto:support@zwap.app)
- [x] Shop Carousel - Zupreme Imports logo, category toolbar, carousel display
- [x] Correct Logos - ZUPREME_LOGO and ZWAP_COIN updated
- [x] Full Animation Pass - All elements have framer-motion glow/pulse effects

## Key Assets
- ZWAP_LOGO: Full logo with text (splash screen)
- ZWAP_BANG: 3D bang icon (header)
- ZWAP_COIN: Actual coin image (SWAP page prices)
- ZUPREME_LOGO: Zupreme Imports store logo

## Prioritized Backlog

### P1 (High Priority)
- [ ] Leaderboard backend API + NewsTicker display
- [ ] Complete Stripe webhook processing
- [ ] User profile page with settings

### P2 (Medium Priority)
- [ ] Implement zTetris and zSlots games
- [ ] Monthly ZWAP and daily Z-Point reward caps enforcement
- [ ] Add USDT to SWAP tab

### P3 (Nice to Have)
- [ ] Higher tiers ($XHI token, Sustainer tier)
- [ ] NFT rewards for achievements
- [ ] Referral system

## Next Tasks
1. Build Leaderboard backend API
2. Connect Leaderboard to NewsTicker display
3. Complete Stripe webhook processing

## Notes
- Leaderboard data in NewsTicker is **MOCKED**
- Stripe subscription checkout works, webhook processing needs completion
