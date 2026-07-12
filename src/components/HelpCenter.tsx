import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  { cat: 'Getting Started', q: 'What is New Horizon?', a: 'New Horizon is a supportive community platform for individuals re-entering society. We provide tools for mental health, career development, and peer connection.' },
  { cat: 'Getting Started', q: 'Is my information private?', a: 'Yes. You control exactly what others see. You can hide your location and facility history in your Profile settings. Only you and administrators see your private data.' },
  { cat: 'Getting Started', q: 'What is verification?', a: 'Verified members have been vetted by our team. The blue shield icon means their identity and sincerity have been confirmed, helping build trust.' },
  { cat: 'Community', q: 'What are Kites?', a: 'Kites are private direct messages between members. You can also choose to send them anonymously when needed.' },
  { cat: 'Community', q: 'Can I post anonymously?', a: 'Yes! In the Forum, Groups, Kites, and Success Stories, you can choose to post anonymously. Your identity stays hidden from other users but is known to admins for safety.' },
  { cat: 'Community', q: 'How do I report someone?', a: 'Click the flag icon on any post, message, or profile. Our moderation team reviews all reports within 24 hours.' },
  { cat: 'Wellness', q: 'Are check-ins and journals private?', a: 'Check-ins are always private. Journal entries are private by default — you can optionally share them with the community.' },
  { cat: 'Career', q: 'Are all jobs felony-friendly?', a: 'Jobs tagged "2nd Chance" are specifically from employers open to hiring people with records. Use the filter in the Jobs tab.' },
  { cat: 'Career', q: 'How does the Application Tracker work?', a: 'Log each job you apply to, then update the status as you hear back. It helps you stay organized during your job search.' },
  { cat: 'Safety', q: 'Can parole officers see my activity?', a: 'No. We do not share your data with law enforcement or supervision agencies unless legally compelled by a court order.' },
  { cat: 'Safety', q: 'What if I\'m in crisis?', a: 'Please call or text 988 immediately. The Crisis Resources tab also has a full list of hotlines. You are not alone.' },
];

export default function HelpCenter() {
  const [open, setOpen] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const categories = [...new Set(FAQS.map(f => f.cat))];

  const filtered = FAQS.filter(f =>
    !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Help Center</h2>
        <p className="text-slate-500 text-sm mt-1">Find answers to common questions about New Horizon.</p>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for help…"
        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />

      {categories.filter(c => filtered.some(f => f.cat === c)).map(cat => (
        <div key={cat}>
          <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wider">{cat}</h3>
          <div className="space-y-2">
            {filtered.filter(f => f.cat === cat).map((f, i) => {
              const idx = FAQS.indexOf(f);
              return (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <button onClick={() => setOpen(open === idx ? null : idx)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors">
                    <span className="font-medium text-slate-900 text-sm">{f.q}</span>
                    {open === idx ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                  </button>
                  {open === idx && (
                    <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">{f.a}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-center">
        <p className="font-semibold text-indigo-900 mb-1">Still need help?</p>
        <p className="text-sm text-indigo-700">Post in the Community Forum and our team or fellow members will assist you.</p>
      </div>
    </div>
  );
}
