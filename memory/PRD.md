# ZWAP! Coin App - Product Requirements Document

## Original Problem Statement
Build a cryptocurrency app for ZWAP! Coin with:
- Tab for pedometer (MOVE) - Track real steps as faucet with tiered earning
- Tab for games (PLAY) - Brickles-style tap game as faucet for earning ZWAP
- Tab for marketplace (SHOP) - "Zupreme Imports" with digital items
- Tab for crypto exchange (SWAP) - One tap swap for ZWAP to BTC, ETH, POL, SOL

User flow:
1. Welcome screen with 3 options: Swap, Earn, Shop
2. Wallet connection check before any action
3. Modal with 4 wallet options: MetaMask, Trust Wallet, Speed Wallet, Help

## Architecture

### Backend (FastAPI + MongoDB)
- `server.py` - Main API with endpoints for:
  - User management (wallet connection, balance)
  - Faucets (steps, game, scratch bonus)
  - Shop (items, purchases)
  - Swap (prices from CoinGecko, exchange execution)

### Frontend (React + Tailwind)
- `App.js` - Main app with context, routing, API functions
- `WelcomeScreen.jsx` - First-time user flow
- `WalletModal.jsx` - Wallet connection options
- `Dashboard.jsx` - Main dashboard with balance, features, scratch bonus
- `TabNavigation.jsx` - Bottom navigation
- `MoveTab.jsx` - Step tracking with DeviceMotion API
- `PlayTab.jsx` - Brickles game canvas
- `ShopTab.jsx` - Marketplace with items
- `SwapTab.jsx` - Token exchange

## User Personas
1. **Crypto Enthusiast** - Wants to earn and trade ZWAP
2. **Fitness User** - Motivated by move-to-earn mechanics
3. **Casual Gamer** - Plays zBricks for rewards
4. **Shopper** - Uses ZWAP for marketplace purchases

## Core Requirements (Static)
- Dark theme with neon cyan/purple accents
- Mobile-first responsive design
- Wallet-based authentication
- 100 ZWAP starting bonus for new users
- Tiered earning for steps and games
- Real crypto prices from CoinGecko
- 1% swap fee

## What's Been Implemented (2025-01-08)
- [x] Welcome screen with Swap/Earn/Shop actions
- [x] Wallet connection modal (MetaMask, Trust, Speed, Help)
- [x] Dashboard with balance, progress, features
- [x] MOVE tab - Real step tracking with DeviceMotion API
- [x] PLAY tab - Brickles game with paddle/ball physics
- [x] SHOP tab - Zupreme Imports marketplace
- [x] SWAP tab - Exchange with live prices
- [x] Scratch to Win bonus
- [x] Tiered faucet earning system
- [x] Bottom tab navigation
- [x] **Mobile-first no-scroll layout** - All screens fit without scrolling
- [x] **PWA Support** - manifest.json, service worker, app icons for store distribution

## What's Been Implemented (2025-01-10)
- [x] **Z Points System** - Game-only loyalty currency (1000 zPts = 1 ZWAP)
- [x] **Tiered Subscriptions** - Starter (free) and Plus ($12.99/mo)
- [x] **Daily Z Points Caps** - 20/day Starter, 30/day Plus
- [x] **4 Games** - zBrickles, zTrivia (Starter), zTetris, zSlots (Plus only)
- [x] **Progressive Difficulty** - Games get harder, rewards scale
- [x] **Dual Payment Shop** - Pay with ZWAP! Coin or Z Points
- [x] **Stripe Integration** - Plus subscription checkout
- [x] **ZWAP! Official Logos** - Added throughout app
- [x] **1.5x Rewards for Plus** - Multiplier for Plus tier users

## What's Been Implemented (2025-01-11)
- [x] **Animated Splash Screen** - Shows MOVE, PLAY, SWAP, SHOP animations on app launch
- [x] **Persistent AppHeader** - Fixed header with ZWAP_BANG logo, balances, and profile badge/Connect button
- [x] **Profile Settings Sheet** - Opens from profile badge with user info, tier status, upgrade option
- [x] **NewsTicker Footer** - Rotating ticker (8-second intervals) showing deals, leaderboard, tips, news
- [x] **About Page** - "What is ZWAP!?" informational page accessible from splash screen
- [x] **UI Fixes (2025-01-11)**:
  - Logo swap: ZWAP_LOGO on splash/welcome, ZWAP_BANG in header
  - NewsTicker thicker (py-3) and slower transitions (8 seconds)
  - Tagline "The Crypto Faucet That Moves With You" on splash and welcome
  - "WHAT IS ZWAP!?" button styled properly (border, rounded-full)
  - Header shows Connect button next to balances when not connected

## Prioritized Backlog

### P0 (Critical)
- All core features implemented ✅
- UI/UX Overhaul completed ✅

### P1 (High Priority)
- [ ] User Profile Settings page with privacy, terms, FAQs
- [ ] Leaderboard logic (backend API + frontend display in ticker)
- [ ] Full Stripe subscription webhook processing

### P2 (Medium Priority)
- [ ] Implement zTetris and zSlots games
- [ ] Monthly ZWAP and daily Z-Point reward caps enforcement
- [ ] Add USDT to SWAP tab
- [ ] Push notifications

### P3 (Nice to Have)
- [ ] Higher tiers ($XHI token, Sustainer tier)
- [ ] NFT rewards for achievements
- [ ] Referral system
- [ ] Multi-language support

## Next Tasks
1. Implement User Profile Settings (privacy, terms, FAQs)
2. Build Leaderboard backend API and display in NewsTicker
3. Complete Stripe webhook processing for Plus subscription
