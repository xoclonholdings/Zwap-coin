# ZWAP! Coin — API Contract Map

> Single source of truth for all frontend ↔ backend endpoint contracts.
> Stubs marked with `[STUB]` are defined but not yet implemented on the backend.

---

## Base URL

```
{REACT_APP_BACKEND_URL}/api
```

---

## Wallet

| Method | Path | Request | Response | Errors | Status |
|--------|------|---------|----------|--------|--------|
| POST | `/users/connect` | `{ wallet_address: string }` | `{ wallet_address, username, tier, zwap_balance, zpts_balance, ... }` | 500 server error | Live |
| GET | `/wallet/status` | — | `{ connected: bool }` | — | `[STUB]` |
| POST | `/wallet/disconnect` | — | `{ disconnected: bool }` | — | `[STUB]` |

---

## User

| Method | Path | Request | Response | Errors | Status |
|--------|------|---------|----------|--------|--------|
| GET | `/users/:address` | — | `{ wallet_address, username, tier, zwap_balance, zpts_balance, daily_steps, total_steps, games_played, daily_zpts_earned, ... }` | 404 User not found | Live |
| PUT | `/users/:address/profile` | `{ username: string, avatar_url: string }` | `{ wallet_address, username, avatar_url }` | 404 User not found | Live |
| GET | `/blockchain/balance/:address` | — | `{ wallet_address, onchain_balance: float, token_symbol, network }` | 500 RPC error | Live |
| GET | `/blockchain/contract-info` | — | `{ address, name, symbol, decimals, total_supply, network }` | 500 | Live |

---

## Move-to-Earn

| Method | Path | Request | Response | Errors | Status |
|--------|------|---------|----------|--------|--------|
| POST | `/faucet/steps/:address` | `{ steps: int }` | `{ zwap_earned: float, total_steps: int, daily_steps: int }` | 400 Invalid steps, 429 Daily cap | Live |
| GET | `/move/session/:address` | — | `{ active: bool, steps: int, started_at: ISO }` | — | `[STUB]` |
| POST | `/move/anti-cheat` | `{ wallet_address: string, flags: { gps_speed: float, step_variance: float, device_motion: bool } }` | `{ received: bool, flagged: bool }` | — | `[STUB]` |

---

## Play (Games)

| Method | Path | Request | Response | Errors | Status |
|--------|------|---------|----------|--------|--------|
| GET | `/games/trivia/questions?count=N&difficulty=D` | — | `{ questions: [{ id, question, options[], correctAnswer }] }` | — | Stub (uses education spine locally) |
| POST | `/games/trivia/answer` | `{ question_id: string, answer: string, time_taken: float }` | `{ correct: bool, explanation: string?, time_bonus: float }` | — | Stub |
| POST | `/games/result/:address` | `{ game_type: "zbrickles"\|"ztrivia"\|"ztetris"\|"zslots", score: int, level: int, blocks_destroyed: int }` | `{ score: int, zwap_earned: float, zpts_earned: int, game_type }` | 400 Invalid game, 429 Daily cap | Live |
| POST | `/faucet/scratch/:address` | — | `{ zwap_earned: float, scratch_prize: string }` | 429 Already scratched | Live |

---

## Shop

| Method | Path | Request | Response | Errors | Status |
|--------|------|---------|----------|--------|--------|
| GET | `/shop/items` | — | `[{ id, name, description, price_zwap, price_zpts, category, image_url, available }]` | — | Live |
| POST | `/shop/purchase/:address` | `{ item_id: string, payment_type: "zwap"\|"zpts" }` | `{ success: bool, item, new_balance }` | 400 Insufficient funds, 404 Item not found | Live |

---

## Swap

| Method | Path | Request | Response | Errors | Status |
|--------|------|---------|----------|--------|--------|
| GET | `/swap/prices` | — | `{ prices: { ZWAP: float, MATIC: float, ... }, last_updated: ISO }` | 500 Price feed error | Live |
| POST | `/swap/execute/:address` | `{ from_token: string, to_token: string, amount: float }` | `{ success: bool, from_amount, to_amount, fee, tx_hash? }` | 400 Invalid pair, 400 Insufficient balance | Live |
| GET | `/swap/quote?from=X&to=Y&amount=N` | — | `{ from, to, amount, estimated: float, fee: float, rate: float }` | 400 Invalid pair | `[STUB]` |
| GET | `/swap/history/:address` | — | `{ swaps: [{ id, from, to, amount, received, fee, timestamp }] }` | — | `[STUB]` |

