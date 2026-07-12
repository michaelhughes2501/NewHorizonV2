import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../AuthContext';

type View = 'login' | 'register' | 'forgot' | 'reset';

const RECOVERY_STAGES = ['early', 'mid', 'late', 'sustained'];
const INTEREST_OPTIONS = ['Employment', 'Housing', 'Mental Health', 'Sobriety', 'Education', 'Family', 'Legal', 'Community', 'Spiritual', 'Financial'];

export default function Auth() {
  const [view, setView] = useState<View>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [facility, setFacility] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [recovery_stage, setRecoveryStage] = useState('early');
  const [interests, setInterests] = useState<string[]>([]);
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const toggleInterest = (i: string) =>
    setInterests(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (view === 'login') {
        const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Login failed');
        login(d.token, d.user);
      } else if (view === 'register') {
        const r = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, password, facility, location, bio, recovery_stage, interests }) });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Registration failed');
        login(d.token, d.user);
      } else if (view === 'forgot') {
        const r = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setSuccess('Check your email for a reset link.');
        if (d._devToken) { setResetToken(d._devToken); setView('reset'); }
      } else if (view === 'reset') {
        const r = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: resetToken, newPassword: password }) });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setSuccess('Password reset! You can now log in.'); setView('login');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center font-black text-3xl text-white mx-auto mb-4 shadow-2xl shadow-indigo-500/30">N</div>
          <h1 className="text-3xl font-bold text-white tracking-tight">New Horizon</h1>
          <p className="text-white/50 mt-1 text-sm">A community for second chances</p>
        </div>

        <div className="bg-white/8 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          {/* Tab switcher */}
          {view === 'login' || view === 'register' ? (
            <div className="flex bg-white/5 rounded-xl p-1 mb-6">
              {(['login', 'register'] as View[]).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${view === v ? 'bg-white text-slate-900 shadow' : 'text-white/60 hover:text-white'}`}>
                  {v}
                </button>
              ))}
            </div>
          ) : (
            <button onClick={() => setView('login')} className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
              ← Back to login
            </button>
          )}

          {error && <div className="bg-red-500/15 border border-red-500/30 text-red-300 rounded-xl p-3 text-sm mb-4">{error}</div>}
          {success && <div className="bg-green-500/15 border border-green-500/30 text-green-300 rounded-xl p-3 text-sm mb-4">{success}</div>}

          <form onSubmit={submit} className="space-y-4">
            {view === 'login' && <>
              <Input label="Username" value={username} onChange={setUsername} placeholder="Your username" />
              <PasswordInput label="Password" value={password} onChange={setPassword} show={showPw} onToggle={() => setShowPw(p => !p)} />
              <button type="button" onClick={() => setView('forgot')} className="text-xs text-indigo-300 hover:text-indigo-200 transition-colors">Forgot password?</button>
            </>}

            {view === 'register' && <>
              <Input label="Username *" value={username} onChange={setUsername} placeholder="Choose a username" />
              <Input label="Email" value={email} onChange={setEmail} placeholder="your@email.com" type="email" />
              <PasswordInput label="Password *" value={password} onChange={setPassword} show={showPw} onToggle={() => setShowPw(p => !p)} />
              <Input label="Previous Facility" value={facility} onChange={setFacility} placeholder="e.g. Rikers, San Quentin" />
              <Input label="Location / State" value={location} onChange={setLocation} placeholder="e.g. New York, CA" />
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Recovery Stage</label>
                <select value={recovery_stage} onChange={e => setRecoveryStage(e.target.value)}
                  className="w-full bg-white/8 border border-white/15 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize">
                  {RECOVERY_STAGES.map(s => <option key={s} value={s} className="bg-slate-900">{s.charAt(0).toUpperCase() + s.slice(1)} stage</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Interests (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map(i => (
                    <button key={i} type="button" onClick={() => toggleInterest(i)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${interests.includes(i) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-white/20 text-white/60 hover:border-indigo-400 hover:text-indigo-300'}`}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Bio (optional)</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell your story briefly…"
                  className="w-full bg-white/8 border border-white/15 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-20 placeholder-white/30" />
              </div>
            </>}

            {view === 'forgot' && <Input label="Email address" value={email} onChange={setEmail} placeholder="your@email.com" type="email" />}

            {view === 'reset' && <>
              <Input label="Reset Token" value={resetToken} onChange={setResetToken} placeholder="Paste token from email" />
              <PasswordInput label="New Password" value={password} onChange={setPassword} show={showPw} onToggle={() => setShowPw(p => !p)} />
            </>}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm hover:from-indigo-400 hover:to-purple-400 transition-all disabled:opacity-60 mt-2 shadow-lg shadow-indigo-500/30">
              {loading ? 'Please wait…' : view === 'login' ? 'Sign In' : view === 'register' ? 'Create Account' : view === 'forgot' ? 'Send Reset Link' : 'Reset Password'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Your data is private and secure. You control what others see.
        </p>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text' }: any) {
  return (
    <div>
      <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-white/8 border border-white/15 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-white/30" />
    </div>
  );
}

function PasswordInput({ label, value, onChange, show, onToggle }: any) {
  return (
    <div>
      <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">{label}</label>
      <div className="relative">
        <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} placeholder="••••••••"
          className="w-full bg-white/8 border border-white/15 text-white rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-white/30" />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}
