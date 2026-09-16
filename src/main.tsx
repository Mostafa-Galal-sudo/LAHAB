import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import AdminApp from './admin/AdminApp.tsx';
import { ADMIN_PATH_SLUG } from '../shared/adminSlug';
import './index.css';

// No client-side router library is used - the storefront and the admin panel
// are the only two "pages", so a simple path check is enough. The admin path
// is a random slug (not "/admin") to stay off automated bot scanners - see
// shared/adminSlug.ts.
const isAdminRoute = window.location.pathname.startsWith(`/${ADMIN_PATH_SLUG}`);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdminRoute ? <AdminApp /> : <App />}
  </StrictMode>,
);
