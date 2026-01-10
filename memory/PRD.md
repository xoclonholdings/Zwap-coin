# ZWAP! Coin App - Product Requirements Document

## Original Problem Statement
Build a cryptocurrency app for ZWAP! Coin with:
- Tab for pedometer (MOVE) - "Move & Earn"
- Tab for games (PLAY) - "Play & Earn"
- Tab for marketplace (SHOP) - "Shop with ZWAP!"
- Tab for crypto exchange (SWAP) - "Swap your ZWAP!"

**Tagline: "MOVE. PLAY. SWAP. SHOP."**

## Architecture

### Backend (FastAPI + MongoDB)
- `server.py` - All API endpoints

### Frontend (React + Tailwind + Framer Motion)
- Splash → Dashboard flow (no Welcome page)
- Persistent header with wallet connection
- Animated footer ticker with live leaderboard

## What's Been Implemented

### Core Features
- [x] Wallet connection (MetaMask, Trust, Speed)
- [x] Dashboard with feature grid
- [x] MOVE tab - Step tracking
- [x] PLAY tab - Games (zBrickles, zTrivia, zTetris, zSlots)
- [x] SHOP tab - Zupreme Imports marketplace with carousel
- [x] SWAP tab - Token exchange with live prices
- [x] PWA Support

### Token System
- [x] ZWAP! Coin - Main reward token
- [x] Z Points - Game-only loyalty currency (1000 zPts = 1 ZWAP)
- [x] Daily Z Points Caps: **75 Starter / 150 Plus**

### Subscriptions
- [x] Starter tier (free) - 2 games, 75 zPts/day
- [x] Plus tier ($12.99/mo) - 4 games, 150 zPts/day, 1.5x rewards
- [x] Stripe checkout integration

### User Profile
- [x] Editable username
- [x] Editable avatar (emoji selection)
- [x] Stats display (earned, steps, games, points)
- [x] Tier benefits display

### Leaderboard
- [x] Backend APIs for stats, rankings, user rank
- [x] Live data in NewsTicker

### Settings Pages
- [x] Profile page (editable)
- [x] Contact page
- [x] Privacy Policy
- [x] Terms of Use
- [x] FAQs (About page)

### UI/UX
- [x] Animated splash screen
- [x] Glowing icons on all tabs
- [x] First-time user prompt
- [x] "Get Started" button on About page

## Current Status: SIMULATED

⚠️ **Currently all transactions are simulated (MongoDB only)**:
- Swap function updates database, not blockchain
- Subscription money goes to Stripe test mode
- ZWAP! Coin is not connected to real blockchain

## To Make It Real

### 1. Smart Contract Integration
- Deploy ERC-20 token on Polygon
- Replace MongoDB balances with on-chain reads
- Sign real transactions with user wallets

### 2. Stripe Production
- Replace test keys with live keys
- Set up webhook for subscription activation
- Connect bank account for payouts

### 3. Ads Integration
- Google AdSense / AdMob
- "Watch ad for bonus" feature

## Prioritized Backlog

### P1 (Ready for Production)
- [ ] Deploy ZWAP! token contract (needs contract details)
- [ ] Switch to Stripe live mode (needs live keys)
- [ ] Add ads integration

### P2 (Feature Enhancements)
- [ ] Implement zTetris and zSlots games
- [ ] Real DEX swap integration
- [ ] Geolocation for local leaderboards

### P3 (Future)
- [ ] Higher tiers ($XHI token, Sustainer)
- [ ] NFT rewards
- [ ] Referral system
