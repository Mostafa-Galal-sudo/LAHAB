// Both the frontend (src/main.tsx, src/lib/api.ts) and the Worker
// (worker/index.ts) import this so the admin route/API prefix always match.
// This is obscurity, not security: the real protection is the JWT session +
// PBKDF2 password + rate-limited login in worker/auth.ts. Change this value
// any time (no migration needed) if you want to rotate the path.
export const ADMIN_PATH_SLUG = 'ctrl-db697bf8dc';
