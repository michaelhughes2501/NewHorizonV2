// Profile.tsx
import React, { useState, useEffect } from 'react';
import { Save, ShieldCheck, Eye, EyeOff, Trophy } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { AvatarBubble } from '../App';

const RECOVERY_STAGES = ['early', 'mid', 'late', 'sustained'];
const INTEREST_OPTIONS = ['Employment', 'Housing', 'Mental Health', 'Sobriety', 'Education', 'Family', 'Legal', 'Community', 'Spiritual', 'Financial'];
const AVATAR_COLORS = ['#4F46E5','#7C3AED','#DB2777','#DC2626','#D97706','#059669','#0284C7','#0891B2','#65A30D','#EA580C'];

export default function Profile() {
  const { user, token, setUser } = useAuth();
  const [form, setForm] = useState({ bio: '', location: '', facility: '', hide_location: false, hide_history: false, is_mentor: false, recovery_stage: 'early', interests: [] as string[], avatar_color: '#4F46E5' });
  const [achievements, setAchievements] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      let interests: string[] = [];
      try { interests = JSON.parse(user.interests || '[]'); } catch {}
      setForm({ bio: user.bio || '', location: user.location || '', facility: user.facility || '', hide_location: !!user.hide_location, hide_history: !!user.hide_history, is_mentor: !!user.is_mentor, recovery_stage: user.recovery_stage || 'early', interests, avatar_color: user.avatar_color || '#4F46E5' });
    }
    fetch('/api/achievements', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => Array.isArray(d) && setAchievements(d)).catch(() => {});
  }, [user, token]);

  const toggleInterest = (i: string) => setForm(p => ({ ...p, interests: p.interests.includes(i) ? p.interests.filter(x => x !== i) : [...p.interests, i] }));

  const save = async () => {
    setSaving(true);
    const r = await fetch('/api/users/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
    if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  };

  const BADGE_ICONS: Record<string, string> = { welcome: '🎉', first_post: '✍️', journaler: '📔', job_seeker: '💼', checkin_7: '🔥', checkin_30: '⭐', mentored: '🤝', mentor: '🎓', community: '🌐', vault_user: '📁', success_story: '🏆' };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <AvatarBubble name={user?.username || 'U'} color={form.avatar_color} size={60} />
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{user?.username}</h2>
          <p className="text-slate-500 text-sm flex items-center gap-1">{user?.is_verified === 1 && <><ShieldCheck size={14} className="text-indigo-500" /> Verified Member</>}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <h3 className="font-semibold text-slate-900">Avatar Color</h3>
        <div className="flex gap-2 flex-wrap">
          {AVATAR_COLORS.map(c => (
            <button key={c} onClick={() => setForm(p => ({ ...p, avatar_color: c }))}
              style={{ background: c }}
              className={`w-8 h-8 rounded-full transition-transform ${form.avatar_color === c ? 'scale-125 ring-2 ring-offset-1 ring-slate-400' : ''}`} />
          ))}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Bio</label>
          <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell your story…"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Previous Facility</label>
            <input value={form.facility} onChange={e => setForm(p => ({ ...p, facility: e.target.value }))} placeholder="e.g. Rikers Island" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Location / State</label>
            <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. New York" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Recovery Stage</label>
          <select value={form.recovery_stage} onChange={e => setForm(p => ({ ...p, recovery_stage: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize">
            {RECOVERY_STAGES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)} stage</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Interests</label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map(i => (
              <button key={i} type="button" onClick={() => toggleInterest(i)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${form.interests.includes(i) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 text-slate-600 hover:border-indigo-400'}`}>
                {i}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
            <input type="checkbox" checked={form.hide_location} onChange={e => setForm(p => ({ ...p, hide_location: e.target.checked }))} className="rounded" />
            <EyeOff size={14} /> Hide my location from others
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
            <input type="checkbox" checked={form.hide_history} onChange={e => setForm(p => ({ ...p, hide_history: e.target.checked }))} className="rounded" />
            <EyeOff size={14} /> Hide my facility history
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
            <input type="checkbox" checked={form.is_mentor} onChange={e => setForm(p => ({ ...p, is_mentor: e.target.checked }))} className="rounded" />
            <ShieldCheck size={14} /> Available as a mentor
          </label>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60">
          <Save size={15} /> {saved ? 'Saved! ✓' : saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {achievements.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Trophy size={16} className="text-amber-500" /> Your Achievements</h3>
          <div className="flex flex-wrap gap-3">
            {achievements.map((a: any) => (
              <div key={a.id} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-2">
                <span>{BADGE_ICONS[a.badge] || '🥇'}</span>
                <span className="text-xs font-semibold text-amber-800">{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