---

## Subscription (Stripe)

| Method | Path | Request | Response | Errors | Status |
|--------|------|---------|----------|--------|--------|
| POST | `/subscription/checkout` | `{ origin_url: string }` | `{ checkout_url: string, session_id: string }` | 500 Stripe error | Live |
| GET | `/subscription/status/:sessionId` | — | `{ status: "paid"\|"unpaid"\|"expired", session_id }` | 404 Session not found | Live |
| POST | `/subscription/activate/:address?session_id=X` | — | `{ success: bool, tier: "plus", activated_at: ISO }` | 400 Not paid, 404 Session | Live |
| POST | `/subscription/cancel/:address` | — | `{ cancelled: bool }` | — | `[STUB]` |

---

## zPts

| Method | Path | Request | Response | Errors | Status |
|--------|------|---------|----------|--------|--------|
| POST | `/zpts/convert/:address` | `{ zpts_amount: int }` | `{ zwap_received: float, new_zpts_balance: int, new_zwap_balance: float }` | 400 Insufficient zPts, 400 Below minimum | Live |

---

## Treasury / Claims

| Method | Path | Request | Response | Errors | Status |
|--------|------|---------|----------|--------|--------|
| POST | `/claims/request` | `{ wallet_address: string, amount: float }` | `{ claim_id: string, status: "pending"\|"processing", estimated_time: int }` | 400 Insufficient balance, 429 Rate limit | `[STUB]` |
| GET | `/claims/status/:claimId` | — | `{ claim_id, status: "pending"\|"processing"\|"completed"\|"failed", tx_hash?: string }` | 404 Claim not found | `[STUB]` |
| GET | `/claims/history/:address` | — | `{ claims: [{ claim_id, amount, status, tx_hash, timestamp }] }` | — | `[STUB]` |

---

## Leaderboard

| Method | Path | Request | Response | Errors | Status |
|--------|------|---------|----------|--------|--------|
| GET | `/leaderboard/:category?limit=N` | — | `[{ wallet_address, username, score, rank }]` | 400 Invalid category | Live |
| GET | `/leaderboard/stats` | — | `{ total_users, total_steps, total_games, ... }` | — | Live |
| GET | `/leaderboard/user/:address/:category` | — | `{ rank: int, score: float, percentile: float }` | 404 | Live |

---

## Admin

> Admin endpoints require `X-Admin-Key` header. See `AdminPanel.jsx` for the authenticated wrapper.

| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| POST | `/admin/login` | `{ api_key: string }` | `{ success: bool }` | Live |
| GET | `/admin/dashboard` | — | `{ users: {}, treasury: {}, games: {}, ... }` | Live |
| GET | `/admin/users` | — | `[{ wallet_address, tier, ... }]` | Live |
| POST | `/admin/users/:id/suspend` | — | `{ success: bool }` | Live |
| GET | `/admin/account/settings` | — | `{ admin_email, notification_enabled, ... }` | Live |
| PUT | `/admin/account/settings` | `{ admin_email, notification_enabled, two_factor_enabled }` | `{ success: bool }` | Live |
| POST | `/admin/account/change-key` | `{ current_key, new_key }` | `{ success: bool, message }` | Live |
| *...other admin endpoints* | See `admin_routes.py` | | | Live |

---

## Backend Reward Service Stubs

> Located at `backend/services/reward_service.py`. All raise `NotImplementedError`.

| Function | Inputs | Outputs | Purpose |
|----------|--------|---------|---------|
| `calculate_play_reward(game_type, score, level, tier)` | game result + tier | `{ zwap: float, zpts: int }` | Compute rewards for a game session |
| `calculate_move_reward(steps, tier, daily_steps_so_far)` | step count + context | `{ zwap: float }` | Compute ZWAP earned from steps |
| `convert_zpts_to_zwap(zpts_amount, tier)` | zPts + tier | `{ zwap: float, rate: float }` | Conversion rate and output |
| `get_tier_multipliers(tier)` | tier name | `{ move: float, play: float, cap: int }` | All multipliers for a tier |
| `enforce_daily_caps(wallet, tier, earned_today)` | context | `{ capped: bool, remaining: float }` | Check if user hit daily limit |

---

## Error Response Shape

All errors return:
```json
{ "detail": "Human-readable error message" }
```
HTTP status codes: `400` (bad request), `401` (auth), `404` (not found), `429` (rate limit), `500` (server).
