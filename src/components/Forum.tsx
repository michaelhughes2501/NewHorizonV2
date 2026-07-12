import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft, Send, Flag, ThumbsUp, EyeOff, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../AuthContext';
import { AvatarBubble } from '../App';

const CATEGORIES = ['general', 'employment', 'housing', 'mental health', 'sobriety', 'legal', 'family', 'success', 'support'];

export default function Forum() {
  const { token, user } = useAuth();
  const [threads, setThreads] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [category, setCategory] = useState('all');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'general', is_anonymous: false });
  const [reply, setReply] = useState('');
  const [replyAnon, setReplyAnon] = useState(false);

  useEffect(() => { fetchThreads(); }, [token, category]);
  useEffect(() => { if (active) fetchReplies(active.id); }, [active]);

  const fetchThreads = () =>
    fetch(`/api/threads?category=${category}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => Array.isArray(d) && setThreads(d)).catch(() => {});

  const fetchReplies = (id: string) =>
    fetch(`/api/threads/${id}/replies`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => Array.isArray(d) && setReplies(d)).catch(() => {});

  const createThread = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch('/api/threads', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
    if (r.ok) { setShowNew(false); setForm({ title: '', content: '', category: 'general', is_anonymous: false }); fetchThreads(); }
  };

  const postReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !active) return;
    await fetch(`/api/threads/${active.id}/replies`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: reply, is_anonymous: replyAnon })
    });
    setReply(''); fetchReplies(active.id);
  };

  const flag = async (type: 'thread' | 'reply', id: string) => {
    await fetch('/api/reports', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ target_type: type, target_id: id, reason: 'flagged by user' })
    });
    alert('Reported to moderators.');
  };

  if (active) return (
    <div className="space-y-6">
      <button onClick={() => setActive(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">
        <ArrowLeft size={16} /> Back to Forum
      </button>
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-start gap-4">
          <AvatarBubble name={active.author_name} color={active.avatar_color} size={40} />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900">{active.title}</h2>
            <p className="text-xs text-slate-400 mt-1">{active.author_name} · {active.category} · {new Date(active.created_at).toLocaleDateString()}</p>
            <p className="text-slate-700 mt-4 leading-relaxed whitespace-pre-wrap">{active.content}</p>
          </div>
          <button onClick={() => flag('thread', active.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Flag size={15} /></button>
        </div>
      </div>

      <h3 className="font-semibold text-slate-700">{replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}</h3>
      {replies.map(r => (
        <div key={r.id} className="bg-white rounded-2xl border border-slate-100 p-5 flex gap-4">
          <AvatarBubble name={r.author_name} color={r.avatar_color} size={34} />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm text-slate-900">{r.author_name}</p>
              <button onClick={() => flag('reply', r.id)} className="p-1 text-slate-300 hover:text-red-400 transition-colors"><Flag size={13} /></button>
            </div>
            <p className="text-slate-600 text-sm mt-1 leading-relaxed">{r.content}</p>
          </div>
        </div>
      ))}

      <form onSubmit={postReply} className="bg-white rounded-2xl border border-slate-200 p-5">
        <label className="block text-sm font-semibold text-slate-700 mb-3">Add a Reply</label>
        <textarea required value={reply} onChange={e => setReply(e.target.value)} placeholder="Share your thoughts…"
          className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24" />
        <div className="flex items-center justify-between mt-3">
          <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer">
            <input type="checkbox" checked={replyAnon} onChange={e => setReplyAnon(e.target.checked)} className="rounded" />
            Post anonymously
          </label>
          <button type="submit" className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">
            <Send size={14} /> Reply
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Community Forum</h2>
          <p className="text-slate-500 text-sm mt-1">Ask questions, share advice, and find support.</p>
        </div>
        <button onClick={() => setShowNew(p => !p)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">
          <Plus size={15} /> New Post
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${category === c ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {c}
          </button>
        ))}
      </div>

      {showNew && (
        <form onSubmit={createThread} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h3 className="font-semibold text-slate-900">Start a New Discussion</h3>
          <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Title"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <textarea required value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Share your question or story…"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-28" />
          <div className="flex gap-3 flex-wrap items-center">
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize">
              {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer">
              <input type="checkbox" checked={form.is_anonymous} onChange={e => setForm(p => ({ ...p, is_anonymous: e.target.checked }))} className="rounded" />
              Post anonymously
            </label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">Post</button>
            <button type="button" onClick={() => setShowNew(false)} className="px-5 py-2 rounded-xl border border-slate-200 text-sm hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {threads.length === 0
          ? <div className="text-center py-16 text-slate-400"><p>No posts yet. Be the first to share!</p></div>
          : threads.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <button onClick={() => setActive(t)} className="w-full text-left bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all group">
                <div className="flex items-start gap-4">
                  <AvatarBubble name={t.author_name} color={t.avatar_color} size={38} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{t.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{t.author_name} · <span className="capitalize">{t.category}</span> · {new Date(t.created_at).toLocaleDateString()}</p>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{t.content}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                  <span>{t.reply_count || 0} replies</span>
                  <span>{t.upvotes || 0} upvotes</span>
                  {t.is_anonymous === 1 && <span className="flex items-center gap-1"><EyeOff size={11} /> Anonymous</span>}
                </div>
              </button>
            </motion.div>
          ))}
      </div>
    </div>
  );
}
