import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Scale } from 'lucide-react';
import { useAuth } from '../AuthContext';

const STATUSES = ['active', 'pending', 'closed', 'appealing'];

export default function CaseTracker() {
  const { token } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ case_number: '', court: '', status: 'active', next_hearing_date: '', notes: '' });

  useEffect(() => {
    fetch('/api/legal-cases', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => Array.isArray(d) && setCases(d)).catch(() => {});
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await fetch(`/api/legal-cases/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
      setCases(p => p.map(c => c.id === editing.id ? { ...c, ...form } : c));
    } else {
      const r = await fetch('/api/legal-cases', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
      const d = await r.json();
      if (r.ok) setCases(p => [{ ...form, id: d.id, created_at: new Date().toISOString() }, ...p]);
    }
    setShowForm(false); setEditing(null); setForm({ case_number: '', court: '', status: 'active', next_hearing_date: '', notes: '' });
  };

  const del = async (id: string) => {
    if (!confirm('Delete this case?')) return;
    await fetch(`/api/legal-cases/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setCases(p => p.filter(c => c.id !== id));
  };

  const edit = (c: any) => { setEditing(c); setForm({ case_number: c.case_number || '', court: c.court || '', status: c.status, next_hearing_date: c.next_hearing_date || '', notes: c.notes || '' }); setShowForm(true); };

  const STATUS_COLORS: Record<string, string> = { active: 'bg-blue-500/15 text-blue-300', pending: 'bg-amber-500/15 text-amber-300', closed: 'bg-surface-2 text-ink-2', appealing: 'bg-purple-500/15 text-purple-300' };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">Case Tracker</h2>
          <p className="text-ink-3 text-sm mt-1">Track your legal cases and upcoming hearing dates.</p>
        </div>
        <button onClick={() => { setShowForm(p => !p); setEditing(null); setForm({ case_number: '', court: '', status: 'active', next_hearing_date: '', notes: '' }); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-strong transition-colors">
          <Plus size={15} /> Add Case
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-surface rounded-2xl border border-line p-6 space-y-4">
          <h3 className="font-semibold text-ink">{editing ? 'Edit Case' : 'Add a Legal Case'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <input aria-label="Case number" value={form.case_number} onChange={e => setForm(p => ({ ...p, case_number: e.target.value }))} placeholder="Case number" className="border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
            <input aria-label="Court name" value={form.court} onChange={e => setForm(p => ({ ...p, court: e.target.value }))} placeholder="Court name" className="border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
            <select aria-label="Case status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus capitalize">
              {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
            <input aria-label="Next hearing date" type="date" value={form.next_hearing_date} onChange={e => setForm(p => ({ ...p, next_hearing_date: e.target.value }))} className="border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <textarea aria-label="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notes" className="w-full border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus resize-none h-20" />
          <div className="flex gap-2">
            <button type="submit" className="px-5 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-strong transition-colors">{editing ? 'Update' : 'Add Case'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-5 py-2 rounded-xl border border-line text-sm hover:bg-surface-3 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {cases.length === 0 ? (
        <div className="text-center py-16 text-ink-3"><Scale size={36} className="mx-auto mb-2 opacity-30" /><p>No cases tracked yet.</p></div>
      ) : (
        <div className="space-y-3">
          {cases.map(c => (
            <div key={c.id} className="bg-surface rounded-2xl border border-line p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    {c.case_number && <span className="font-mono text-sm font-semibold text-ink">#{c.case_number}</span>}
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold capitalize ${STATUS_COLORS[c.status] || 'bg-surface-2 text-ink-2'}`}>{c.status}</span>
                  </div>
                  {c.court && <p className="text-sm text-ink-3 mt-1">📍 {c.court}</p>}
                  {c.next_hearing_date && (
                    <p className={`text-sm font-medium mt-1 ${new Date(c.next_hearing_date) < new Date() ? 'text-red-400' : 'text-accent-ink'}`}>
                      📅 Next hearing: {new Date(c.next_hearing_date).toLocaleDateString()}
                    </p>
                  )}
                  {c.notes && <p className="text-sm text-ink-2 mt-2">{c.notes}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => edit(c)} className="p-2 rounded-xl text-ink-3 hover:text-accent-ink hover:bg-accent-soft transition-colors"><Edit size={14} /></button>
                  <button onClick={() => del(c.id)} className="p-2 rounded-xl text-ink-3 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
