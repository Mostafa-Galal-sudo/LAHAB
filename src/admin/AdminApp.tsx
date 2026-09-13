import React, { useEffect, useState } from 'react';
import { adminMe, ApiError } from '../lib/api';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import FlameCursor from '../components/FlameCursor';
import { ForbiddenPage } from '../pages/StatusPage';

export const AdminApp: React.FC = () => {
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  // BUG FIX: previously any failed /me check (expired token, revoked account,
  // etc.) just fell back to the login screen. Now a 403 (valid session, but
  // the admin account was deleted) shows a distinct "no access" page instead
  // of implying the user could just log back in with the same credentials.
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    adminMe()
      .then((res) => setUsername(res.username))
      .catch((err) => {
        setUsername(null);
        if (err instanceof ApiError && err.status === 403) {
          setForbidden(true);
        }
      })
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return <div className="min-h-screen bg-[#0D1929]" />;
  }

  if (forbidden) {
    return <ForbiddenPage />;
  }

  return (
    <>
      <FlameCursor />
      {!username ? (
        <AdminLogin onLoggedIn={setUsername} />
      ) : (
        <AdminDashboard username={username} onLoggedOut={() => setUsername(null)} />
      )}
    </>
  );
};

export default AdminApp;
