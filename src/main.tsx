import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import AdminApp from './admin/AdminApp.tsx';
import { NotFoundPage } from './pages/StatusPage.tsx';
import { ADMIN_PATH_SLUG } from '../shared/adminSlug';
import './index.css';

// No client-side router library is used - there are only three possible
// "pages": the storefront ("/"), the admin panel, and everything else, which
// gets a custom branded 404 instead of silently rendering the storefront.
// The admin path is a random slug (not "/admin") to stay off automated bot
// scanners - see shared/adminSlug.ts.
const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
const isRoot = pathname === '/';
const isAdminRoute = pathname === `/${ADMIN_PATH_SLUG}`;

function RootRoute() {
  if (isAdminRoute) return <AdminApp />;
  if (isRoot) return <App />;
  return <NotFoundPage isArabic={navigator.language?.startsWith('ar')} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootRoute />
  </StrictMode>,
);
