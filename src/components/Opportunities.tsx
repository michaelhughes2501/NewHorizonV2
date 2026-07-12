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

  const STATUS_COLORS: Record<string, string> = { applied: 'bg-blue-100 text-blue-700', 'phone screen': 'bg-purple-100 text-purple-700', interview: 'bg-amber-100 text-amber-700', offer: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700', accepted: 'bg-emerald-100 text-emerald-700' };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Opportunities</h2>
        <p className="text-slate-500 text-sm mt-1">Jobs, housing, and application tracking — all in one place.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(['jobs', 'tracker', 'housing'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${tab === t ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'}`}>
            {t === 'tracker' ? 'Application Tracker' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* JOBS */}
      {tab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="checkbox" checked={felonyFilter} onChange={e => setFelonyFilter(e.target.checked)} className="rounded" />
              <Filter size={14} /> Felony-friendly only
            </label>
            <button onClick={() => setShowJobForm(p => !p)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">
              <Plus size={15} /> Post a Job
            </button>
          </div>

          {showJobForm && (
            <form onSubmit={addJob} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <h3 className="font-semibold text-slate-900">Post a Job Listing</h3>
              {[['title', 'Job Title *'], ['company', 'Company *'], ['location', 'Location'], ['salary_range', 'Salary Range']].map(([k, p]) => (
                <input key={k} required={p.includes('*')} placeholder={p} value={(jobForm as any)[k]} onChange={e => setJobForm(prev => ({ ...prev, [k]: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              ))}
              <textarea value={jobForm.description} onChange={e => setJobForm(p => ({ ...p, description: e.target.value }))} placeholder="Job description"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-20" />
              <div className="flex gap-3 flex-wrap">
                <select value={jobForm.category} onChange={e => setJobForm(p => ({ ...p, category: e.target.value }))} className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none capitalize">
                  {JOB_CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={jobForm.is_felony_friendly} onChange={e => setJobForm(p => ({ ...p, is_felony_friendly: e.target.checked }))} className="rounded" />
                  Felony-friendly
                </label>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">Post</button>
                <button type="button" onClick={() => setShowJobForm(false)} className="px-5 py-2 rounded-xl border border-slate-200 text-sm hover:bg-slate-50 transition-colors">Cancel</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.length === 0 ? <div className="col-span-2 text-center py-12 text-slate-400"><Briefcase size={32} className="mx-auto mb-2 opacity-30" /><p>No jobs posted yet.</p></div>
              : jobs.map(j => (
                <div key={j.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{j.title}</h3>
                      <p className="text-sm text-slate-500">{j.company}</p>
                      {j.location && <p className="text-xs text-slate-400 mt-1">📍 {j.location}</p>}
                      {j.salary_range && <p className="text-xs text-slate-400">💰 {j.salary_range}</p>}
                    </div>
                    {j.is_felony_friendly === 1 && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold shrink-0">2nd Chance</span>}
                  </div>
                  {j.description && <p className="text-sm text-slate-600 mt-3 line-clamp-2">{j.description}</p>}
                  <span className="inline-block mt-2 text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full capitalize">{j.category}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* APPLICATION TRACKER */}
      {tab === 'tracker' && (
        <div className="space-y-4">
          <button onClick={() => setShowAppForm(p => !p)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">
            <Plus size={15} /> Log Application
          </button>

          {showAppForm && (
            <form onSubmit={addApp} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <h3 className="font-semibold text-slate-900">Log a Job Application</h3>
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Company *" value={appForm.company} onChange={e => setAppForm(p => ({ ...p, company: e.target.value }))} className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input required placeholder="Position *" value={appForm.position} onChange={e => setAppForm(p => ({ ...p, position: e.target.value }))} className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input type="date" value={appForm.date_applied} onChange={e => setAppForm(p => ({ ...p, date_applied: e.target.value }))} className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <select value={appForm.status} onChange={e => setAppForm(p => ({ ...p, status: e.target.value }))} className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none capitalize">
                  {APP_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
              <textarea value={appForm.notes} onChange={e => setAppForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notes" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none resize-none h-16" />
              <div className="flex gap-2">
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">Add</button>
                <button type="button" onClick={() => setShowAppForm(false)} className="px-5 py-2 rounded-xl border border-slate-200 text-sm hover:bg-slate-50 transition-colors">Cancel</button>
              </div>
            </form>
          )}

          {applications.length === 0 ? <div className="text-center py-12 text-slate-400"><p>No applications tracked yet. Log your first one!</p></div>
            : <div className="space-y-3">
              {applications.map(a => (
                <div key={a.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900">{a.position}</h3>
                    <p className="text-sm text-slate-500">{a.company} {a.date_applied && `· Applied ${a.date_applied}`}</p>
                    {a.notes && <p className="text-xs text-slate-400 mt-1 truncate">{a.notes}</p>}
                  </div>
                  <select value={a.status} onChange={e => updateAppStatus(a.id, e.target.value)}
                    className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[a.status] || 'bg-slate-100 text-slate-600'}`}>
                    {APP_STATUSES.map(s => <option key={s} value={s} className="bg-white text-slate-900 capitalize">{s}</option>)}
                  </select>
                  <button onClick={() => delApp(a.id)} className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>}
        </div>
      )}

      {/* HOUSING */}
      {tab === 'housing' && (
        <div className="space-y-4">
          <button onClick={() => setShowHousingForm(p => !p)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">
            <Plus size={15} /> Add Housing Resource
          </button>

          {showHousingForm && (
            <form onSubmit={addHousing} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              {[['name', 'Name *'], ['type', 'Type (transitional, shelter, sober living...)'], ['location', 'Location'], ['contact_info', 'Contact info'], ['description', 'Description']].map(([k, p]) => (
                <input key={k} required={p.includes('*')} placeholder={p} value={(housingForm as any)[k]} onChange={e => setHousingForm(prev => ({ ...prev, [k]: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              ))}
              <div className="flex gap-2">
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">Add</button>
                <button type="button" onClick={() => setShowHousingForm(false)} className="px-5 py-2 rounded-xl border border-slate-200 text-sm hover:bg-slate-50 transition-colors">Cancel</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {housing.length === 0 ? <div className="col-span-2 text-center py-12 text-slate-400"><Home size={32} className="mx-auto mb-2 opacity-30" /><p>No housing resources yet.</p></div>
              : housing.map(h => (
                <div key={h.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-900">{h.name}</h3>
                  {h.type && <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{h.type}</span>}
                  {h.location && <p className="text-sm text-slate-500 mt-2">📍 {h.location}</p>}
                  {h.contact_info && <p className="text-sm text-slate-500">📞 {h.contact_info}</p>}
                  {h.description && <p className="text-sm text-slate-600 mt-2 line-clamp-2">{h.description}</p>}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
