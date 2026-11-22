import React, { useState, useEffect } from 'react';
import { Plus, ThumbsUp, Star, EyeOff } from 'lucide-react';
import * as m from 'motion/react-m';
import { useAuth } from '../AuthContext';
import { AvatarBubble } from './ui/AvatarBubble';

export default function SuccessStories() {
  const { token } = useAuth();
  const [stories, setStories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', is_anonymous: false });

  useEffect(() => { fetchStories(); }, [token]);

  const fetchStories = () =>
    fetch('/api/success-stories', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => Array.isArray(d) && setStories(d)).catch(() => {});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch('/api/success-stories', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    if (r.ok) { setShowForm(false); setForm({ title: '', content: '', is_anonymous: false }); fetchStories(); }
  };

  const upvote = async (id: string) => {
    await fetch(`/api/success-stories/${id}/upvote`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
    setStories(p => p.map(s => s.id === id ? { ...s, upvotes: s.upvotes + 1 } : s));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">Success Stories</h2>
          <p className="text-ink-3 text-sm mt-1">Celebrate wins and inspire others on the journey.</p>
        </div>
        <button onClick={() => setShowForm(p => !p)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors">
          <Star size={15} /> Share Your Story
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-surface rounded-2xl border border-amber-500/30 p-6 space-y-4">
          <h3 className="font-semibold text-ink">Share a Win 🎉</h3>
          <input aria-label="Give your story a title" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Give your story a title"
            className="w-full border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          <textarea aria-label="What happened? How did you overcome it?" required value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="What happened? How did you overcome it?"
            className="w-full border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none h-28" />
          <label className="flex items-center gap-2 text-sm text-ink-3 cursor-pointer">
            <input type="checkbox" checked={form.is_anonymous} onChange={e => setForm(p => ({ ...p, is_anonymous: e.target.checked }))} className="rounded" />
            <EyeOff size={13} /> Post anonymously
          </label>
          <div className="flex gap-2">
            <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors">Share Story</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl border border-line text-sm hover:bg-surface-3 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {stories.length === 0 ? (
        <div className="text-center py-16 text-ink-3">
          <p className="text-4xl mb-3">⭐</p>
          <p>No stories yet. Be the first to share a win!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {stories.map((s, i) => (
            <m.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-surface rounded-2xl border border-line p-6">
              <div className="flex items-start gap-4">
                <AvatarBubble name={s.is_anonymous ? 'A' : s.author_name} color={s.is_anonymous ? '#6B7280' : undefined} size={40} />
                <div className="flex-1">
                  <h3 className="font-bold text-ink text-lg">{s.title}</h3>
                  <p className="text-xs text-ink-3 mt-0.5">{s.is_anonymous ? 'Anonymous' : s.author_name} · {new Date(s.created_at).toLocaleDateString()}</p>
                  <p className="text-ink-2 mt-3 leading-relaxed">{s.content}</p>
                  <button onClick={() => upvote(s.id)} className="mt-4 flex items-center gap-2 text-sm text-ink-3 hover:text-amber-400 transition-colors">
                    <ThumbsUp size={15} /> {s.upvotes} {s.upvotes === 1 ? 'person inspired' : 'people inspired'}
                  </button>
                </div>
              </div>
            </m.div>
          ))}
        </div>
      )}
    </div>
  );
}
