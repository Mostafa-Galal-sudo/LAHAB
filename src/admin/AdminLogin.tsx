import React, { useState } from 'react';
import { adminLogin } from '../lib/api';
import Wordmark from '../components/Wordmark';

interface AdminLoginProps {
  onLoggedIn: (username: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setLoading(true);
    setError('');
    try {
      const result = await adminLogin(username.trim(), password);
      onLoggedIn(result.username);
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1929] text-[#E2E6E8] flex items-center justify-center px-4 font-body">
      <div className="w-full max-w-sm border border-[#D8A065]/40 bg-[#132238]/50 p-8 space-y-6">
        <div className="flex justify-center">
          <Wordmark size="sm" showMedallion={false} />
        </div>
        <div className="text-center space-y-1">
          <h1 className="font-heading text-lg text-[#D8A065] uppercase tracking-wider">Admin Panel</h1>
          <p className="text-xs text-[#E2E6E8]/60">Sign in to manage products</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 border border-red-500/60 bg-red-950/40 text-red-300 text-xs">{error}</div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-heading text-[#E2E6E8]/80 uppercase tracking-wider block">
              Username
            </label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#0D1929] border border-[#E2E6E8]/30 px-3.5 py-2.5 text-sm text-[#E2E6E8] focus:outline-none focus:border-[#D8A065]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-heading text-[#E2E6E8]/80 uppercase tracking-wider block">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0D1929] border border-[#E2E6E8]/30 px-3.5 py-2.5 text-sm text-[#E2E6E8] focus:outline-none focus:border-[#D8A065]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-lahab-primary py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
