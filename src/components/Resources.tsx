import React, { useState } from 'react';
import { Phone, ExternalLink, Brain, Shield, BookOpen, MessageSquare } from 'lucide-react';

type CrisisResource = {
  name: string;
  phone: string;
  desc: string;
  category: string;
  /** tel: link so the number can be tapped on a phone */
  tel?: string;
  /** sms: link for text lines */
  sms?: string;
  url?: string;
};

const CRISIS_RESOURCES: CrisisResource[] = [
  { name: '988 Suicide & Crisis Lifeline', phone: '988', tel: 'tel:988', sms: 'sms:988', desc: 'Call or text 988 — available 24/7 for mental health crises.', category: 'crisis' },
  { name: 'Crisis Text Line', phone: 'Text HOME to 741741', sms: 'sms:741741?&body=HOME', desc: 'Free 24/7 crisis support via text message.', category: 'crisis' },
  { name: 'SAMHSA National Helpline', phone: '1-800-662-4357', tel: 'tel:+18006624357', desc: 'Substance use & mental health treatment referrals. Free, confidential.', category: 'substance' },
  { name: 'National Domestic Violence Hotline', phone: '1-800-799-7233', tel: 'tel:+18007997233', sms: 'sms:88788?&body=START', desc: '24/7 support for victims of domestic violence.', category: 'safety' },
  { name: 'NAMI Helpline', phone: '1-800-950-6264', tel: 'tel:+18009506264', desc: 'Mental illness info and referrals. Mon–Fri 10am–10pm ET.', category: 'mental health' },
  { name: 'Veterans Crisis Line', phone: '988, then press 1', tel: 'tel:988', sms: 'sms:838255', desc: 'Confidential crisis support for veterans. 24/7.', category: 'veterans' },
  { name: 'National Alliance for Eating Disorders', phone: '1-866-662-1235', tel: 'tel:+18666621235', desc: 'Support and referrals for eating disorder recovery.', category: 'mental health' },
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
        <h2 className="text-2xl font-bold text-ink">Crisis Resources & Support</h2>
        <p className="text-ink-3 text-sm mt-1">You are never alone. Help is always available.</p>
      </div>

      {/* Emergency Banner */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-start gap-4">
        <Phone size={22} className="text-red-300 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-red-200">If you are in immediate danger, call 911</p>
          <p className="text-sm text-red-200 mt-1">For a mental health crisis, call or text <strong>988</strong>. It's free, confidential and open 24/7.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href="tel:911" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-500">
              <Phone size={16} aria-hidden="true" /> Call 911
            </a>
            <a href="tel:988" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-500">
              <Phone size={16} aria-hidden="true" /> Call 988
            </a>
            <a href="sms:988" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-400/50 px-4 text-sm font-semibold text-red-100 hover:bg-red-500/15">
              <MessageSquare size={16} aria-hidden="true" /> Text 988
            </a>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-surface-2 p-1 rounded-xl w-fit">
        {[['crisis', '🆘 Hotlines & Help', Shield], ['mindfulness', '🧘 Mindfulness', Brain], ['library', '📚 Resource Library', BookOpen]] .map(([id, label]) => (
          <button key={id as string} onClick={() => setActiveSection(id as any)} aria-pressed={activeSection === id}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-[color,background-color,border-color,box-shadow,opacity,transform] ${activeSection === id ? 'bg-surface text-ink shadow' : 'text-ink-3 hover:text-ink-2'}`}>
            {label as string}
          </button>
        ))}
      </div>

      {activeSection === 'crisis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CRISIS_RESOURCES.map((r, i) => (
            <div key={i} className="bg-surface rounded-2xl border border-line p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-ink">{r.name}</h3>
                  {r.phone && <p className="text-accent-ink font-bold mt-1">{r.phone}</p>}
                  <p className="text-sm text-ink-2 mt-2">{r.desc}</p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full font-semibold shrink-0 capitalize ${
                  r.category === 'crisis' ? 'bg-red-500/15 text-red-300' :
                  r.category === 'substance' ? 'bg-purple-500/15 text-purple-300' :
                  r.category === 'mental health' ? 'bg-blue-500/15 text-blue-300' :
                  r.category === 'safety' ? 'bg-orange-500/15 text-orange-300' :
                  'bg-surface-2 text-ink-2'
                }`}>{r.category}</span>
              </div>
              {(r.tel || r.sms) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.tel && (
                    <a href={r.tel} aria-label={`Call ${r.name}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-strong">
                      <Phone size={15} aria-hidden="true" /> Call
                    </a>
                  )}
                  {r.sms && (
                    <a href={r.sms} aria-label={`Text ${r.name}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line-strong px-4 text-sm font-semibold text-ink hover:bg-surface-3">
                      <MessageSquare size={15} aria-hidden="true" /> Text
                    </a>
                  )}
                </div>
              )}
              {r.url && (
                <a href={r.url} target="_blank" rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs text-accent-ink hover:underline">
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
            <div key={i} className="bg-surface rounded-2xl border border-line p-5 hover:shadow-md transition-[color,background-color,border-color,box-shadow,opacity,transform]">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{m.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-ink">{m.title}</h3>
                    <span className="text-[10px] bg-accent-soft text-accent-ink px-2 py-0.5 rounded-full">{m.duration}</span>
                  </div>
                  <p className="text-sm text-ink-2 mt-2 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'library' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ARTICLES.map((a, i) => (
            <div key={i} className="bg-surface rounded-2xl border border-line p-5 hover:shadow-md transition-[color,background-color,border-color,box-shadow,opacity,transform]">
              <span className="text-[11px] bg-surface-2 text-ink-3 px-2 py-0.5 rounded-full font-medium">{a.tag}</span>
              <h3 className="font-semibold text-ink mt-2">{a.title}</h3>
              <p className="text-sm text-ink-2 mt-1">{a.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
