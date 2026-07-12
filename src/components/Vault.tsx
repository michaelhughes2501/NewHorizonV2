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

  const CAT_COLORS: Record<string, string> = { identity: 'bg-blue-100 text-blue-700', legal: 'bg-red-100 text-red-700', employment: 'bg-indigo-100 text-indigo-700', housing: 'bg-green-100 text-green-700', medical: 'bg-pink-100 text-pink-700', financial: 'bg-amber-100 text-amber-700', education: 'bg-purple-100 text-purple-700', general: 'bg-slate-100 text-slate-600' };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">The Vault</h2>
          <p className="text-slate-500 text-sm mt-1">Securely track your important documents.</p>
        </div>
        <button onClick={() => setShowForm(p => !p)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">
          <Plus size={15} /> Add Document
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
        <strong>Important documents to keep track of:</strong> State ID, Social Security Card, Birth Certificate, Parole/Probation paperwork, Employment records, Housing agreements, Court documents.
      </div>

      {showForm && (
        <form onSubmit={add} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h3 className="font-semibold text-slate-900">Track a Document</h3>
          <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Document name (e.g. State ID, Birth Certificate)"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none capitalize">
            {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
          <div className="flex gap-2">
            <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">Add</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl border border-slate-200 text-sm hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {docs.length === 0 ? (
        <div className="text-center py-16 text-slate-400"><Archive size={36} className="mx-auto mb-2 opacity-30" /><p>No documents tracked yet.</p></div>
      ) : (
        <div className="space-y-3">
          {docs.map(d => (
            <div key={d.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
              <FileText size={20} className="text-slate-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900">{d.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">Added {new Date(d.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`text-[11px] px-2 py-1 rounded-full font-semibold capitalize shrink-0 ${CAT_COLORS[d.category] || CAT_COLORS.general}`}>{d.category}</span>
              <button onClick={() => del(d.id)} className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
