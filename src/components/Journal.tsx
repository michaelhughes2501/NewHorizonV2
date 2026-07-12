import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, EyeOff, Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { JournalEntry } from '../types';

export default function Journal() {
  const { token } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [active, setActive] = useState<JournalEntry | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', is_shared: false });

  useEffect(() => { fetchEntries(); }, [token]);

  const fetchEntries = () =>
    fetch('/api/journal', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => Array.isArray(d) && setEntries(d)).catch(() => {});

  const save = async () => {
    if (!form.content.trim()) return;
    if (active) {
      await fetch(`/api/journal/${active.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
    } else {
      await fetch('/api/journal', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
    }
    fetchEntries(); setActive(null); setIsNew(false); setForm({ title: '', content: '', is_shared: false });
  };

  const del = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    await fetch(`/api/journal/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchEntries(); setActive(null);
  };

  const open = (e: JournalEntry) => {
    setActive(e); setIsNew(true);
    setForm({ title: e.title || '', content: e.content, is_shared: !!e.is_shared });
  };

  if (isNew) return (
    <div className="max-w-2xl mx-auto space-y-4">
      <button onClick={() => { setIsNew(false); setActive(null); setForm({ title: '', content: '', is_shared: false }); }}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">
        <ArrowLeft size={16} /> Back to Journal
      </button>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Entry title (optional)"
          className="w-full text-xl font-semibold text-slate-900 border-0 focus:outline-none placeholder-slate-300" />
        <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Write freely — this is your space…"
          className="w-full border-0 focus:outline-none text-slate-700 leading-relaxed resize-none min-h-[300px] text-base" />
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer">
            <input type="checkbox" checked={form.is_shared} onChange={e => setForm(p => ({ ...p, is_shared: e.target.checked }))} className="rounded" />
            {form.is_shared ? <Eye size={14} /> : <EyeOff size={14} />}
            {form.is_shared ? 'Visible to community' : 'Private (only you)'}
          </label>
          <div className="flex gap-2">
            {active && <button onClick={() => del(active.id)} className="p-2 rounded-xl text-red-400 hover:bg-red-50 transition-colors"><Trash2 size={16} /></button>}
            <button onClick={save} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">
              <Save size={14} /> Save Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Journal</h2>
          <p className="text-slate-500 text-sm mt-1">Private reflections, goals, and thoughts. Your space.</p>
        </div>
        <button onClick={() => setIsNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">
          <Plus size={15} /> New Entry
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">📔</p>
          <p>No entries yet. Start writing today!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(e => (
            <button key={e.id} onClick={() => open(e)}
              className="w-full text-left bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{e.title || 'Untitled Entry'}</h3>
                  <p className="text-xs text-slate-400 mt-1">{new Date(e.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">{e.content}</p>
                </div>
                <span className={`shrink-0 p-1.5 rounded-lg ${e.is_shared ? 'bg-indigo-50 text-indigo-400' : 'bg-slate-100 text-slate-400'}`}>
                  {e.is_shared ? <Eye size={14} /> : <EyeOff size={14} />}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
