import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, Flag, CheckCircle, XCircle, ShieldCheck, Trash2 } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { AvatarBubble } from './ui/AvatarBubble';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [tab, setTab] = useState<'users' | 'reports'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => Array.isArray(d) && setUsers(d)).catch(() => {});
    fetch('/api/admin/reports', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => Array.isArray(d) && setReports(d)).catch(() => {});
  }, [token]);

  const toggleSuspend = async (u: any) => {
    const action = u.is_suspended ? 'unsuspend' : 'suspend';
    if (!confirm(`${action} ${u.username}?`)) return;
    await fetch(`/api/admin/users/${u.id}/${action}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
    setUsers(p => p.map(x => x.id === u.id ? { ...x, is_suspended: u.is_suspended ? 0 : 1 } : x));
  };

  const verify = async (id: string) => {
    await fetch(`/api/admin/users/${id}/verify`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
    setUsers(p => p.map(u => u.id === id ? { ...u, is_verified: 1 } : u));
  };

  const changeRole = async (id: string, role: string) => {
    await fetch(`/api/admin/users/${id}/role`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ role }) });
    setUsers(p => p.map(u => u.id === id ? { ...u, role } : u));
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Permanently delete this user? This cannot be undone.')) return;
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setUsers(p => p.filter(u => u.id !== id));
  };

  const resolveReport = async (id: string) => {
    await fetch(`/api/admin/reports/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: 'resolved' }) });
    setReports(p => p.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
  };

  const pending = reports.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldAlert size={28} className="text-red-400" />
        <div>
          <h2 className="text-2xl font-bold text-ink">Admin Panel</h2>
          <p className="text-ink-3 text-sm">Manage users, verify members, and handle reports.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface rounded-2xl border border-line p-5 text-center">
          <p className="text-3xl font-bold text-ink">{users.length}</p>
          <p className="text-xs text-ink-3 mt-1">Total Members</p>
        </div>
        <div className="bg-surface rounded-2xl border border-line p-5 text-center">
          <p className="text-3xl font-bold text-amber-400">{pending.length}</p>
          <p className="text-xs text-ink-3 mt-1">Pending Reports</p>
        </div>
        <div className="bg-surface rounded-2xl border border-line p-5 text-center">
          <p className="text-3xl font-bold text-red-400">{users.filter(u => u.is_suspended).length}</p>
          <p className="text-xs text-ink-3 mt-1">Suspended</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-2 p-1 rounded-xl w-fit">
        <button onClick={() => setTab('users')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-[color,background-color,border-color,box-shadow,opacity,transform] ${tab === 'users' ? 'bg-surface text-ink shadow' : 'text-ink-3'}`}>Users</button>
        <button onClick={() => setTab('reports')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-[color,background-color,border-color,box-shadow,opacity,transform] flex items-center gap-2 ${tab === 'reports' ? 'bg-surface text-ink shadow' : 'text-ink-3'}`}>
          Reports {pending.length > 0 && <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{pending.length}</span>}
        </button>
      </div>

      {tab === 'users' && (
        <div className="bg-surface rounded-2xl border border-line overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 border-b border-line">
                <tr>
                  {['Member', 'Role', 'Status', 'Verified', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-ink-3 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.map(u => (
                  <tr key={u.id} className={u.is_suspended ? 'bg-red-500/10' : 'hover:bg-surface-3'}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <AvatarBubble name={u.username} size={28} />
                        <div>
                          <p className="font-medium text-ink">{u.username}</p>
                          <p className="text-xs text-ink-3">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select aria-label={`Role for ${u.username}`} value={u.role || 'user'} onChange={e => changeRole(u.id, e.target.value)}
                        className="text-xs border border-line rounded-lg px-2 py-1 capitalize focus:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                        {['user', 'moderator', 'admin'].map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] px-2 py-1 rounded-full font-semibold ${u.is_suspended ? 'bg-red-500/15 text-red-300' : 'bg-green-500/15 text-green-300'}`}>
                        {u.is_suspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.is_verified ? <ShieldCheck size={16} className="text-accent-ink" /> : (
                        <button onClick={() => verify(u.id)} className="text-xs text-accent-ink hover:underline">Verify</button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-3">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => toggleSuspend(u)} title={u.is_suspended ? 'Unsuspend' : 'Suspend'}
                          aria-label={`${u.is_suspended ? 'Unsuspend' : 'Suspend'} ${u.username}`}
                          className={`p-1.5 rounded-lg transition-colors ${u.is_suspended ? 'bg-green-500/15 text-green-300 hover:bg-green-500/25' : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'}`}>
                          {u.is_suspended ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        </button>
                        <button onClick={() => deleteUser(u.id)} aria-label={`Delete ${u.username}`} className="p-1.5 rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/25 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'reports' && (
        <div className="space-y-3">
          {reports.length === 0 ? <div className="text-center py-12 text-ink-3"><Flag size={32} className="mx-auto mb-2 opacity-30" /><p>No reports yet.</p></div>
            : reports.map(r => (
              <div key={r.id} className={`bg-surface rounded-2xl border p-5 flex items-start justify-between gap-4 ${r.status === 'pending' ? 'border-amber-500/30' : 'border-line opacity-60'}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <Flag size={14} className={r.status === 'pending' ? 'text-amber-400' : 'text-ink-3'} />
                    <span className="font-medium text-ink capitalize">{r.target_type} reported</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${r.status === 'pending' ? 'bg-amber-500/15 text-amber-300' : 'bg-surface-2 text-ink-2'}`}>{r.status}</span>
                  </div>
                  <p className="text-sm text-ink-3 mt-1">By: {r.reporter_name} · {new Date(r.created_at).toLocaleDateString()}</p>
                  {r.reason && <p className="text-sm text-ink-2 mt-2">{r.reason}</p>}
                </div>
                {r.status === 'pending' && (
                  <button onClick={() => resolveReport(r.id)} className="px-4 py-2 rounded-xl bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors shrink-0">
                    Resolve
                  </button>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
