import React, { useState } from 'react';
import { Scale, Calculator, FileText } from 'lucide-react';

const RESUME_TIPS = [
  { title: 'Highlight Transferable Skills', tip: 'Focus on skills like teamwork, problem-solving, time management, and communication — all valuable in any workplace.' },
  { title: 'Address Employment Gaps Honestly', tip: 'Use "personal development" or "family responsibilities" to address gaps. Be ready to explain growth during that time.' },
  { title: 'Lead with a Strong Summary', tip: 'Start with 2-3 sentences about your skills and what you bring to an employer. Skip the word "incarcerated."' },
  { title: 'Leverage Certifications & Training', tip: 'List any certificates, GED, vocational training, or skills courses completed. These demonstrate initiative.' },
  { title: 'Use Action Verbs', tip: 'Start each bullet with verbs: Managed, Led, Built, Operated, Trained, Coordinated, Improved, Reduced, Achieved.' },
  { title: 'Second-Chance Employers', tip: 'Target companies with "ban the box" policies: Dave\'s Hot Chicken, Greyston Bakery, Doe Fund, and major companies like JPMorgan Chase and Home Depot.' },
];

const INTERVIEW_TIPS = [
  { q: 'Tell me about yourself.', a: 'Focus on skills and goals, not your past. "I\'m a motivated [field] professional with experience in [skills]. I\'m excited to bring my skills to [company]."' },
  { q: 'Do you have a criminal record?', a: 'Be honest but brief. "Yes, I made a mistake years ago. Since then, I\'ve [what you did to improve]. I\'m focused on my future."' },
  { q: 'Why should we hire you?', a: 'Highlight your reliability, work ethic, and specific skills. Back it up with examples from training or volunteer work.' },
  { q: 'What are your goals?', a: 'Show stability and commitment. "I want to build a long-term career at a company where I can grow and contribute."' },
];

export default function Tools() {
  const [activeTab, setActiveTab] = useState<'resume' | 'interview' | 'skills'>('resume');

  const SKILLS = [
    { category: 'Technical', skills: ['Carpentry', 'Electrical', 'Plumbing', 'HVAC', 'Welding', 'Auto Mechanics', 'Computer Basics', 'Data Entry', 'Forklift Operation'] },
    { category: 'Service', skills: ['Food Preparation', 'Customer Service', 'Cashier', 'Warehouse', 'Cleaning/Sanitation', 'Security', 'Driving/CDL', 'Landscaping'] },
    { category: 'Soft Skills', skills: ['Team Leadership', 'Problem Solving', 'Time Management', 'Communication', 'Conflict Resolution', 'Mentoring', 'Organization', 'Attention to Detail'] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Career Tools</h2>
        <p className="text-slate-500 text-sm mt-1">Resume help, interview prep, and skills inventory.</p>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {([['resume', 'Resume Guide'], ['interview', 'Interview Prep'], ['skills', 'Skills Inventory']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === id ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'resume' && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
            <h3 className="font-semibold text-indigo-900 mb-1">Resume Writing for Second-Chance Job Seekers</h3>
            <p className="text-sm text-indigo-700">Your resume is your first impression. Use these tips to present your best self.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RESUME_TIPS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5">
                <h4 className="font-semibold text-slate-900">{t.title}</h4>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{t.tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'interview' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <h3 className="font-semibold text-amber-900 mb-1">Interview Preparation</h3>
            <p className="text-sm text-amber-700">Practice these common questions and know your answers before you walk in.</p>
          </div>
          {INTERVIEW_TIPS.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="font-semibold text-slate-900">Q: {t.q}</p>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed bg-slate-50 rounded-xl p-3">💡 {t.a}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="space-y-6">
          <p className="text-sm text-slate-600">Identify the skills you already have. These are valuable to employers — even if gained in unconventional ways.</p>
          {SKILLS.map(group => (
            <div key={group.category} className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-3">{group.category}</h3>
              <div className="flex flex-wrap gap-2">
                {group.skills.map(s => (
                  <span key={s} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
