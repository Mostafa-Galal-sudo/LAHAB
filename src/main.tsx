import {lazy, StrictMode, Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ADMIN_PATH_SLUG } from '../shared/adminSlug';
import './index.css';

const AdminApp = lazy(() => import('./admin/AdminApp.tsx'));
const EditorPreview = lazy(() => import('./pageBuilder/EditorPreview.tsx'));

// No client-side router library is used - the storefront and the admin panel
// are the only two "pages", so a simple path check is enough. The admin path
// is a random slug (not "/admin") to stay off automated bot scanners - see
// shared/adminSlug.ts.
const isAdminRoute = window.location.pathname.startsWith(`/${ADMIN_PATH_SLUG}`);
const isEditorPreviewRoute = window.location.pathname === '/editor-preview';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<div className="min-h-screen bg-[#0D1929]" aria-label="Loading" />}>
      {isEditorPreviewRoute ? <EditorPreview /> : isAdminRoute ? <AdminApp /> : <App />}
    </Suspense>
  </StrictMode>,
);
