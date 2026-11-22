import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { Field, PasswordField } from './ui/Field';
import { BrandMark } from './ui/BrandMark';

export type AuthView = 'login' | 'register' | 'forgot' | 'reset';

/**
 * Sign-in, sign-up and password reset. Sign-up asks only for what's needed to
 * start (username, password, optional email); the rest of the profile is
 * filled in later from the Profile page.
 */
export default function Auth({ initialView = 'login' }: { initialView?: AuthView }) {
  const [view, setView] = useState<AuthView>(initialView);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const switchView = (v: AuthView) => {
    setView(v);
    setError('');
    setSuccess('');
    if (v === 'login' || v === 'register') navigate(v === 'login' ? '/login' : '/register', { replace: true });
  };

  const post = async (url: string, body: unknown) => {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || 'Something went wrong. Please try again.');
    return d;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if ((view === 'register' || view === 'reset') && password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      if (view === 'login') {
        const d = await post('/api/auth/login', { username, password });
        login(d.token, d.user);
        navigate('/dashboard', { replace: true });
      } else if (view === 'register') {
        const d = await post('/api/auth/register', { username, email, password });
        login(d.token, d.user);
        navigate('/dashboard', { replace: true });
      } else if (view === 'forgot') {
        const d = await post('/api/auth/forgot-password', { email });
        setSuccess('If that email has an account, a reset link is on its way.');
        if (d._devToken) { setResetToken(d._devToken); setView('reset'); }
      } else {
        await post('/api/auth/reset-password', { token: resetToken, newPassword: password });
        setPassword('');
        setView('login');
        setSuccess('Password reset. You can sign in now.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitLabel = { login: 'Sign in', register: 'Create free account', forgot: 'Send reset link', reset: 'Reset password' }[view];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas p-4">
      <DawnGlow />
      <main id="main" className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex flex-col items-center gap-3 rounded-2xl">
            <BrandMark size={56} />
            <span className="text-3xl font-bold tracking-tight text-ink">New Horizon</span>
          </Link>
          <p className="mt-1 text-sm text-ink-2">A community for second chances</p>
        </div>

        <div className="glass rounded-2xl p-6 shadow-2xl sm:p-8">
          {view === 'login' || view === 'register' ? (
            <div className="mb-6 flex rounded-xl bg-white/5 p-1" role="group" aria-label="Choose sign in or create account">
              {(['login', 'register'] as AuthView[]).map(v => (
                <button key={v} type="button" onClick={() => switchView(v)} aria-pressed={view === v}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${view === v ? 'bg-ink text-canvas shadow' : 'text-ink-2 hover:text-ink'}`}>
                  {v === 'login' ? 'Sign in' : 'Join'}
                </button>
              ))}
            </div>
          ) : (
            <button type="button" onClick={() => switchView('login')} className="mb-6 flex items-center gap-2 text-sm text-ink-2 transition-colors hover:text-ink">
              ← Back to sign in
            </button>
          )}

          <div aria-live="polite">
            {error && <div role="alert" className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/15 p-3 text-sm text-rose-200">{error}</div>}
            {success && <div role="status" className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-3 text-sm text-emerald-200">{success}</div>}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {view === 'login' && <>
              <Field label="Username" value={username} onChange={setUsername} autoComplete="username" autoCapitalize="none" required />
              <PasswordField label="Password" value={password} onChange={setPassword} autoComplete="current-password" required />
              <button type="button" onClick={() => switchView('forgot')} className="text-xs text-accent-ink transition-colors hover:text-ink">Forgot password?</button>
            </>}

            {view === 'register' && <>
              <Field label="Username" value={username} onChange={setUsername} autoComplete="username" autoCapitalize="none" required
                hint="This is how others see you. It doesn't have to be your real name." />
              <PasswordField label="Password" value={password} onChange={setPassword} autoComplete="new-password" minLength={8} required
                hint="At least 8 characters." />
              <Field label="Email (optional)" type="email" value={email} onChange={setEmail} autoComplete="email" inputMode="email"
                hint="Only used to reset your password." />
            </>}

            {view === 'forgot' && (
              <Field label="Email address" type="email" value={email} onChange={setEmail} autoComplete="email" inputMode="email" required />
            )}

            {view === 'reset' && <>
              <Field label="Reset code" value={resetToken} onChange={setResetToken} autoComplete="one-time-code" required />
              <PasswordField label="New password" value={password} onChange={setPassword} autoComplete="new-password" minLength={8} required />
            </>}

            <button type="submit" disabled={loading}
              className="dawn-fill mt-2 w-full rounded-xl py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition-[filter,transform] duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-60">
              {loading ? 'Please wait…' : submitLabel}
            </button>
          </form>
        </div>

        <Link to="/help" className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-rose-200 hover:text-white">
          <Phone size={14} aria-hidden="true" /> Need help right now? Crisis lines, no account needed.
        </Link>
        <p className="mt-3 text-center text-xs text-ink-3">Your data is private. You control what others see.</p>
      </main>
    </div>
  );
}

/** Soft dawn light behind auth and landing screens. Purely decorative. */
export function DawnGlow() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute -bottom-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(245,165,36,0.28),rgba(240,81,122,0.16)_55%,transparent)] blur-2xl" />
      <div className="absolute -top-40 right-[-10%] h-[420px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(139,92,246,0.22),transparent)] blur-2xl" />
    </div>
  );
}
