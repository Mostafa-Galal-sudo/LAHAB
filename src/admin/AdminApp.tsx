import React, { useEffect, useState } from 'react';
import { adminMe } from '../lib/api';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export const AdminApp: React.FC = () => {
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    adminMe()
      .then((res) => setUsername(res.username))
      .catch(() => setUsername(null))
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return <div className="min-h-screen bg-[#0D1929]" />;
  }

  return !username ? (
    <AdminLogin onLoggedIn={setUsername} />
  ) : (
    <AdminDashboard username={username} onLoggedOut={() => setUsername(null)} />
  );
};

export default AdminApp;
