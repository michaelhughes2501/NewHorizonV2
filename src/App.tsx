import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Navigate, NavLink, Route, Routes, useLocation, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, MotionConfig, LazyMotion, domAnimation } from 'motion/react';
import * as m from 'motion/react-m';
import {
  Users, Send, ShieldCheck, Scale, LogOut, Menu, X, MessageSquare,
  Bell, Archive, UserCircle, Briefcase, FileText, ShieldAlert, HelpCircle,
  Heart, BookOpen, Star, TrendingUp, Globe, PhoneCall,
} from 'lucide-react';
import { AuthProvider, useAuth } from './AuthContext';
import { AppNotification } from './types';
import { cn } from './lib/cn';
import { usePoll } from './hooks/usePoll';
import { useMediaQuery } from './hooks/useMediaQuery';
import { ROUTES, pathFor, type Tab } from './routes';
import { AvatarBubble } from './components/ui/AvatarBubble';
import { BrandMark } from './components/ui/BrandMark';
import Auth from './components/Auth';
import Landing from './components/Landing';
import Resources from './components/Resources';

// Kept for any older import of these helpers from App.
export { cn } from './lib/cn';
export { AvatarBubble } from './components/ui/AvatarBubble';

// Each screen loads on demand, so the first visit downloads only what it shows.
const Dashboard = lazy(() => import('./components/Dashboard'));
const TheYard = lazy(() => import('./components/TheYard'));
const Kites = lazy(() => import('./components/Kites'));
const Groups = lazy(() => import('./components/Groups'));
const Forum = lazy(() => import('./components/Forum'));
const SuccessStories = lazy(() => import('./components/SuccessStories'));
const MentorshipTab = lazy(() => import('./components/Mentorship'));
const CheckIns = lazy(() => import('./components/CheckIns'));
const Journal = lazy(() => import('./components/Journal'));
const Opportunities = lazy(() => import('./components/Opportunities'));
const Tools = lazy(() => import('./components/Tools'));
const CaseTracker = lazy(() => import('./components/CaseTracker'));
const Vault = lazy(() => import('./components/Vault'));
const Profile = lazy(() => import('./components/Profile'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const HelpCenter = lazy(() => import('./components/HelpCenter'));

const NAV_SECTIONS: { label: string; items: { id: Tab; name: string; icon: React.ComponentType<any> }[] }[] = [
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

const ALL_ITEMS = NAV_SECTIONS.flatMap(s => s.items);

const navItemClass = ({ isActive }: { isActive: boolean }) => cn(
  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
  isActive ? 'bg-white/10 text-ink shadow-inner' : 'text-ink-2 hover:bg-white/5 hover:text-ink',
);

function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="space-y-4">
      <div className="h-8 w-1/3 animate-pulse rounded-lg bg-surface-2" />
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map(i => <div key={i} className="h-28 animate-pulse rounded-2xl bg-surface-2" />)}
      </div>
    </div>
  );
}

function FullScreenLoader() {
  return (
    <div role="status" aria-label="Loading New Horizon" className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse"><BrandMark size={56} /></div>
        <p className="text-sm font-medium uppercase tracking-widest text-ink-3">Loading New Horizon…</p>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="text-5xl font-bold dawn-text">404</p>
      <h1 className="mt-4 text-xl font-semibold text-ink">This page doesn't exist</h1>
      <p className="mt-2 text-sm text-ink-2">The link may be old, or the page has moved.</p>
      <Link to="/" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-accent px-5 text-sm font-semibold text-white hover:bg-accent-strong">
        Go home
      </Link>
    </div>
  );
}

/** Public crisis page: reachable with no account, from the landing and sign-in screens. */
function PublicHelp() {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <Link to="/" className="flex items-center gap-3 rounded-xl">
          <BrandMark size={32} />
          <span className="font-bold tracking-tight text-ink">New Horizon</span>
        </Link>
        <Link to="/register" className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-canvas">Join free</Link>
      </header>
      <main id="main" className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <Resources />
      </main>
    </div>
  );
}

