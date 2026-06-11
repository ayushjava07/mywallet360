# MyWallet360

A responsive React dashboard for a crypto wallet identity and portfolio overview.

## Development

```bash
npm install
npm --prefix backend install
npm run dev
```

In a second terminal:

```bash
npm --prefix backend run dev
```

Copy `.env.example` and `backend/.env.example` to local `.env` files and set
the required provider credentials. Never commit secrets.

Rotate provider credentials immediately if an `.env` file is ever shared,
logged, or exposed outside the machine that runs the service.

## Production

Required backend variables:

- `NODE_ENV=production`
- `ETHERSCAN_API_KEY`
- `FRONTEND_URL` containing the allowed frontend origin or comma-separated origins

Optional integrations and tuning are documented in `backend/.env.example`.

The dashboard uses Etherscan only. ETH balance and price come from Etherscan,
while ERC-20 balances are estimated from transfers during the selected
analysis period. USD values are available only for ETH, a small hardcoded list
of USD-pegged tokens, and ETH-equivalent tokens.

The dashboard labels this result as **estimated priced assets**. It does not
include NFTs, DeFi positions, debt, related addresses, unpriced tokens, or
token balances whose relevant transfers happened before the selected period.
High-activity wallets may hit the 5,000-record token-transfer cap; those
results are marked as partial.

Before deploying, run:

```bash
npm run check
```

For local development, leave `VITE_API_URL` empty. Vite proxies `/api`
requests to `http://localhost:5000`.

### Vercel Backend

Production uses two Vercel projects from this repository:

- Frontend project: repository root
- Backend project: `backend`

The frontend keeps requests same-origin, for example
`https://mywallet360.vercel.app/api/wallet/...`. The root `vercel.json`
forwards `/api/*` to `https://mywallet360-backend.vercel.app/api/*`.

Configure the backend Vercel project with:

- Root Directory: `backend`
- Framework Preset: `Other`
- Build Command: leave empty
- Output Directory: leave empty
- Install Command: `npm install`

Vercel uses `backend/api/index.js` as the serverless Express entrypoint. Add
the required variables from `backend/.env.example` to the backend project:

- `NODE_ENV=production`
- `ETHERSCAN_API_KEY`
- `FRONTEND_URL=https://mywallet360.vercel.app`

Do not set `VITE_API_URL` for the standard deployment. The frontend rewrite
keeps the backend URL and provider credentials out of browser code.

The public wallet API returns only dashboard-required summaries. Large raw
asset and NFT collections remain internal to the backend calculations.

## Local Preview

```bash
npm run build
npm run preview
```

Wallet search accepts Ethereum addresses and ENS `.eth` names. ENS names are
resolved before the existing wallet analytics request runs.

Wallet analytics can be requested for 1, 7, 30, or 365 days using the
dashboard period selector or the API query parameter:

```text
GET /api/wallet/:address?days=7
```
