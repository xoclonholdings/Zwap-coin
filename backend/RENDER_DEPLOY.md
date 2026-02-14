# Deploy ZWAP! Backend to Render (Free Tier)

## Quick Setup

### 1. Create a New Web Service on Render
- Go to https://dashboard.render.com/new/web-service
- Connect your GitHub repo
- Set **Root Directory** to `backend`
- Set **Runtime** to `Python`

### 2. Build & Start Commands

| Field         | Value                                                                                   |
|---------------|-----------------------------------------------------------------------------------------|
| Build Command | `pip install -r requirements.txt --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/` |
| Start Command | `uvicorn server:app --host 0.0.0.0 --port $PORT`                                       |

### 3. Environment Variables

Set these in the Render dashboard under **Environment**:

| Variable          | Value                                          | Required |
|-------------------|------------------------------------------------|----------|
| `MONGO_URL`       | Your MongoDB Atlas connection string           | Yes      |
| `DB_NAME`         | `zwap_production`                              | Yes      |
| `CORS_ORIGINS`    | Your Netlify frontend URL (e.g. `https://your-app.netlify.app`) | Yes      |
| `STRIPE_API_KEY`  | Your Stripe secret key                         | Yes      |
| `POLYGON_RPC_URL` | Your Alchemy Polygon RPC URL                   | Yes      |
| `ADMIN_API_KEY`   | Your chosen admin key (min 12 chars)           | Yes      |
| `TREASURY_WALLET` | Treasury wallet address (if applicable)        | No       |
| `PYTHON_VERSION`  | `3.11.6`                                       | No       |

### 4. Update Your Netlify Frontend

After Render deploys, update your Netlify frontend's environment variable:

```
REACT_APP_BACKEND_URL=https://zwap-api.onrender.com
```

Replace `zwap-api` with whatever Render assigns as your service name.

### 5. Verify

```bash
curl https://zwap-api.onrender.com/api/health
# Expected: {"status":"healthy","service":"zwap-api"}
```

## Notes

- **Free tier sleeps after 15 min of inactivity.** First request after sleep takes ~30s to cold-start.
- **MongoDB:** You need an external MongoDB. Use [MongoDB Atlas free tier](https://www.mongodb.com/atlas) — the connection string goes in `MONGO_URL`.
- **CORS_ORIGINS:** Set this to your exact Netlify URL. For multiple origins, comma-separate them: `https://app1.netlify.app,https://app2.netlify.app`
- **`emergentintegrations` package:** The build command includes the custom package index. This is required for Stripe checkout integration.

## Blueprint Deploy (Alternative)

If you prefer Infrastructure as Code, push `render.yaml` to your repo root and use Render Blueprints:
https://dashboard.render.com/new/blueprint
