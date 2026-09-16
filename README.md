# LΛHΛB — Streetwear Heritage

Runs entirely on Cloudflare: a React SPA served as static assets + a Hono API
Worker + a D1 (SQLite-compatible) database. No Node server, no separate
backend host needed.

## Stack

- **Frontend:** React + Vite, served as static assets
- **API:** [Hono](https://hono.dev) running on Cloudflare Workers (`worker/`)
- **Database:** [Cloudflare D1](https://developers.cloudflare.com/d1/) (`migrations/`)
- **Auth:** JWT sessions ([jose](https://github.com/panva/jose)) + PBKDF2 password hashing (Web Crypto)
- **Email:** [Resend](https://resend.com) HTTP API (contact form + stock alerts)

## First-time setup

```bash
npm install
npx wrangler login
```

### 1. Create the D1 database

```bash
npx wrangler d1 create lahab-db
```

Copy the `database_id` it prints into `wrangler.jsonc` (replace
`REPLACE_WITH_YOUR_D1_DATABASE_ID`).

### 2. Run migrations

```bash
npm run db:migrate:local    # local dev database
npm run db:migrate:remote   # real, deployed database (after step 1)
```

### 3. Set secrets

```bash
# Signs admin session tokens - generate a random value:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
npx wrangler secret put ADMIN_JWT_SECRET

# Optional - without this, contact-form emails are logged instead of sent.
# Get a free key at https://resend.com (verify a sending domain first).
npx wrangler secret put RESEND_API_KEY
```

For local development, copy `.dev.vars.example` to `.dev.vars` and fill in
the same values (gitignored, never committed).

### 4. Seed the admin account

```bash
npm run seed:admin:local    # for local dev
npm run seed:admin:remote   # for the real, deployed database
```

Prints a random admin username + password **once**. Save them — the admin
login page lives at `/ctrl-db697bf8dc` (see `shared/adminSlug.ts` to change
this path).

## Local development

```bash
npm run dev
```

Runs the full stack (frontend + Worker + local D1) via Vite.

## Deploy

```bash
npm run deploy
```

Builds and deploys to Cloudflare Workers in one step.
