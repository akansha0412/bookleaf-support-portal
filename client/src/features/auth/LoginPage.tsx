import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import type { Auth, LoginResult } from './auth.types';

export function LoginPage({ onLogin }: { onLogin: (auth: Auth) => void }) {
  const [email, setEmail] = useState('admin@bookleaf.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(
    event: Parameters<
      NonNullable<React.ComponentProps<'form'>['onSubmit']>
    >[0],
  ) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const result = await apiRequest<LoginResult>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // if (result.data.user.role !== 'ADMIN') {
      //   setError('This portal is for administrators. Please use an admin account.');
      //   return;
      // }

      onLogin(result.data);
      navigate(
        result.data.user.role === 'ADMIN' ? '/admin' : '/author',
        { replace: true },
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400 text-xl font-black text-slate-950">
            b.
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight">BookLeaf</p>
            <p className="text-xs text-slate-400">Publishing support</p>
          </div>
        </div>

        <div className="relative max-w-lg">
          <div className="mb-5 inline-flex rounded-full border border-white/15 px-3 py-1.5 text-xs text-emerald-300">
            AUTHOR SUPPORT OPERATIONS
          </div>
          <h1 className="text-5xl font-semibold leading-tight tracking-tight">
            Every author deserves a better answer.
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
            Manage author requests, resolve publishing issues, and deliver
            thoughtful support from one workspace.
          </p>
        </div>

        <p className="relative text-xs text-slate-500">
          BookLeaf · Author Support Portal
        </p>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 font-black text-white">
              b.
            </div>
            <span className="text-xl font-bold text-slate-900">BookLeaf</span>
          </div>

          <p className="text-sm font-semibold text-emerald-700">
          AUTHOR & ADMIN WORKSPACE
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            Welcome back
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
          Sign in to manage your books, royalties, and support requests.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                placeholder="you@bookleaf.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign in to dashboard'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          Authorized BookLeaf users only.
          </p>
        </div>
      </section>
    </main>
  );
}
