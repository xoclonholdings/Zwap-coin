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
- `Dashboard.jsx` - Main dashboard with balance, features
- `TabNavigation.jsx` - Bottom navigation
- `MoveTab.jsx` - Step tracking with DeviceMotion API
- `PlayTab.jsx` - Games (zBrickles, zTrivia)
- `ShopTab.jsx` - Marketplace with carousel
- `SwapTab.jsx` - Token exchange

## Core Requirements (Static)
- Dark theme with neon cyan/purple accents
- Mobile-first responsive design
- Wallet-based authentication (WalletConnect)
- 100 ZWAP starting bonus for new users
- Tiered earning for steps and games
- Real crypto prices from CoinGecko
- 1% swap fee
- **Tagline: "MOVE. PLAY. SWAP. SHOP."**

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
- [x] **Mobile-first no-scroll layout**
- [x] **PWA Support** - manifest.json, service worker

## What's Been Implemented (2025-01-10)
- [x] **Z Points System** - Game-only loyalty currency (1000 zPts = 1 ZWAP)
- [x] **Tiered Subscriptions** - Starter (free) and Plus ($12.99/mo)
- [x] **Daily Z Points Caps** - 20/day Starter, 30/day Plus
- [x] **4 Games** - zBrickles, zTrivia (Starter), zTetris, zSlots (Plus only)
- [x] **Progressive Difficulty** - Games get harder, rewards scale
- [x] **Dual Payment Shop** - Pay with ZWAP! Coin or Z Points
- [x] **Stripe Integration** - Plus subscription checkout
- [x] **1.5x Rewards for Plus** - Multiplier for Plus tier users

## What's Been Implemented (2025-01-11)
- [x] **Animated Splash Screen** - "MOVE. PLAY. SWAP. SHOP." animated tagline that repositions under large logo (3-5x larger)
- [x] **Persistent AppHeader** - 2x larger elements: ZWAP_BANG logo (h-14), larger balances (text-base), larger profile badge (w-14 h-14)
- [x] **Connect Wallet in Header** - Always visible next to balances when not connected
- [x] **Profile Settings with Contact** - Added Contact option to settings menu (mailto:support@zwap.app)
- [x] **NewsTicker Footer** - Rotating ticker (8-second intervals) with glowing animations
- [x] **About Page Overhaul** - Larger bang logo (h-32), reduced spacing, no Get Started button, DUAL CURRENCY section before HOW IT WORKS
- [x] **Shop Page Carousel** - Zupreme Imports logo image, category toolbar, carousel product display with navigation
- [x] **ZWAP Coin Logo in SWAP** - Added actual ZWAP coin logo (ejxhkn40_IMG_0609.jpeg) to CRYPTO_LOGOS
- [x] **Animated UI** - All elements have framer-motion animations with glow/pulse effects (no static colors)

## Prioritized Backlog

### P0 (Critical)
- All core features implemented ✅
- UI/UX Overhaul completed ✅
- Animation pass completed ✅

### P1 (High Priority)
- [ ] Leaderboard logic (backend API + frontend display in ticker)
- [ ] Full Stripe subscription webhook processing
- [ ] Complete user profile page

### P2 (Medium Priority)
- [ ] Implement zTetris and zSlots games
- [ ] Monthly ZWAP and daily Z-Point reward caps enforcement
- [ ] Add USDT to SWAP tab

### P3 (Nice to Have)
- [ ] Higher tiers ($XHI token, Sustainer tier)
- [ ] NFT rewards for achievements
- [ ] Referral system
- [ ] Multi-language support

## Next Tasks
1. Build Leaderboard backend API and connect to NewsTicker display
2. Complete Stripe webhook processing for Plus subscription
3. Implement zTetris and zSlots games

## Key Assets
- ZWAP_LOGO: Full logo with text (for splash/welcome)
- ZWAP_BANG: 3D bang icon (for header)
- ZWAP_COIN: Actual coin image (for SWAP page)
- ZUPREME_LOGO: Zupreme Imports store logo

## Notes
- Leaderboard data in NewsTicker is currently **MOCKED**
- Stripe subscription flow is partially implemented (checkout works, webhook needs completion)
