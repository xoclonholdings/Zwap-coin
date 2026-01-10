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

## Prioritized Backlog

### P0 (Critical)
- All core features implemented ✅

### P1 (High Priority)
- [ ] Real wallet integration (actual MetaMask signing)
- [ ] Blockchain transaction recording
- [ ] User authentication persistence

### P2 (Medium Priority)
- [ ] Leaderboards for steps and games
- [ ] Daily/weekly challenges
- [ ] Push notifications
- [ ] Social sharing

### P3 (Nice to Have)
- [ ] NFT rewards for achievements
- [ ] Referral system
- [ ] Multi-language support
- [ ] Dark/light theme toggle

## Next Tasks
1. Implement real MetaMask/WalletConnect integration
2. Add blockchain transaction history
3. Create leaderboard system
4. Add push notifications for daily bonuses
