// One place that maps each screen to its URL. Notification links, the
// dashboard shortcuts and the sidebar all go through this map.

export type Tab =
  | 'dashboard' | 'yard' | 'kites' | 'groups' | 'forum' | 'mentorship' | 'opportunities'
  | 'resources' | 'tools' | 'cases' | 'vault' | 'checkins' | 'journal' | 'stories'
  | 'profile' | 'admin' | 'help';

export const ROUTES: Record<Tab, string> = {
  dashboard: '/dashboard',
  yard: '/yard',
  kites: '/kites',
  groups: '/groups',
  forum: '/forum',
  stories: '/stories',
  mentorship: '/mentorship',
  checkins: '/check-ins',
  journal: '/journal',
  resources: '/help',
  opportunities: '/jobs',
  tools: '/tools',
  cases: '/cases',
  vault: '/vault',
  profile: '/profile',
  admin: '/admin',
  help: '/help-center',
};

/** Turn a tab id (or an already-formed path) into a URL path. */
export function pathFor(target: string | null | undefined): string {
  if (!target) return ROUTES.dashboard;
  if (target.startsWith('/')) return target;
  return ROUTES[target as Tab] ?? ROUTES.dashboard;
}
