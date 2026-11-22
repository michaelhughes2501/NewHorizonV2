import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, BookLock, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { BrandMark } from './ui/BrandMark';
import { DawnGlow } from './Auth';

const BENEFITS = [
  {
    icon: Users,
    title: 'People who get it',
    desc: 'Peer support, groups and mentors who have walked the same road.',
  },
  {
    icon: Briefcase,
    title: 'Jobs and housing',
    desc: 'Second-chance employers and housing, plus tools to track every application.',
  },
  {
    icon: BookLock,
    title: 'Your private space',
    desc: 'A journal, daily check-ins and a vault for your documents that only you can see.',
  },
];

/** Public front door: what New Horizon is, one clear way in, and help without an account. */
export default function Landing() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2">
        Skip to content
      </a>

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link to="/" className="flex items-center gap-3 rounded-xl">
          <BrandMark size={36} />
          <span className="text-lg font-bold tracking-tight">New Horizon</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-2 sm:gap-4">
          <Link to="/help" className="hidden rounded-lg px-3 py-2 text-sm text-ink-2 hover:text-ink sm:inline-block">Crisis help</Link>
          <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-2 hover:text-ink">Sign in</Link>
          <Link to="/register" className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-canvas transition-transform duration-200 hover:-translate-y-0.5">Join free</Link>
        </nav>
      </header>

      <main id="main">
        <section className="relative overflow-hidden">
          <DawnGlow />
          <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-16 text-center sm:px-6 sm:pt-24">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink-2">
              <ShieldCheck size={13} aria-hidden="true" /> Free. Private. Built with people coming home.
            </p>
            <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Your past is a chapter. <span className="dawn-text">Not the whole story.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-2 sm:text-lg">
              New Horizon is a community for people rebuilding after incarceration. Find support, work, housing and a place to be yourself.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/register"
                className="dawn-fill inline-flex min-h-12 items-center gap-2 rounded-xl px-7 text-base font-semibold text-white shadow-lg shadow-rose-500/25 transition-[filter,transform] duration-200 hover:-translate-y-0.5 hover:brightness-110">
                Join free <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link to="/login" className="inline-flex min-h-12 items-center rounded-xl px-6 text-base font-medium text-ink-2 hover:text-ink">
                I already have an account
              </Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="benefits-heading" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 id="benefits-heading" className="sr-only">What you get</h2>
          <ul className="stagger grid gap-4 md:grid-cols-3">
            {BENEFITS.map((b, i) => {
              const Icon = b.icon;
              return (
                <li key={b.title} style={{ '--i': i } as React.CSSProperties} className="glass rounded-2xl p-6">
                  <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-semibold">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">{b.desc}</p>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="crisis-heading" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 sm:flex-row sm:items-center">
            <div>
              <h2 id="crisis-heading" className="text-lg font-semibold text-red-100">Need help right now?</h2>
              <p className="mt-1 text-sm text-red-200">Call or text 988, any time. Every crisis line is free and needs no account.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="tel:988" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-500">
                <Phone size={16} aria-hidden="true" /> Call 988
              </a>
              <Link to="/help" className="inline-flex min-h-11 items-center rounded-xl border border-red-400/50 px-4 text-sm font-semibold text-red-100 hover:bg-red-500/15">
                All crisis lines
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-ink-3 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} New Horizon, a FeloniousApps project.</p>
          <p>If you are in danger, call 911.</p>
        </div>
      </footer>
    </div>
  );
}
