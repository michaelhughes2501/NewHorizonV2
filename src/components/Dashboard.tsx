import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Heart, BookOpen, Briefcase, MessageSquare, Star, TrendingUp, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { Achievement } from '../types';
import { AvatarBubble } from '../App';

const BADGE_ICONS: Record<string, string> = {
  welcome: '🎉', first_post: '✍️', journaler: '📔', job_seeker: '💼',
  checkin_7: '🔥', checkin_30: '⭐', mentored: '🤝', mentor: '🎓',
  community: '🌐', vault_user: '📁', success_story: '🏆', default: '🥇',
};

export default function Dashboard({ onNavigate }: { onNavigate: (tab: any) => void }) {
  const { user, token } = useAuth();
  const [progress, setProgress] = useState<any>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch('/api/progress', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(setProgress).catch(() => {});
    fetch('/api/achievements', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => Array.isArray(d) && setAchievements(d)).catch(() => {});
    fetch('/api/peer-matches', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => Array.isArray(d) && setMatches(d.slice(0, 3))).catch(() => {});
  }, [token]);

  const stats = [
    { label: 'Check-ins', value: progress?.checkins ?? '—', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50', tab: 'checkins' },
    { label: 'Journal Entries', value: progress?.journal_entries ?? '—', icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-50', tab: 'journal' },
    { label: 'Applications', value: progress?.job_applications ?? '—', icon: Briefcase, color: 'text-indigo-500', bg: 'bg-indigo-50', tab: 'opportunities' },
    { label: 'Forum Posts', value: progress?.forum_posts ?? '—', icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-50', tab: 'forum' },
  ];

  const quickActions = [
    { label: 'Daily Check-In', icon: Heart, tab: 'checkins', color: 'from-rose-500 to-pink-600' },
    { label: 'Write in Journal', icon: BookOpen, tab: 'journal', color: 'from-amber-500 to-orange-600' },
    { label: 'Browse Jobs', icon: Briefcase, tab: 'opportunities', color: 'from-indigo-500 to-blue-600' },
    { label: 'Visit the Yard', icon: Users, tab: 'yard', color: 'from-emerald-500 to-teal-600' },
    { label: 'Read Stories', icon: Star, tab: 'stories', color: 'from-purple-500 to-violet-600' },
    { label: 'Find a Mentor', icon: ShieldCheck, tab: 'mentorship', color: 'from-sky-500 to-cyan-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <AvatarBubble name={user?.username || 'U'} color={user?.avatar_color} size={56} />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.username}! 👋</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {user?.is_verified ? <span className="inline-flex items-center gap-1 text-indigo-600"><ShieldCheck size={13} /> Verified Member · </span> : null}
            {user?.recovery_stage ? `${user.recovery_stage.charAt(0).toUpperCase() + user.recovery_stage.slice(1)} stage of recovery` : 'Member'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.button
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onNavigate(s.tab)}
              className={`${s.bg} rounded-2xl p-5 text-left hover:shadow-md transition-all group`}
            >
              <Icon size={20} className={`${s.color} mb-3`} />
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </motion.button>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-indigo-500" /> Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(a => {
              const Icon = a.icon;
              return (
                <button key={a.label} onClick={() => onNavigate(a.tab)}
                  className={`bg-gradient-to-br ${a.color} text-white rounded-xl p-4 text-left hover:opacity-90 transition-all`}>
                  <Icon size={18} className="mb-2" />
                  <p className="text-xs font-semibold leading-tight">{a.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Peer Matches */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Users size={18} className="text-indigo-500" /> Suggested Connections</h2>
          {matches.length === 0
            ? <p className="text-slate-400 text-sm">No matches yet. Complete your profile to get matched!</p>
            : matches.map(m => (
              <div key={m.id} className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
                <AvatarBubble name={m.name} color={m.avatar_color} size={38} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900 truncate">{m.name}</p>
                  <p className="text-xs text-slate-400 truncate">{m.bio || 'No bio yet'}</p>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">{m.score}%</span>
              </div>
            ))}
          <button onClick={() => onNavigate('yard')} className="mt-3 text-indigo-600 text-sm font-medium hover:underline">View all →</button>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Trophy size={18} className="text-amber-500" /> Your Achievements</h2>
        {achievements.length === 0
          ? <p className="text-slate-400 text-sm">Complete actions to earn badges! Try your first check-in or journal entry.</p>
          : <div className="flex flex-wrap gap-3">
            {achievements.map(a => (
              <div key={a.id} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-2">
                <span>{BADGE_ICONS[a.badge] || BADGE_ICONS.default}</span>
                <span className="text-xs font-semibold text-amber-800">{a.label}</span>
              </div>
            ))}
          </div>}
      </div>
    </div>
  );
}
