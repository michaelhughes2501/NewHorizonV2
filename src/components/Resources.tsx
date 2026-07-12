import React, { useState } from 'react';
import { Phone, ExternalLink, Heart, Brain, Shield, BookOpen, Music } from 'lucide-react';

const CRISIS_RESOURCES = [
  { name: '988 Suicide & Crisis Lifeline', phone: '988', desc: 'Call or text 988 — available 24/7 for mental health crises.', category: 'crisis' },
  { name: 'Crisis Text Line', phone: 'Text HOME to 741741', desc: 'Free 24/7 crisis support via text message.', category: 'crisis' },
  { name: 'SAMHSA National Helpline', phone: '1-800-662-4357', desc: 'Substance use & mental health treatment referrals. Free, confidential.', category: 'substance' },
  { name: 'National Domestic Violence Hotline', phone: '1-800-799-7233', desc: '24/7 support for victims of domestic violence.', category: 'safety' },
  { name: 'NAMI Helpline', phone: '1-800-950-6264', desc: 'Mental illness info and referrals. Mon–Fri 10am–10pm ET.', category: 'mental health' },
  { name: 'Veterans Crisis Line', phone: '988, then press 1', desc: 'Confidential crisis support for veterans. 24/7.', category: 'veterans' },
  { name: 'National Alliance for Eating Disorders', phone: '1-866-662-1235', desc: 'Support and referrals for eating disorder recovery.', category: 'mental health' },
  { name: 'Second Chance Employment Help', phone: '', desc: 'HIRE Network & local reentry programs help formerly incarcerated find work.', url: 'https://hirenetwork.org', category: 'employment' },
];

const MINDFULNESS = [
  { title: 'Box Breathing', duration: '4 min', desc: 'Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat 4×. Calms the nervous system instantly.', emoji: '🌬️' },
  { title: '5-4-3-2-1 Grounding', duration: '3 min', desc: 'Name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste.', emoji: '🌿' },
  { title: 'Body Scan Meditation', duration: '10 min', desc: 'Close your eyes. Slowly scan from feet to head, releasing tension in each area.', emoji: '🧘' },
  { title: 'Gratitude Practice', duration: '5 min', desc: 'Write down 3 specific things you\'re grateful for today. Be as detailed as possible.', emoji: '🙏' },
  { title: 'Affirmations', duration: '2 min', desc: 'Repeat: "I am worthy of a new beginning. I am stronger than my past. I choose to grow."', emoji: '💪' },
  { title: 'Walking Meditation', duration: '15 min', desc: 'Walk slowly, focusing on each step, the feeling of ground beneath your feet.', emoji: '🚶' },
];

const ARTICLES = [
  { title: 'Managing Trauma After Incarceration', tag: 'Trauma & PTSD', desc: 'Understanding how to process and heal from the trauma of incarceration.' },
  { title: 'Building Healthy Relationships After Release', tag: 'Relationships', desc: 'How to rebuild trust, communicate, and form meaningful connections.' },
  { title: 'Dealing with Stigma and Discrimination', tag: 'Self-Worth', desc: 'Strategies for navigating judgment and reclaiming your identity.' },
  { title: 'Setting Realistic Goals in Recovery', tag: 'Goal Setting', desc: 'Breaking down big changes into achievable daily actions.' },
  { title: 'Managing Anxiety and Depression', tag: 'Mental Health', desc: 'Evidence-based techniques to manage anxiety and low mood.' },
  { title: 'Financial Literacy for a Fresh Start', tag: 'Finances', desc: 'Budgeting, banking, and building credit from scratch.' },
];

export default function Resources() {
  const [activeSection, setActiveSection] = useState<'crisis' | 'mindfulness' | 'library'>('crisis');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Crisis Resources & Support</h2>
        <p className="text-slate-500 text-sm mt-1">You are never alone. Help is always available.</p>
      </div>

      {/* Emergency Banner */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">
        <Phone size={22} className="text-red-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-red-800">If you are in immediate danger, call 911</p>
          <p className="text-sm text-red-600 mt-1">For mental health crisis, call or text <strong>988</strong> — available 24/7, free, confidential.</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[['crisis', '🆘 Hotlines & Help', Shield], ['mindfulness', '🧘 Mindfulness', Brain], ['library', '📚 Resource Library', BookOpen]] .map(([id, label]) => (
          <button key={id as string} onClick={() => setActiveSection(id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeSection === id ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'}`}>
            {label as string}
          </button>
        ))}
      </div>

      {activeSection === 'crisis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CRISIS_RESOURCES.map((r, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900">{r.name}</h3>
                  {r.phone && <p className="text-indigo-600 font-bold mt-1">{r.phone}</p>}
                  <p className="text-sm text-slate-600 mt-2">{r.desc}</p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full font-semibold shrink-0 capitalize ${
                  r.category === 'crisis' ? 'bg-red-100 text-red-700' :
                  r.category === 'substance' ? 'bg-purple-100 text-purple-700' :
                  r.category === 'mental health' ? 'bg-blue-100 text-blue-700' :
                  r.category === 'safety' ? 'bg-orange-100 text-orange-700' :
                  'bg-slate-100 text-slate-600'
                }`}>{r.category}</span>
              </div>
              {r.url && (
                <a href={r.url} target="_blank" rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                  <ExternalLink size={12} /> Visit Website
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {activeSection === 'mindfulness' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MINDFULNESS.map((m, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{m.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{m.title}</h3>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{m.duration}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'library' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ARTICLES.map((a, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all">
              <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">{a.tag}</span>
              <h3 className="font-semibold text-slate-900 mt-2">{a.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{a.desc}</p>
              <button className="mt-3 text-xs text-indigo-600 font-medium hover:underline">Read more →</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
