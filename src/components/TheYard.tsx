import React, { useState, useEffect } from 'react';
import { Search, Send, UserPlus, ShieldCheck, Flag, Ban } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../AuthContext';
import { AvatarBubble } from '../App';

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
        <h2 className="text-2xl font-bold text-slate-900">The Yard</h2>
        <p className="text-slate-500 text-sm mt-1">Connect with people on the same journey.</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, facility, location…"
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <UserPlus size={40} className="mx-auto mb-3 opacity-30" />
          <p>No members found. {search ? 'Try a different search.' : 'Be the first!'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((u, i) => (
            <motion.div key={u.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <AvatarBubble name={u.name} color={u.avatar_color} size={44} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900">{u.name}</span>
                    {u.is_verified === 1 && <span title="Verified Member"><ShieldCheck size={14} className="text-indigo-500" /></span>}
                    {u.is_mentor === 1 && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Mentor</span>}
                    {u.role === 'super_admin' || u.is_admin === 1 ? <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">Admin</span> : null}
                  </div>
                  {u.history && u.history !== 'Hidden' && <p className="text-xs text-slate-400 mt-0.5">Previously at: {u.history}</p>}
                  {u.location && u.location !== 'Hidden' && <p className="text-xs text-slate-400">{u.location}</p>}
                  {u.bio && <p className="text-sm text-slate-600 mt-2 line-clamp-2">{u.bio}</p>}
                  {u.recovery_stage && (
                    <span className="inline-block mt-2 text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium capitalize">{u.recovery_stage} stage</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => sendKite(u.id, u.name)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors">
                  <Send size={13} /> Send Kite
                </button>
                <button onClick={() => blockUser(u.id)}
                  title="Block user"
                  className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-300 transition-colors">
                  <Ban size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
