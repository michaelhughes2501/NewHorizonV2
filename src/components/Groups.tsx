import React, { useState, useEffect, useRef } from 'react';
import { Plus, ArrowLeft, Send, Users, Lock, Globe, EyeOff, Eye } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { AvatarBubble } from '../App';

const CATEGORIES = ['general', 'employment', 'mental health', 'sobriety', 'housing', 'family', 'legal', 'education', 'spiritual'];

export default function Groups() {
  const { token, user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [isAnon, setIsAnon] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: 'general', is_private: false });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchGroups(); }, [token]);
  useEffect(() => {
    if (active) { fetchMessages(active.id); const t = setInterval(() => fetchMessages(active.id), 5000); return () => clearInterval(t); }
  }, [active]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchGroups = () =>
    fetch('/api/groups', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => Array.isArray(d) && setGroups(d)).catch(() => {});

  const fetchMessages = (gid: string) =>
    fetch(`/api/groups/${gid}/messages`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => Array.isArray(d) && setMessages(d)).catch(() => {});

  const join = async (gid: string) => {
    await fetch(`/api/groups/${gid}/join`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    fetchGroups();
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/groups', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
    setShowCreate(false); setForm({ name: '', description: '', category: 'general', is_private: false });
    fetchGroups();
  };

  const sendMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !active) return;
    await fetch(`/api/groups/${active.id}/messages`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: newMsg, is_anonymous: isAnon })
    });
    setNewMsg(''); fetchMessages(active.id);
  };

  if (active) return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
        <button onClick={() => setActive(null)} className="p-2 rounded-xl hover:bg-slate-200 transition-colors"><ArrowLeft size={16} /></button>
        <div className="flex-1">
          <p className="font-semibold text-slate-900">{active.name}</p>
          <p className="text-xs text-slate-400">{active.member_count} members · {active.category}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.length === 0 && <p className="text-center text-slate-400 text-sm mt-8">No messages yet. Start the conversation!</p>}
        {messages.map(m => {
          const mine = m.sender_id === user?.id;
          return (
            <div key={m.id} className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
              {!mine && <AvatarBubble name={m.is_anonymous ? '?' : m.sender_name} color={m.is_anonymous ? '#6B7280' : m.avatar_color} size={28} />}
              <div className={`max-w-xs px-4 py-3 rounded-2xl text-sm ${mine ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-900 rounded-bl-sm'}`}>
                {!mine && <p className="text-[10px] font-semibold mb-1 opacity-60">{m.is_anonymous ? 'Anonymous' : m.sender_name}</p>}
                <p>{m.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMsg} className="px-4 py-3 border-t border-slate-100 flex gap-2 items-center">
        <button type="button" onClick={() => setIsAnon(p => !p)}
          className={`p-2 rounded-xl transition-colors ${isAnon ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-100'}`}>
          {isAnon ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
        <input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Message group…"
          className="flex-1 bg-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <button type="submit" disabled={!newMsg.trim()} className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50">
          <Send size={15} />
        </button>
      </form>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Groups</h2>
          <p className="text-slate-500 text-sm mt-1">Interest-based communities for connection and support.</p>
        </div>
        <button onClick={() => setShowCreate(p => !p)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">
          <Plus size={15} /> New Group
        </button>
      </div>

      {showCreate && (
        <form onSubmit={createGroup} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h3 className="font-semibold text-slate-900">Create a Group</h3>
          <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Group name"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description (optional)"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize">
            {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" checked={form.is_private} onChange={e => setForm(p => ({ ...p, is_private: e.target.checked }))} className="rounded" />
            Private group
          </label>
          <div className="flex gap-2">
            <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">Create</button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-5 py-2 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map(g => (
          <div key={g.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{g.name}</span>
                  {g.is_private ? <Lock size={13} className="text-slate-400" /> : <Globe size={13} className="text-slate-400" />}
                </div>
                <span className="text-[11px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium capitalize mt-1 inline-block">{g.category}</span>
                {g.description && <p className="text-sm text-slate-500 mt-2 line-clamp-2">{g.description}</p>}
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1"><Users size={11} /> {g.member_count || 0} members</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { join(g.id); setActive(g); }}
                className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors">
                Join & Chat
              </button>
              <button onClick={() => { setActive(g); fetchMessages(g.id); }}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors">
                View Chat
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