function AppShell() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const fetchNotifications = useCallback(() => {
    if (!token) return;
    fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => Array.isArray(d) && setNotifications(d))
      .catch(() => {});
  }, [token]);
  usePoll(fetchNotifications, 30000, !!token);

  // Close the drawer and popover on navigation.
  useEffect(() => { setIsMenuOpen(false); setShowNotifications(false); }, [location.pathname]);

  // Escape closes whatever is open; a click outside closes the popover.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isMenuOpen) { setIsMenuOpen(false); menuButtonRef.current?.focus(); }
      setShowNotifications(false);
    };
    const onClick = (e: MouseEvent) => {
      if (showNotifications && notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick); };
  }, [isMenuOpen, showNotifications]);

  const handleNotifClick = async (n: AppNotification) => {
    if (!n.is_read) {
      await fetch(`/api/notifications/${n.id}/read`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
      setNotifications(p => p.map(x => x.id === n.id ? { ...x, is_read: 1 } : x));
    }
    if (n.link) navigate(pathFor(n.link));
    setShowNotifications(false);
  };

  const markAll = async () => {
    await fetch('/api/notifications/read-all', {
      method: 'PUT', headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
    setNotifications(p => p.map(x => ({ ...x, is_read: 1 })));
  };

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  const isAdmin = ['super_admin', 'admin', 'moderator'].includes(user?.role || (user?.is_admin === 1 ? 'super_admin' : 'user'));
  const unread = notifications.filter(n => !n.is_read).length;
  const currentName = ALL_ITEMS.find(i => ROUTES[i.id] === location.pathname)?.name
    ?? (location.pathname === ROUTES.admin ? 'Admin Panel' : '');
  const goTo = (tab: Tab | string) => navigate(pathFor(tab));

  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2">
        Skip to content
      </a>

      {/* ─── Sidebar ─────────────────────────────────────── */}
      <aside
        id="app-sidebar"
        aria-label="Sections"
        inert={!isDesktop && !isMenuOpen ? true : undefined}
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-surface text-ink transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)]',
          isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <Link to={ROUTES.dashboard} className="flex items-center gap-3 rounded-xl">
            <BrandMark size={36} />
            <span className="text-lg font-bold tracking-tight">New Horizon</span>
          </Link>
          <button className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-2 hover:text-ink md:hidden" onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <AvatarBubble name={user.username || 'U'} color={user.avatar_color} size={36} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.username}</p>
            <p className="text-xs capitalize text-ink-3">{user.recovery_stage ? `${user.recovery_stage} stage` : 'Member'}</p>
          </div>
          {user.is_verified === 1 && <ShieldCheck size={14} className="shrink-0 text-accent-ink" aria-label="Verified member" />}
        </div>

        <nav aria-label="Main" className="scrollbar-none flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {NAV_SECTIONS.map(section => (
            <div key={section.label}>
              <p className="mb-1 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-ink-3">{section.label}</p>
              <ul>
                {section.items.map(item => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <NavLink to={ROUTES[item.id]} className={navItemClass} end>
                        {({ isActive }) => <>
                          <Icon size={16} aria-hidden="true" className={isActive ? 'text-dawn-1' : ''} />
                          {item.name}
                        </>}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {isAdmin && (
            <div>
              <p className="mb-1 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-ink-3">Admin</p>
              <NavLink to={ROUTES.admin} className={({ isActive }) => cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-red-500/20 text-red-200' : 'text-red-300 hover:bg-red-500/10 hover:text-red-200',
              )}>
                <ShieldAlert size={16} aria-hidden="true" /> Admin Panel
              </NavLink>
            </div>
          )}
        </nav>

        <div className="border-t border-line p-4">
          <button
            onClick={async () => { await logout(); navigate('/', { replace: true }); }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-2 transition-colors hover:bg-white/5 hover:text-ink"
          >
            <LogOut size={16} aria-hidden="true" /> Sign out
          </button>
        </div>
      </aside>

      {/* Overlay for the mobile drawer */}
      {isMenuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* ─── Main Content ─────────────────────────────────── */}
      <div className="flex min-h-screen flex-1 flex-col md:ml-64" inert={!isDesktop && isMenuOpen ? true : undefined}>
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-canvas/80 px-4 py-3 backdrop-blur-lg md:px-8">
          <button
            ref={menuButtonRef}
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-surface-3 md:hidden"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            aria-controls="app-sidebar"
          >
            <Menu size={20} aria-hidden="true" />
          </button>
          <div className="hidden text-sm font-semibold text-ink-2 md:block">{currentName}</div>
          <div className="flex items-center gap-3">
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(p => !p)}
                className="relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-surface-3"
                aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
                aria-expanded={showNotifications}
                aria-haspopup="true"
              >
                <Bell size={18} aria-hidden="true" />
                {unread > 0 && (
                  <span aria-hidden="true" className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <m.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-line bg-surface-2 shadow-2xl"
                  >
                    <div className="flex items-center justify-between border-b border-line p-4">
                      <span className="text-sm font-semibold">Notifications</span>
                      <button onClick={markAll} className="text-xs text-accent-ink hover:underline">Mark all read</button>
                    </div>
                    <div className="max-h-80 divide-y divide-line overflow-y-auto">
                      {notifications.length === 0
                        ? <p className="p-4 text-center text-sm text-ink-3">No notifications yet</p>
                        : notifications.map(n => (
                          <button
                            key={n.id}
                            onClick={() => handleNotifClick(n)}
                            className={cn('flex w-full items-start gap-3 p-3 text-left text-sm transition-colors hover:bg-surface-3', !n.is_read && 'bg-accent-soft')}
                          >
                            {!n.is_read && <span aria-label="Unread" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-dawn-2" />}
                            <span>
                              <span className="block text-ink">{n.content}</span>
                              <span className="mt-0.5 block text-[11px] text-ink-3">{new Date(n.timestamp).toLocaleDateString()}</span>
                            </span>
                          </button>
                        ))}
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
            <Link to={ROUTES.profile} className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-surface-3" aria-label="View profile">
              <AvatarBubble name={user.username} color={user.avatar_color} size={30} />
            </Link>
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">
          <AnimatePresence mode="popLayout" initial={false}>
            <m.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Suspense fallback={<PageSkeleton />}>
                <Routes location={location}>
                  <Route path={ROUTES.dashboard} element={<Dashboard onNavigate={goTo} />} />
                  <Route path={ROUTES.yard} element={<TheYard />} />
                  <Route path={ROUTES.kites} element={<Kites />} />
                  <Route path={ROUTES.groups} element={<Groups />} />
                  <Route path={ROUTES.forum} element={<Forum />} />
                  <Route path={ROUTES.stories} element={<SuccessStories />} />
                  <Route path={ROUTES.mentorship} element={<MentorshipTab />} />
                  <Route path={ROUTES.checkins} element={<CheckIns />} />
                  <Route path={ROUTES.journal} element={<Journal />} />
                  <Route path={ROUTES.resources} element={<Resources />} />
                  <Route path={ROUTES.opportunities} element={<Opportunities />} />
                  <Route path={ROUTES.tools} element={<Tools />} />
                  <Route path={ROUTES.cases} element={<CaseTracker />} />
                  <Route path={ROUTES.vault} element={<Vault />} />
                  <Route path={ROUTES.profile} element={<Profile />} />
                  <Route path={ROUTES.help} element={<HelpCenter />} />
                  <Route path={ROUTES.admin} element={isAdmin ? <AdminDashboard /> : <Navigate to={ROUTES.dashboard} replace />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </m.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullScreenLoader />;

  // Crisis help is always public, signed in or not.
  if (location.pathname === ROUTES.resources && !user) return <PublicHelp />;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={ROUTES.dashboard} replace /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to={ROUTES.dashboard} replace /> : <Auth initialView="login" />} />
      <Route path="/register" element={user ? <Navigate to={ROUTES.dashboard} replace /> : <Auth initialView="register" />} />
      <Route path="/forgot-password" element={user ? <Navigate to={ROUTES.dashboard} replace /> : <Auth initialView="forgot" />} />
      <Route path="*" element={<AppShell />} />
    </Routes>
  );
}

export default function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </MotionConfig>
    </LazyMotion>
  );
}
