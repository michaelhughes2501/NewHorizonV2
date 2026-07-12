import React, { useState, useEffect } from 'react';
import { Heart, TrendingUp } from 'lucide-react';
import { useAuth } from '../AuthContext';

const MOODS = [
  { val: 1, emoji: '😢', label: 'Struggling', color: 'bg-red-100 border-red-300 text-red-700' },
  { val: 2, emoji: '😔', label: 'Low', color: 'bg-orange-100 border-orange-300 text-orange-700' },
  { val: 3, emoji: '😐', label: 'Okay', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
  { val: 4, emoji: '🙂', label: 'Good', color: 'bg-lime-100 border-lime-300 text-lime-700' },
  { val: 5, emoji: '😄', label: 'Great', color: 'bg-green-100 border-green-300 text-green-700' },
];

export default function CheckIns() {
  const { token } = useAuth();
  const [checkins, setCheckins] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetch('/api/checkins', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => {
        if (Array.isArray(d)) {
          setCheckins(d);
          const todayEntry = d.find((c: any) => c.date === today);
          if (todayEntry) { setSelected(todayEntry.mood); setNote(todayEntry.note || ''); setSaved(true); }
        }
      }).catch(() => {});
  }, [token]);

  const submit = async () => {
    if (!selected) return;
    const r = await fetch('/api/checkins', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ mood: selected, note, date: today })
    });
    if (r.ok) { setSaved(true); setCheckins(p => { const f = p.filter(c => c.date !== today); return [{ date: today, mood: selected, note }, ...f]; }); }
  };

  const avg = checkins.length ? (checkins.reduce((s, c) => s + c.mood, 0) / checkins.length).toFixed(1) : '—';
  const streak = (() => {
    let s = 0;
    const sorted = [...checkins].sort((a, b) => b.date.localeCompare(a.date));
    for (let i = 0; i < sorted.length; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      if (sorted[i]?.date === d.toISOString().split('T')[0]) s++; else break;
    }
    return s;
  })();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Daily Check-In</h2>
        <p className="text-slate-500 text-sm mt-1">Track your wellness and celebrate consistency.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">{checkins.length}</p>
          <p className="text-xs text-slate-500 mt-1">Total Check-ins</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">🔥 {streak}</p>
          <p className="text-xs text-slate-500 mt-1">Day Streak</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{avg}</p>
          <p className="text-xs text-slate-500 mt-1">Avg Mood</p>
        </div>
      </div>

      {/* Today's check-in */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">How are you feeling today?</h3>
        <div className="flex gap-3 flex-wrap">
          {MOODS.map(m => (
            <button key={m.val} onClick={() => { setSelected(m.val); setSaved(false); }}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${selected === m.val ? m.color + ' scale-105 shadow' : 'border-slate-200 hover:border-slate-300'}`}>
              <span className="text-3xl">{m.emoji}</span>
              <span className="text-xs font-medium">{m.label}</span>
            </button>
          ))}
        </div>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Optional: add a note about your day…"
          className="w-full mt-4 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-20" />
        <button onClick={submit} disabled={!selected}
          className="mt-3 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50">
          <Heart size={15} /> {saved ? 'Update Check-In ✓' : 'Save Check-In'}
        </button>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-indigo-500" /> Recent History</h3>
        {checkins.length === 0
          ? <p className="text-slate-400 text-sm">No check-ins yet. Start today!</p>
          : (
            <div className="space-y-2">
              {checkins.slice(0, 14).map(c => {
                const mood = MOODS.find(m => m.val === c.mood);
                return (
                  <div key={c.id || c.date} className="flex items-center gap-4 py-2 border-b border-slate-50 last:border-0">
                    <span className="text-2xl">{mood?.emoji || '•'}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">{mood?.label}</span>
                        <span className="text-xs text-slate-400">{c.date}</span>
                      </div>
                      {c.note && <p className="text-xs text-slate-500 mt-0.5">{c.note}</p>}
                    </div>
                    {/* Mini bar */}
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`w-2 h-4 rounded-sm ${i <= c.mood ? 'bg-indigo-400' : 'bg-slate-100'}`} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}
