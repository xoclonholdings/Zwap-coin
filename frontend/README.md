# Zwap Frontend

## Run the app locally

From `frontend/`:

```bash
npm install
npm start
```

Then open `http://localhost:3000`.

## Which version opens by default?

The root route (`/`) immediately redirects to `/v1`, so the **new onboarding-first app flow** is the default experience when you load the frontend locally.

## New app onboarding sequence (`/v1`)

The `/v1` journey follows this route sequence:

1. `/v1` → `LandingSequence`
2. `/v1/about` → `OnboardingAboutPage` (optional educational detour)
3. `/v1/move` → `MoveOnboardingSequence`
4. `/v1/play` → `PlayOnboardingSequence`
5. `/v1/signup-gate` → `SignupGate` (shown once both Move + Play are tried)
6. `/v1/signup` → `SignupOnboarding`
7. `/v1/dashboard` → `SimplifiedDashboard`

### Important behavior

- If a user is not authenticated and has tried both Move and Play, they are sent to `/v1/signup-gate`.
- If a user is already authenticated, `/v1/signup-gate` forwards them directly to `/v1/dashboard`.
- Any unknown `/v1/*` path falls back to `/v1`.

## Legacy app paths

Older shell routes (`/dashboard`, `/move`, `/play`, `/swap`, `/shop`, etc.) still exist, but they are not the initial landing path anymore.
