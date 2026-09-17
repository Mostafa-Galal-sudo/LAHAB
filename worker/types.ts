export interface Env {
  DB: D1Database;
  // Optional until the Cloudflare account has an active R2 subscription.
  // Bundled compatibility assets continue to resolve without this binding.
  ASSET_BUCKET?: R2Bucket;

  // Secrets (set via `wrangler secret put NAME`, never committed to git)
  ADMIN_JWT_SECRET: string;
  RESEND_API_KEY?: string;

  // Plain vars (set in wrangler.jsonc `vars`, safe to commit)
  PBKDF2_ITERATIONS?: string;
  EMAIL_FROM?: string;
}
