import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { AvatarBubble } from '../App';

export default function Kites() {
  const { token, user } = useAuth();
  const [convos, setConvos] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [isAnon, setIsAnon] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConvos();
    const t = setInterval(fetchConvos, 10000);
    return () => clearInterval(t);
  }, [token]);

  useEffect(() => {
    if (active) { fetchThread(active.other_user_id); }
  }, [active]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchConvos = () =>
    fetch('/api/kites/conversations', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => Array.isArray(d) && setConvos(d)).catch(() => {});

  const fetchThread = (otherId: string) =>
    fetch(`/api/kites/thread/${otherId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => Array.isArray(d) && setMessages(d)).catch(() => {});

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !active) return;
    setSending(true);
    try {
      await fetch('/api/kites', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ receiverId: active.other_user_id, content: newMsg, is_anonymous: isAnon })
      });
      setNewMsg('');
      fetchThread(active.other_user_id);
      fetchConvos();
    } finally { setSending(false); }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (active) return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
        <button onClick={() => setActive(null)} className="p-2 rounded-xl hover:bg-slate-200 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <AvatarBubble name={active.other_user_name} color={active.avatar_color} size={36} />
        <span className="font-semibold text-slate-900">{active.other_user_name}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.map(m => {
          const mine = m.sender_id === user?.id;
          return (
            <div key={m.id} className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
              {!mine && <AvatarBubble name={m.is_anonymous ? '?' : m.sender_name} color={m.is_anonymous ? '#6B7280' : m.avatar_color} size={28} />}
              <div className={`max-w-xs px-4 py-3 rounded-2xl text-sm ${mine ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-900 rounded-bl-sm'}`}>
                {m.is_anonymous && !mine && <p className="text-[10px] text-slate-400 mb-1">Anonymous</p>}
                <p>{m.content}</p>
                <p className={`text-[10px] mt-1 ${mine ? 'text-indigo-200' : 'text-slate-400'}`}>{formatTime(m.timestamp)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="px-4 py-3 border-t border-slate-100 flex gap-2 items-center">
        <button type="button" onClick={() => setIsAnon(p => !p)} title={isAnon ? 'Anonymous mode on' : 'Anonymous mode off'}
          className={`p-2 rounded-xl transition-colors ${isAnon ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-100'}`}>
          {isAnon ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
        <input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder={isAnon ? 'Message anonymously…' : 'Type a message…'}
          className="flex-1 bg-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <button type="submit" disabled={sending || !newMsg.trim()}
          className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50">
          <Send size={15} />
        </button>
      </form>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Kites</h2>
        <p className="text-slate-500 text-sm mt-1">Private messages with other members.</p>
      </div>
      {convos.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Send size={40} className="mx-auto mb-3 opacity-30" />
          <p>No conversations yet. Send a kite from The Yard!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {convos.map(c => (
            <button key={c.other_user_id} onClick={() => setActive(c)}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left">
              <AvatarBubble name={c.other_user_name} color={c.avatar_color} size={44} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{c.other_user_name}</span>
                  <span className="text-xs text-slate-400">{new Date(c.last_message_time).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-slate-500 truncate mt-0.5">{c.last_message}</p>
              </div>
              {c.unread > 0 && <span className="w-5 h-5 bg-indigo-600 text-white text-[11px] rounded-full flex items-center justify-center font-bold shrink-0">{c.unread}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
