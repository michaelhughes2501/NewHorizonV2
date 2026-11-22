import React, { useState, useEffect } from 'react';
import { Plus, Briefcase, Home, Trash2, ExternalLink, CheckCircle, Filter } from 'lucide-react';
import { useAuth } from '../AuthContext';

const JOB_CATEGORIES = ['general', 'construction', 'food service', 'retail', 'tech', 'healthcare', 'transportation', 'manufacturing'];
const APP_STATUSES = ['applied', 'phone screen', 'interview', 'offer', 'rejected', 'accepted'];

export default function Opportunities() {
  const { token } = useAuth();
  const [tab, setTab] = useState<'jobs' | 'tracker' | 'housing'>('jobs');
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [housing, setHousing] = useState<any[]>([]);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showAppForm, setShowAppForm] = useState(false);
  const [showHousingForm, setShowHousingForm] = useState(false);
  const [felonyFilter, setFelonyFilter] = useState(false);
  const [jobForm, setJobForm] = useState({ title: '', company: '', location: '', description: '', salary_range: '', is_felony_friendly: true, support_level: 'medium', category: 'general' });
  const [appForm, setAppForm] = useState({ company: '', position: '', date_applied: '', status: 'applied', notes: '' });
  const [housingForm, setHousingForm] = useState({ name: '', type: '', location: '', contact_info: '', description: '' });

  useEffect(() => {
    fetch(`/api/jobs${felonyFilter ? '?felony_friendly=1' : ''}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => Array.isArray(d) && setJobs(d)).catch(() => {});
    fetch('/api/job-applications', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => Array.isArray(d) && setApplications(d)).catch(() => {});
    fetch('/api/housing', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => Array.isArray(d) && setHousing(d)).catch(() => {});
  }, [token, felonyFilter]);

  const addJob = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(jobForm) });
    setShowJobForm(false); setJobForm({ title: '', company: '', location: '', description: '', salary_range: '', is_felony_friendly: true, support_level: 'medium', category: 'general' });
    fetch('/api/jobs', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => Array.isArray(d) && setJobs(d));
  };

  const addApp = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/job-applications', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(appForm) });
    setShowAppForm(false); setAppForm({ company: '', position: '', date_applied: '', status: 'applied', notes: '' });
    fetch('/api/job-applications', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => Array.isArray(d) && setApplications(d));
  };

  const delApp = async (id: string) => {
    await fetch(`/api/job-applications/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setApplications(p => p.filter(a => a.id !== id));
  };

  const updateAppStatus = async (id: string, status: string) => {
    await fetch(`/api/job-applications/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) });
    setApplications(p => p.map(a => a.id === id ? { ...a, status } : a));
  };

  const addHousing = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/housing', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(housingForm) });
    setShowHousingForm(false);
    fetch('/api/housing', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => Array.isArray(d) && setHousing(d));
  };

  const STATUS_COLORS: Record<string, string> = { applied: 'bg-blue-500/15 text-blue-300', 'phone screen': 'bg-purple-500/15 text-purple-300', interview: 'bg-amber-500/15 text-amber-300', offer: 'bg-green-500/15 text-green-300', rejected: 'bg-red-500/15 text-red-300', accepted: 'bg-emerald-500/15 text-emerald-300' };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">Opportunities</h2>
        <p className="text-ink-3 text-sm mt-1">Jobs, housing, and application tracking — all in one place.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-surface-2 p-1 rounded-xl w-fit">
        {(['jobs', 'tracker', 'housing'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-[color,background-color,border-color,box-shadow,opacity,transform] capitalize ${tab === t ? 'bg-surface text-ink shadow' : 'text-ink-3 hover:text-ink-2'}`}>
            {t === 'tracker' ? 'Application Tracker' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* JOBS */}
      {tab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <label className="flex items-center gap-2 text-sm text-ink-2 cursor-pointer">
              <input type="checkbox" checked={felonyFilter} onChange={e => setFelonyFilter(e.target.checked)} className="rounded" />
              <Filter size={14} /> Felony-friendly only
            </label>
            <button onClick={() => setShowJobForm(p => !p)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-strong transition-colors">
              <Plus size={15} /> Post a Job
            </button>
          </div>

          {showJobForm && (
            <form onSubmit={addJob} className="bg-surface rounded-2xl border border-line p-6 space-y-3">
              <h3 className="font-semibold text-ink">Post a Job Listing</h3>
              {[['title', 'Job Title *'], ['company', 'Company *'], ['location', 'Location'], ['salary_range', 'Salary Range']].map(([k, p]) => (
                <input aria-label={p} key={k} required={p.includes('*')} placeholder={p} value={(jobForm as any)[k]} onChange={e => setJobForm(prev => ({ ...prev, [k]: e.target.value }))}
                  className="w-full border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              ))}
              <textarea aria-label="Job description" value={jobForm.description} onChange={e => setJobForm(p => ({ ...p, description: e.target.value }))} placeholder="Job description"
                className="w-full border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none h-20" />
              <div className="flex gap-3 flex-wrap">
                <select aria-label="Job category" value={jobForm.category} onChange={e => setJobForm(p => ({ ...p, category: e.target.value }))} className="border border-line rounded-xl px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus capitalize">
                  {JOB_CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
                <label className="flex items-center gap-2 text-sm text-ink-2 cursor-pointer">
                  <input type="checkbox" checked={jobForm.is_felony_friendly} onChange={e => setJobForm(p => ({ ...p, is_felony_friendly: e.target.checked }))} className="rounded" />
                  Felony-friendly
                </label>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-5 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-strong transition-colors">Post</button>
                <button type="button" onClick={() => setShowJobForm(false)} className="px-5 py-2 rounded-xl border border-line text-sm hover:bg-surface-3 transition-colors">Cancel</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.length === 0 ? <div className="col-span-2 text-center py-12 text-ink-3"><Briefcase size={32} className="mx-auto mb-2 opacity-30" /><p>No jobs posted yet.</p></div>
              : jobs.map(j => (
                <div key={j.id} className="bg-surface rounded-2xl border border-line p-5 hover:shadow-md transition-[color,background-color,border-color,box-shadow,opacity,transform]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-ink">{j.title}</h3>
                      <p className="text-sm text-ink-3">{j.company}</p>
                      {j.location && <p className="text-xs text-ink-3 mt-1">📍 {j.location}</p>}
                      {j.salary_range && <p className="text-xs text-ink-3">💰 {j.salary_range}</p>}
                    </div>
                    {j.is_felony_friendly === 1 && <span className="text-[10px] bg-green-500/15 text-green-300 px-2 py-1 rounded-full font-bold shrink-0">2nd Chance</span>}
                  </div>
                  {j.description && <p className="text-sm text-ink-2 mt-3 line-clamp-2">{j.description}</p>}
                  <span className="inline-block mt-2 text-[10px] bg-surface-2 text-ink-3 px-2 py-0.5 rounded-full capitalize">{j.category}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* APPLICATION TRACKER */}
      {tab === 'tracker' && (
        <div className="space-y-4">
          <button onClick={() => setShowAppForm(p => !p)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-strong transition-colors">
            <Plus size={15} /> Log Application
          </button>

          {showAppForm && (
            <form onSubmit={addApp} className="bg-surface rounded-2xl border border-line p-6 space-y-3">
              <h3 className="font-semibold text-ink">Log a Job Application</h3>
              <div className="grid grid-cols-2 gap-3">
                <input aria-label="Company" required placeholder="Company *" value={appForm.company} onChange={e => setAppForm(p => ({ ...p, company: e.target.value }))} className="border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                <input aria-label="Position" required placeholder="Position *" value={appForm.position} onChange={e => setAppForm(p => ({ ...p, position: e.target.value }))} className="border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                <input aria-label="Date applied" type="date" value={appForm.date_applied} onChange={e => setAppForm(p => ({ ...p, date_applied: e.target.value }))} className="border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                <select aria-label="Application status" value={appForm.status} onChange={e => setAppForm(p => ({ ...p, status: e.target.value }))} className="border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus capitalize">
                  {APP_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
              <textarea aria-label="Notes" value={appForm.notes} onChange={e => setAppForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notes" className="w-full border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus resize-none h-16" />
              <div className="flex gap-2">
                <button type="submit" className="px-5 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-strong transition-colors">Add</button>
                <button type="button" onClick={() => setShowAppForm(false)} className="px-5 py-2 rounded-xl border border-line text-sm hover:bg-surface-3 transition-colors">Cancel</button>
              </div>
            </form>
          )}

          {applications.length === 0 ? <div className="text-center py-12 text-ink-3"><p>No applications tracked yet. Log your first one!</p></div>
            : <div className="space-y-3">
              {applications.map(a => (
                <div key={a.id} className="bg-surface rounded-2xl border border-line p-5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-ink">{a.position}</h3>
                    <p className="text-sm text-ink-3">{a.company} {a.date_applied && `· Applied ${a.date_applied}`}</p>
                    {a.notes && <p className="text-xs text-ink-3 mt-1 truncate">{a.notes}</p>}
                  </div>
                  <select aria-label={`Status for ${a.position || 'application'}`} value={a.status} onChange={e => updateAppStatus(a.id, e.target.value)}
                    className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[a.status] || 'bg-surface-2 text-ink-2'}`}>
                    {APP_STATUSES.map(s => <option key={s} value={s} className="bg-surface text-ink capitalize">{s}</option>)}
                  </select>
                  <button onClick={() => delApp(a.id)} className="p-2 rounded-xl text-ink-3 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>}
        </div>
      )}

      {/* HOUSING */}
      {tab === 'housing' && (
        <div className="space-y-4">
          <button onClick={() => setShowHousingForm(p => !p)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-strong transition-colors">
            <Plus size={15} /> Add Housing Resource
          </button>

          {showHousingForm && (
            <form onSubmit={addHousing} className="bg-surface rounded-2xl border border-line p-6 space-y-3">
              {[['name', 'Name *'], ['type', 'Type (transitional, shelter, sober living...)'], ['location', 'Location'], ['contact_info', 'Contact info'], ['description', 'Description']].map(([k, p]) => (
                <input aria-label={p} key={k} required={p.includes('*')} placeholder={p} value={(housingForm as any)[k]} onChange={e => setHousingForm(prev => ({ ...prev, [k]: e.target.value }))}
                  className="w-full border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              ))}
              <div className="flex gap-2">
                <button type="submit" className="px-5 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-strong transition-colors">Add</button>
                <button type="button" onClick={() => setShowHousingForm(false)} className="px-5 py-2 rounded-xl border border-line text-sm hover:bg-surface-3 transition-colors">Cancel</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {housing.length === 0 ? <div className="col-span-2 text-center py-12 text-ink-3"><Home size={32} className="mx-auto mb-2 opacity-30" /><p>No housing resources yet.</p></div>
              : housing.map(h => (
                <div key={h.id} className="bg-surface rounded-2xl border border-line p-5">
                  <h3 className="font-semibold text-ink">{h.name}</h3>
                  {h.type && <span className="text-[11px] bg-surface-2 text-ink-3 px-2 py-0.5 rounded-full">{h.type}</span>}
                  {h.location && <p className="text-sm text-ink-3 mt-2">📍 {h.location}</p>}
                  {h.contact_info && <p className="text-sm text-ink-3">📞 {h.contact_info}</p>}
                  {h.description && <p className="text-sm text-ink-2 mt-2 line-clamp-2">{h.description}</p>}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
