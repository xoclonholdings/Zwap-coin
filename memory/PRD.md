# ZWAP! Coin App - Product Requirements Document

## Original Problem Statement
Build a cryptocurrency app for ZWAP! Coin with:
- Tab for pedometer (MOVE) - "Move & Earn"
- Tab for games (PLAY) - "Play & Earn"
- Tab for marketplace (SHOP) - "Shop with ZWAP!"
- Tab for crypto exchange (SWAP) - "Swap your ZWAP!"

**Tagline: "MOVE. PLAY. SWAP. SHOP."**

## Architecture

### Backend (FastAPI + MongoDB + Web3.py)
- `server.py` - All API endpoints
- Polygon RPC integration via Alchemy

### Frontend (React + Tailwind + Framer Motion)
- Splash → Dashboard flow (no Welcome page)
- Persistent header with wallet connection
- Animated footer ticker with live leaderboard
- On-chain balance display in header

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
- [x] AboutPage scrolling fixed (Jan 10, 2025)

### Blockchain Integration (Jan 10, 2025)
- [x] **REAL ZWAP Token Contract Connected** on Polygon
  - Contract Address: `0xe8898453af13b9496a6e8ada92c6efdaf4967a81`
  - Network: Polygon Mainnet (Chain ID: 137)
  - Symbol: ZWAP
  - Decimals: 18
  - Total Supply: 30,000,000,000 (30 billion)
- [x] `/api/blockchain/contract-info` - Returns verified contract data
- [x] `/api/blockchain/balance/{wallet}` - Returns REAL on-chain balance
- [x] On-chain balance display in AppHeader
- [x] Alchemy RPC integration configured

## Current Status: HYBRID (Partial Real Integration)

### REAL (On-Chain):
✅ ZWAP token balance reading from Polygon blockchain
✅ Contract info verification
✅ Wallet connection via WalletConnect

### STILL SIMULATED:
⚠️ In-app ZWAP balance (database only, not synced with chain)
⚠️ Swap execution (updates database, not real DEX)
⚠️ Subscription money (Stripe test mode)
⚠️ Reward distribution (no on-chain transfers yet)

## Prioritized Backlog

### P0 (Immediate Next Steps)
- [ ] Verify ZWAP contract on PolygonScan using ZWAPCoin_Optimized.sol
- [ ] Implement real token swaps (1inch/Li.Fi backend integration)
- [ ] Stripe webhook for automatic tier upgrades
- [ ] Ad integration (rewarded video between game rounds)

### P1 (Ready for Production)
- [ ] ZWAP faucet/reward distribution (treasury wallet sends real tokens)
- [ ] Switch to Stripe live mode
- [ ] Sync on-chain and in-app balances

### P2 (Feature Enhancements)
- [ ] Implement zTetris and zSlots games (full gameplay)
- [ ] Real DEX swap integration (custom backend with 1inch)
- [ ] Geolocation for local leaderboards
- [ ] Progressive game difficulty

### P3 (Future)
- [ ] Higher tiers ($XHI token, Sustainer)
- [ ] NFT rewards
- [ ] Referral system
- [ ] Add USDT to SWAP tab

## Key Technical Details

### ZWAP Contract
```
Address: 0xe8898453af13b9496a6e8ada92c6efdaf4967a81
Network: Polygon PoS (Chain ID: 137)
Owner/Deployer: 0x85EaDbB165cf4c8202d33562DfaeeA0b632B0849
Solidity Source: /app/memory/ZWAPCoin_Optimized.sol
```

### Environment Configuration
- Backend: `/app/backend/.env` contains `POLYGON_RPC_URL` (Alchemy)
- Frontend: Uses `REACT_APP_BACKEND_URL` for API calls
