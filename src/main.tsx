import {lazy, StrictMode, Suspense, type ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ADMIN_PATH_SLUG } from '../shared/adminSlug';
import {
  ContactPage,
  CookieConsent,
  NetworkNotice,
  PolicyPage,
  PublicErrorBoundary,
  SeoManager,
  StatusPage,
} from './sitePages/PublicPages';
import { policyByPath } from './sitePages/siteContent';
import './index.css';

const AdminApp = lazy(() => import('./admin/AdminApp.tsx'));
const EditorPreview = lazy(() => import('./pageBuilder/EditorPreview.tsx'));

// No client-side router library is used - the storefront and the admin panel
// are the only two "pages", so a simple path check is enough. The admin path
// is a random slug (not "/admin") to stay off automated bot scanners - see
// shared/adminSlug.ts.
const isAdminRoute = window.location.pathname.startsWith(`/${ADMIN_PATH_SLUG}`);
const isEditorPreviewRoute = window.location.pathname === '/editor-preview';
const normalizedPath = window.location.pathname.length > 1
  ? window.location.pathname.replace(/\/+$/, '')
  : '/';

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline support is best-effort and must never block the storefront.
    });
  });
}

function PublicRoute() {
  const policy = policyByPath.get(normalizedPath);
  const maintenanceEnabled = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

  let page: ReactNode;
  if (maintenanceEnabled && normalizedPath === '/') page = <StatusPage kind="maintenance" />;
  else if (normalizedPath === '/') page = <App />;
  else if (policy) page = <PolicyPage document={policy} />;
  else if (normalizedPath === '/contact') page = <ContactPage />;
  else if (normalizedPath === '/500') page = <StatusPage kind="500" />;
  else if (normalizedPath === '/offline') page = <StatusPage kind="offline" />;
  else if (normalizedPath === '/maintenance') page = <StatusPage kind="maintenance" />;
  else page = <StatusPage kind="404" />;

  return (
    <PublicErrorBoundary>
      <SeoManager path={normalizedPath} />
      {page}
      <CookieConsent />
      <NetworkNotice />
    </PublicErrorBoundary>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<div className="min-h-screen bg-[#0D1929]" aria-label="Loading" />}>
      {isEditorPreviewRoute ? <EditorPreview /> : isAdminRoute ? <AdminApp /> : <PublicRoute />}
    </Suspense>
  </StrictMode>,
);
