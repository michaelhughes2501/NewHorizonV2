import React, { useState, useEffect } from 'react';
import { Search, Send, UserPlus, ShieldCheck, Flag, Ban } from 'lucide-react';
import * as m from 'motion/react-m';
import { useAuth } from '../AuthContext';
import { AvatarBubble } from './ui/AvatarBubble';

export default function TheYard() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setUsers(d); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const sendKite = async (receiverId: string, name: string) => {
    const content = prompt(`Send a message to ${name}:`);
    if (!content?.trim()) return;
    const r = await fetch('/api/kites', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ receiverId, content })
    });
    if (r.ok) alert('Kite sent!'); else alert('Failed to send.');
  };

  const blockUser = async (id: string) => {
    if (!confirm('Block this user?')) return;
    await fetch(`/api/block/${id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    setUsers(p => p.filter(u => u.id !== id));
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !q || u.name?.toLowerCase().includes(q) || u.bio?.toLowerCase().includes(q) || u.history?.toLowerCase().includes(q) || u.location?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">The Yard</h2>
        <p className="text-ink-3 text-sm mt-1">Connect with people on the same journey.</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-3" />
        <input aria-label="Search by name, facility, location" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, facility, location…"
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-line bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent shadow-sm" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-surface-2 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-ink-3">
          <UserPlus size={40} className="mx-auto mb-3 opacity-30" />
          <p>No members found. {search ? 'Try a different search.' : 'Be the first!'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((u, i) => (
            <m.div key={u.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-surface rounded-2xl border border-line p-5 hover:shadow-md transition-[color,background-color,border-color,box-shadow,opacity,transform]">
              <div className="flex items-start gap-4">
                <AvatarBubble name={u.name} color={u.avatar_color} size={44} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-ink">{u.name}</span>
                    {u.is_verified === 1 && <span title="Verified Member"><ShieldCheck size={14} className="text-accent-ink" /></span>}
                    {u.is_mentor === 1 && <span className="text-[10px] bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-full font-semibold">Mentor</span>}
                    {u.role === 'super_admin' || u.is_admin === 1 ? <span className="text-[10px] bg-red-500/15 text-red-300 px-2 py-0.5 rounded-full font-semibold">Admin</span> : null}
                  </div>
                  {u.history && u.history !== 'Hidden' && <p className="text-xs text-ink-3 mt-0.5">Previously at: {u.history}</p>}
                  {u.location && u.location !== 'Hidden' && <p className="text-xs text-ink-3">{u.location}</p>}
                  {u.bio && <p className="text-sm text-ink-2 mt-2 line-clamp-2">{u.bio}</p>}
                  {u.recovery_stage && (
                    <span className="inline-block mt-2 text-[10px] bg-accent-soft text-accent-ink px-2 py-0.5 rounded-full font-medium capitalize">{u.recovery_stage} stage</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => sendKite(u.id, u.name)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-strong transition-colors">
                  <Send size={13} /> Send Kite
                </button>
                <button onClick={() => blockUser(u.id)}
                  title="Block user"
                  aria-label={`Block ${u.name}`}
                  className="p-2 rounded-xl border border-line text-ink-3 hover:text-red-400 hover:border-red-500/30 transition-colors">
                  <Ban size={14} />
                </button>
              </div>
            </m.div>
          ))}
        </div>
      )}
    </div>
  );
}
