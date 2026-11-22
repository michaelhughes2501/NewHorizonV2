import React, { useState, useEffect, useRef } from 'react';
import { Plus, ArrowLeft, Send, Users, Lock, Globe, EyeOff, Eye } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { AvatarBubble } from './ui/AvatarBubble';
import { usePoll } from '../hooks/usePoll';

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
  // Refresh the open group's messages every 10s, only while this tab is visible.
  useEffect(() => { if (active) fetchMessages(active.id); }, [active]);
  usePoll(() => { if (active) fetchMessages(active.id); }, 10000, !!active);
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
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-surface rounded-2xl border border-line overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-line bg-surface-2">
        <button onClick={() => setActive(null)} className="p-2 rounded-xl hover:bg-surface-3 transition-colors"><ArrowLeft size={16} /></button>
        <div className="flex-1">
          <p className="font-semibold text-ink">{active.name}</p>
          <p className="text-xs text-ink-3">{active.member_count} members · {active.category}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.length === 0 && <p className="text-center text-ink-3 text-sm mt-8">No messages yet. Start the conversation!</p>}
        {messages.map(m => {
          const mine = m.sender_id === user?.id;
          return (
            <div key={m.id} className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
              {!mine && <AvatarBubble name={m.is_anonymous ? '?' : m.sender_name} color={m.is_anonymous ? '#6B7280' : m.avatar_color} size={28} />}
              <div className={`max-w-xs px-4 py-3 rounded-2xl text-sm ${mine ? 'bg-accent text-white rounded-br-sm' : 'bg-surface-2 text-ink rounded-bl-sm'}`}>
                {!mine && <p className="text-[10px] font-semibold mb-1 opacity-60">{m.is_anonymous ? 'Anonymous' : m.sender_name}</p>}
                <p>{m.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMsg} className="px-4 py-3 border-t border-line flex gap-2 items-center">
        <button type="button" onClick={() => setIsAnon(p => !p)}
          className={`p-2 rounded-xl transition-colors ${isAnon ? 'bg-surface-3 text-white' : 'text-ink-3 hover:bg-surface-3'}`}>
          {isAnon ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
        <input aria-label="Message group" value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Message group…"
          className="flex-1 bg-surface-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
        <button type="submit" disabled={!newMsg.trim()} className="p-2.5 rounded-xl bg-accent text-white hover:bg-accent-strong transition-colors disabled:opacity-50">
          <Send size={15} />
        </button>
      </form>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">Groups</h2>
          <p className="text-ink-3 text-sm mt-1">Interest-based communities for connection and support.</p>
        </div>
        <button onClick={() => setShowCreate(p => !p)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-strong transition-colors">
          <Plus size={15} /> New Group
        </button>
      </div>

      {showCreate && (
        <form onSubmit={createGroup} className="bg-surface rounded-2xl border border-line p-6 space-y-4">
          <h3 className="font-semibold text-ink">Create a Group</h3>
          <input aria-label="Group name" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Group name"
            className="w-full border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          <input aria-label="Description (optional)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description (optional)"
            className="w-full border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          <select aria-label="Category" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            className="w-full border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent capitalize">
            {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-ink-2 cursor-pointer">
            <input type="checkbox" checked={form.is_private} onChange={e => setForm(p => ({ ...p, is_private: e.target.checked }))} className="rounded" />
            Private group
          </label>
          <div className="flex gap-2">
            <button type="submit" className="px-5 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-strong transition-colors">Create</button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-5 py-2 rounded-xl border border-line text-sm font-semibold hover:bg-surface-3 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map(g => (
          <div key={g.id} className="bg-surface rounded-2xl border border-line p-5 hover:shadow-md transition-[color,background-color,border-color,box-shadow,opacity,transform]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink">{g.name}</span>
                  {g.is_private ? <Lock size={13} className="text-ink-3" /> : <Globe size={13} className="text-ink-3" />}
                </div>
                <span className="text-[11px] bg-accent-soft text-accent-ink px-2 py-0.5 rounded-full font-medium capitalize mt-1 inline-block">{g.category}</span>
                {g.description && <p className="text-sm text-ink-3 mt-2 line-clamp-2">{g.description}</p>}
                <p className="text-xs text-ink-3 mt-2 flex items-center gap-1"><Users size={11} /> {g.member_count || 0} members</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { join(g.id); setActive(g); }}
                className="flex-1 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-strong transition-colors">
                Join & Chat
              </button>
              <button onClick={() => { setActive(g); fetchMessages(g.id); }}
                className="flex-1 py-2 rounded-xl border border-line text-ink-2 text-xs font-semibold hover:bg-surface-3 transition-colors">
                View Chat
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
