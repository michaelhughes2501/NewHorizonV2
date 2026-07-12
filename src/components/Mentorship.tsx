import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { AvatarBubble } from '../App';

export default function MentorshipTab() {
  const { user, token } = useAuth();
  const [mentors, setMentors] = useState<any[]>([]);
  const [mentorships, setMentorships] = useState<any[]>([]);
  const [isMentor, setIsMentor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setIsMentor(user?.is_mentor === 1);
    Promise.all([
      fetch('/api/mentors', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/mentorships', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([m, ms]) => {
      if (Array.isArray(m)) setMentors(m);
      if (Array.isArray(ms)) setMentorships(ms);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const toggleMentor = async () => {
    const r = await fetch('/api/users/mentor-status', { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json();
    if (r.ok) setIsMentor(d.is_mentor === 1);
  };

  const request = async (mentorId: string) => {
    const r = await fetch(`/api/mentorships/request/${mentorId}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) { alert('Request sent!'); fetchMentorships(); } else { const d = await r.json(); alert(d.error); }
  };

  const fetchMentorships = () =>
    fetch('/api/mentorships', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => Array.isArray(d) && setMentorships(d)).catch(() => {});

  const update = async (id: string, status: string) => {
    await fetch(`/api/mentorships/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) });
    fetchMentorships();
  };

  const myId = user?.id;
  const incoming = mentorships.filter(m => m.mentor_id === myId && m.status === 'pending');
  const active = mentorships.filter(m => m.status === 'active');
  const myMentors = active.filter(m => m.mentee_id === myId);
  const myMentees = active.filter(m => m.mentor_id === myId);

  if (loading) return <div className="text-center py-16 text-slate-400">Loading…</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Mentorship</h2>
        <p className="text-slate-500 text-sm mt-1">Connect with experienced guides or become one yourself.</p>
      </div>

      {/* Mentor toggle */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">Offer Mentorship</h3>
          <p className="text-sm text-slate-500 mt-0.5">Make yourself available to guide new members.</p>
        </div>
        <button onClick={toggleMentor}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${isMentor ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
          {isMentor ? '✓ Active Mentor' : 'Become a Mentor'}
        </button>
      </div>

      {/* Incoming requests */}
      {incoming.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Clock size={16} className="text-amber-500" /> Pending Requests</h3>
          <div className="space-y-3">
            {incoming.map(m => (
              <div key={m.id} className="flex items-center justify-between gap-4 p-4 bg-amber-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <AvatarBubble name={m.mentee_name} color={m.mentee_avatar} size={38} />
                  <span className="font-medium text-slate-900">{m.mentee_name} wants you as a mentor</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => update(m.id, 'active')} className="p-2 rounded-xl bg-green-100 text-green-600 hover:bg-green-200 transition-colors"><CheckCircle size={18} /></button>
                  <button onClick={() => update(m.id, 'declined')} className="p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors"><XCircle size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active mentorships */}
      {(myMentors.length > 0 || myMentees.length > 0) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><ShieldCheck size={16} className="text-indigo-500" /> Active Connections</h3>
          <div className="space-y-3">
            {myMentors.map(m => (
              <div key={m.id} className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl">
                <AvatarBubble name={m.mentor_name} color={m.mentor_avatar} size={40} />
                <div className="flex-1"><p className="text-xs text-slate-500 uppercase font-semibold tracking-wide">Your Mentor</p><p className="font-semibold text-slate-900">{m.mentor_name}</p></div>
                <button onClick={() => update(m.id, 'completed')} className="text-xs text-slate-400 hover:text-slate-600">Mark Complete</button>
              </div>
            ))}
            {myMentees.map(m => (
              <div key={m.id} className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl">
                <AvatarBubble name={m.mentee_name} color={m.mentee_avatar} size={40} />
                <div className="flex-1"><p className="text-xs text-slate-500 uppercase font-semibold tracking-wide">Your Mentee</p><p className="font-semibold text-slate-900">{m.mentee_name}</p></div>
                <button onClick={() => update(m.id, 'completed')} className="text-xs text-slate-400 hover:text-slate-600">Mark Complete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Browse mentors */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Users size={16} className="text-indigo-500" /> Available Mentors</h3>
        {mentors.length === 0 ? (
          <p className="text-slate-400 text-sm">No mentors available yet. Be the first!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mentors.map(m => (
              <div key={m.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <AvatarBubble name={m.name} color={m.avatar_color} size={40} />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-slate-900">{m.name}</span>
                      {m.is_verified === 1 && <ShieldCheck size={13} className="text-indigo-500" />}
                    </div>
                    {m.location && <p className="text-xs text-slate-400">{m.location}</p>}
                  </div>
                </div>
                {m.bio && <p className="text-sm text-slate-600 mb-3 line-clamp-2">{m.bio}</p>}
                <button onClick={() => request(m.id)}
                  className="w-full py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors">
                  Request Mentor
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
