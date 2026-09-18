# GitHub-backed asset uploads

LAHAB can use its GitHub repository as a zero-cost asset archive when R2 is not configured.

## One-time setup

1. Create a fine-grained GitHub personal access token.
2. Restrict repository access to `Mostafa-Galal-sudo/LAHAB` only.
3. Grant only **Contents: Read and write** permission.
4. Store it in Cloudflare Workers as `GITHUB_ASSET_TOKEN`:

   ```powershell
   npx wrangler secret put GITHUB_ASSET_TOKEN
   ```

5. For local development, add the same key to `.dev.vars`.
6. Deploy the Worker once after this integration is committed.

The repository and branch are non-secret variables in `wrangler.jsonc`.

## Runtime behavior

- The existing authenticated admin upload endpoint validates extension, MIME type, binary signature, and size.
- Files are capped at 10 MB for the GitHub provider.
- Generated UUID filenames are committed under `public/assets/<kind>/`.
- D1 stores metadata and the stable asset ID, never file binary or base64.
- The public asset endpoint redirects to GitHub's raw-file CDN, so an uploaded asset is usable without waiting for a storefront deployment.
- Safe deletion removes the current file from the repository and its D1 metadata. Git history remains immutable.

Because each upload advances `main`, run `git pull --rebase` before beginning later local development work.
