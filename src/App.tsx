import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  Users, Send, ShieldCheck, Scale, LogOut, Menu, X, MessageSquare,
  Bell, Archive, UserCircle, Briefcase, FileText, ShieldAlert, HelpCircle,
  Heart, BookOpen, Star, TrendingUp, Globe, PhoneCall,
} from 'lucide-react';
import { AuthProvider, useAuth } from './AuthContext';
import Auth from './components/Auth';
import { AppNotification } from './types';

// Components
import TheYard from './components/TheYard';
import Kites from './components/Kites';
import Resources from './components/Resources';
import Tools from './components/Tools';
import Forum from './components/Forum';
import MentorshipTab from './components/Mentorship';
import Vault from './components/Vault';
import Profile from './components/Profile';
import Opportunities from './components/Opportunities';
import AdminDashboard from './components/AdminDashboard';
import HelpCenter from './components/HelpCenter';
import CaseTracker from './components/CaseTracker';
import Groups from './components/Groups';
import CheckIns from './components/CheckIns';
import Journal from './components/Journal';
import SuccessStories from './components/SuccessStories';
import Dashboard from './components/Dashboard';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = 'dashboard' | 'yard' | 'kites' | 'groups' | 'forum' | 'mentorship' | 'opportunities' |
  'resources' | 'tools' | 'cases' | 'vault' | 'checkins' | 'journal' | 'stories' |
  'profile' | 'admin' | 'help';

const NAV_SECTIONS = [
  {
    label: 'Community',
    items: [
      { id: 'dashboard', name: 'Dashboard', icon: TrendingUp },
      { id: 'yard', name: 'The Yard', icon: Users },
      { id: 'kites', name: 'Kites (DMs)', icon: Send },
      { id: 'groups', name: 'Groups', icon: Globe },
      { id: 'forum', name: 'Forum', icon: MessageSquare },
      { id: 'stories', name: 'Success Stories', icon: Star },
      { id: 'mentorship', name: 'Mentorship', icon: ShieldCheck },
    ],
  },
  {
    label: 'Wellness',
    items: [
      { id: 'checkins', name: 'Check-Ins', icon: Heart },
      { id: 'journal', name: 'Journal', icon: BookOpen },
      { id: 'resources', name: 'Crisis Resources', icon: PhoneCall },
    ],
  },
  {
    label: 'Career',
    items: [
      { id: 'opportunities', name: 'Jobs & Housing', icon: Briefcase },
      { id: 'tools', name: 'Career Tools', icon: FileText },
      { id: 'cases', name: 'Case Tracker', icon: Scale },
    ],
  },
  {
    label: 'My Space',
    items: [
      { id: 'vault', name: 'The Vault', icon: Archive },
      { id: 'profile', name: 'Profile', icon: UserCircle },
      { id: 'help', name: 'Help', icon: HelpCircle },
    ],
  },
];

function AvatarBubble({ name, color, size = 32 }: { name: string; color?: string; size?: number }) {
  const bg = color || '#4F46E5';
  return (
    <div
      style={{ width: size, height: size, background: bg, flexShrink: 0 }}
      className="rounded-full flex items-center justify-center text-white font-bold text-xs select-none"
    >
      {name?.charAt(0).toUpperCase() || '?'}
    </div>
  );
}

export { AvatarBubble };

