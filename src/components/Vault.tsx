import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Archive, FileText } from 'lucide-react';
import { useAuth } from '../AuthContext';

const CATEGORIES = ['general', 'identity', 'legal', 'employment', 'housing', 'medical', 'financial', 'education'];

export default function Vault() {
  const { token } = useAuth();
  const [docs, setDocs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'general', notes: '' });

  useEffect(() => {
    fetch('/api/documents', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => Array.isArray(d) && setDocs(d)).catch(() => {});
  }, [token]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch('/api/documents', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ title: form.title, category: form.category, file_name: form.title }) });
    const d = await r.json();
    if (r.ok) { setDocs(p => [{ id: d.id, title: form.title, category: form.category, created_at: new Date().toISOString() }, ...p]); setShowForm(false); setForm({ title: '', category: 'general', notes: '' }); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this document record?')) return;
    await fetch(`/api/documents/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setDocs(p => p.filter(d => d.id !== id));
  };

  const CAT_COLORS: Record<string, string> = { identity: 'bg-blue-500/15 text-blue-300', legal: 'bg-red-500/15 text-red-300', employment: 'bg-accent-soft text-accent-ink', housing: 'bg-green-500/15 text-green-300', medical: 'bg-pink-500/15 text-pink-300', financial: 'bg-amber-500/15 text-amber-300', education: 'bg-purple-500/15 text-purple-300', general: 'bg-surface-2 text-ink-2' };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">The Vault</h2>
          <p className="text-ink-3 text-sm mt-1">Securely track your important documents.</p>
        </div>
        <button onClick={() => setShowForm(p => !p)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-strong transition-colors">
          <Plus size={15} /> Add Document
        </button>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-sm text-amber-300">
        <strong>Important documents to keep track of:</strong> State ID, Social Security Card, Birth Certificate, Parole/Probation paperwork, Employment records, Housing agreements, Court documents.
      </div>

      {showForm && (
        <form onSubmit={add} className="bg-surface rounded-2xl border border-line p-6 space-y-4">
          <h3 className="font-semibold text-ink">Track a Document</h3>
          <input aria-label="Document name (e.g. State ID, Birth Certificate)" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Document name (e.g. State ID, Birth Certificate)"
            className="w-full border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          <select aria-label="Document type" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus capitalize">
            {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
          <div className="flex gap-2">
            <button type="submit" className="px-5 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-strong transition-colors">Add</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl border border-line text-sm hover:bg-surface-3 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {docs.length === 0 ? (
        <div className="text-center py-16 text-ink-3"><Archive size={36} className="mx-auto mb-2 opacity-30" /><p>No documents tracked yet.</p></div>
      ) : (
        <div className="space-y-3">
          {docs.map(d => (
            <div key={d.id} className="bg-surface rounded-2xl border border-line p-5 flex items-center gap-4">
              <FileText size={20} className="text-ink-3 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink">{d.title}</p>
                <p className="text-xs text-ink-3 mt-0.5">Added {new Date(d.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`text-[11px] px-2 py-1 rounded-full font-semibold capitalize shrink-0 ${CAT_COLORS[d.category] || CAT_COLORS.general}`}>{d.category}</span>
              <button onClick={() => del(d.id)} aria-label={`Delete ${d.title}`} className="p-2 rounded-xl text-ink-3 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