function MainApp() {
  const { user, token, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!user || !token) return;
    const fetch_ = () =>
      fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => Array.isArray(d) && setNotifications(d))
        .catch(() => {});
    fetch_();
    const t = setInterval(fetch_, 20000);
    return () => clearInterval(t);
  }, [user, token]);

  const handleNotifClick = async (n: AppNotification) => {
    if (!n.is_read) {
      await fetch(`/api/notifications/${n.id}/read`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
      setNotifications(p => p.map(x => x.id === n.id ? { ...x, is_read: 1 } : x));
    }
    if (n.link) setActiveTab(n.link as Tab);
    setShowNotifications(false);
  };

  const markAll = async () => {
    await fetch('/api/notifications/read-all', {
      method: 'PUT', headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
    setNotifications(p => p.map(x => ({ ...x, is_read: 1 })));
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-white/60 font-medium tracking-widest text-sm uppercase">Loading New Horizon…</p>
      </div>
    </div>
  );

  if (!user) return <Auth />;

  const isAdmin = ['super_admin', 'admin', 'moderator'].includes(user?.role || (user?.is_admin === 1 ? 'super_admin' : 'user'));
  const unread = notifications.filter(n => !n.is_read).length;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={setActiveTab} />;
      case 'yard': return <TheYard />;
      case 'kites': return <Kites />;
      case 'groups': return <Groups />;
      case 'forum': return <Forum />;
      case 'stories': return <SuccessStories />;
      case 'mentorship': return <MentorshipTab />;
      case 'checkins': return <CheckIns />;
      case 'journal': return <Journal />;
      case 'resources': return <Resources />;
      case 'opportunities': return <Opportunities />;
      case 'tools': return <Tools />;
      case 'cases': return <CaseTracker />;
      case 'vault': return <Vault />;
      case 'profile': return <Profile />;
      case 'admin': return <AdminDashboard />;
      case 'help': return <HelpCenter />;
      default: return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* ─── Sidebar ─────────────────────────────────────── */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-indigo-950 via-indigo-900 to-purple-950 text-white flex flex-col transition-transform duration-300",
        isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center font-black text-lg">N</div>
            <span className="font-bold text-lg tracking-tight">New Horizon</span>
          </div>
          <button className="md:hidden opacity-60 hover:opacity-100" onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        {/* User mini-card */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
          <AvatarBubble name={user.username || 'U'} color={user.avatar_color} size={36} />
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{user.username}</p>
            <p className="text-xs text-white/50 capitalize">{user.recovery_stage || 'member'}</p>
          </div>
          {user.is_verified === 1 && <ShieldCheck size={14} className="text-indigo-300 shrink-0" />}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-none">
          {NAV_SECTIONS.map(section => (
            <div key={section.label}>
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/30 font-bold px-3 mb-1">{section.label}</p>
              {section.items.map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id as Tab); setIsMenuOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      active
                        ? "bg-white/15 text-white shadow-inner"
                        : "text-white/60 hover:text-white hover:bg-white/8"
                    )}
                  >
                    <Icon size={16} className={active ? "text-indigo-300" : ""} />
                    {item.name}
                  </button>
                );
              })}
            </div>
          ))}
          {isAdmin && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/30 font-bold px-3 mb-1">Admin</p>
              <button
                onClick={() => { setActiveTab('admin'); setIsMenuOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  activeTab === 'admin' ? "bg-red-500/20 text-red-300" : "text-red-400/70 hover:text-red-300 hover:bg-red-500/10"
                )}
              >
                <ShieldAlert size={16} /> Admin Panel
              </button>
            </div>
          )}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            aria-label="Sign out"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all text-sm"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {isMenuOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsMenuOpen(false)} />}

      {/* ─── Main Content ─────────────────────────────────── */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between">
          <button className="md:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div className="hidden md:block text-sm font-semibold text-slate-500 capitalize">
            {NAV_SECTIONS.flatMap(s => s.items).find(i => i.id === activeTab)?.name || 'Dashboard'}
          </div>
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(p => !p)}
                className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50"
                  >
                    <div className="flex items-center justify-between p-4 border-b border-slate-100">
                      <span className="font-semibold text-sm">Notifications</span>
                      <button onClick={markAll} className="text-xs text-indigo-600 hover:underline">Mark all read</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0
                        ? <p className="p-4 text-sm text-center text-slate-400">No notifications yet</p>
                        : notifications.map(n => (
                          <button
                            key={n.id}
                            onClick={() => handleNotifClick(n)}
                            className={cn("w-full text-left p-3 hover:bg-slate-50 transition-colors text-sm flex gap-3 items-start", !n.is_read && "bg-indigo-50")}
                          >
                            {!n.is_read && <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />}
                            <div>
                              <p className="text-slate-800">{n.content}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{new Date(n.timestamp).toLocaleDateString()}</p>
                            </div>
                          </button>
                        ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => setActiveTab('profile')} className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors" aria-label="View profile">
              <AvatarBubble name={user.username} color={user.avatar_color} size={30} />
            </button>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
