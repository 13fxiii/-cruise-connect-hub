// @ts-nocheck
'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, Send, X, Loader2, RefreshCw } from 'lucide-react';
import { api } from '@appdeploy/client';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/layout/BottomNav';
import { useAuth } from '@/components/auth/AuthProvider';

function timeAgo(iso: string | number) {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60000) return 'now';
  if (d < 3600000) return `${Math.floor(d / 60000)}m`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h`;
  return `${Math.floor(d / 86400000)}d`;
}

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLd] = useState(true);
  const [compose, setCp] = useState(false);
  const [newPost, setNp] = useState('');
  const [posting, setPg] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [profile, setProf] = useState<any>(null);

  const load = useCallback(async () => {
    setLd(true);
    try {
      const { data } = await api.get('/api/posts');
      setPosts(data?.posts || []);
    } finally {
      setLd(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(), 10000);
    return () => window.clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (!user) return;
    api.get('/api/profile').then(({ data }) => setProf(data)).catch(() => setProf(null));
  }, [user]);

  const submit = async () => {
    if (!newPost.trim() || posting) return;
    setPg(true);
    try {
      await api.post('/api/posts', { content: newPost.trim() });
      setNp(''); setCp(false);
      await load();
    } catch (err: any) {
      alert('Could not post: ' + (err?.message || 'Please try again'));
    } finally {
      setPg(false);
    }
  };

  const toggleLike = async (id: string, liked_: boolean) => {
    setLiked(prev => { const s = new Set(prev); liked_ ? s.delete(id) : s.add(id); return s; });
    setPosts(prev => prev.map(p => p.id === id
      ? { ...p, likesCount: Math.max(0, Number(p.likesCount || 0) + (liked_ ? -1 : 1)) } : p));
    try {
      if (liked_) await api.delete(`/api/posts/${id}/like`);
      else await api.post(`/api/posts/${id}/like`, {});
    } catch {
      setLiked(prev => { const s = new Set(prev); liked_ ? s.add(id) : s.delete(id); return s; });
      await load();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <AppHeader showSearch action={
        <button onClick={() => setCp(true)} className="px-3 py-1.5 bg-yellow-400 text-black text-xs font-black rounded-full active:scale-95">Post</button>
      } />

      {compose && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end" onClick={() => setCp(false)}>
          <div className="w-full bg-zinc-900 rounded-t-3xl p-5 pb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              {profile?.picture
                ? <img src={profile.picture} className="w-9 h-9 rounded-full object-cover" alt="" />
                : <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-300">{(profile?.name || user?.name || '?')[0].toUpperCase()}</div>}
              <span className="font-bold text-white text-sm">{profile?.name || user?.name || 'Cruiser'}</span>
              <button onClick={() => setCp(false)} className="ml-auto text-zinc-500 p-1"><X className="w-5 h-5" /></button>
            </div>
            <textarea autoFocus className="w-full bg-transparent text-white placeholder-zinc-600 text-base resize-none outline-none min-h-[100px]" placeholder="What's the cruise today? 🚌" value={newPost} onChange={e => setNp(e.target.value)} maxLength={500} />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
              <span className="text-xs text-zinc-600">{500 - newPost.length} left</span>
              <button disabled={!newPost.trim() || posting} onClick={submit} className="flex items-center gap-2 px-5 py-2 bg-yellow-400 text-black font-black text-sm rounded-full disabled:opacity-40 active:scale-95">
                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}{posting ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto">
        <DailyTheme />
        <CommunityReminders />
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 text-yellow-400 animate-spin" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="text-4xl mb-3">🚌</div><p className="text-white font-bold text-lg mb-1">No posts yet</p><p className="text-zinc-500 text-sm mb-6">Be the first to cruise today</p>
            <button onClick={() => setCp(true)} className="px-6 py-2.5 bg-yellow-400 text-black font-black rounded-full text-sm">Post something</button>
          </div>
        ) : (
          <>
            <button onClick={() => void load()} className="flex items-center gap-2 mx-auto py-3 text-zinc-600 text-xs active:text-zinc-400"><RefreshCw className="w-3.5 h-3.5" /> Refresh</button>
            {posts.map(post => <PostCard key={post.id} post={post} userId={user?.userId || user?.id || ''} liked={liked.has(post.id)} onLike={toggleLike} />)}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

function DailyTheme() {
  const [theme, setTheme] = useState<any>(null);
  useEffect(() => { api.get('/api/daily-theme').then(({ data }) => setTheme(data)).catch(() => {}); }, []);
  if (!theme?.theme) return null;
  return <div className="mx-4 mt-3 mb-1 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl px-4 py-3 flex items-center gap-3"><span className="text-2xl">{theme.emoji || '✨'}</span><div className="min-w-0"><p className="text-yellow-400 font-black text-xs tracking-wider">TODAY'S THEME</p><p className="text-white font-bold text-sm truncate">{theme.theme}</p></div></div>;
}

function CommunityReminders() {
  const items = [{ label: 'Listening Party', emoji: '🎧', when: 'Tonight · 9:00 PM' }, { label: 'Movie Night', emoji: '🎬', when: 'Friday · 8:30 PM' }, { label: 'Hangout', emoji: '🚌', when: 'Saturday · 5:00 PM' }, { label: 'Tournament', emoji: '🏆', when: 'Sunday · 4:00 PM' }];
  return <div className="mx-4 mt-3 mb-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5"><p className="text-zinc-300 text-xs font-black tracking-wide mb-2">UP NEXT</p><div className="space-y-1.5">{items.map(it => <div key={it.label} className="flex items-center justify-between text-xs"><p className="text-zinc-200"><span className="mr-1">{it.emoji}</span>{it.label}</p><p className="text-zinc-500">{it.when}</p></div>)}</div></div>;
}

function PostCard({ post, userId, liked, onLike }: any) {
  const name = post.authorName || 'Member';
  const avatar = post.authorPicture;
  const authorId = post.authorId || '';
  return (
    <article className="border-b border-zinc-900 px-4 py-4 active:bg-zinc-900/30">
      <div className="flex gap-3">
        <Link href={authorId ? `/profile/${authorId}` : '/profile'} className="shrink-0">
          {avatar ? <img src={avatar} className="w-10 h-10 rounded-full object-cover" alt={name} /> : <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-400">{name[0].toUpperCase()}</div>}
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap"><Link href={authorId ? `/profile/${authorId}` : '/profile'} className="font-bold text-white text-sm hover:underline">{name}</Link><span className="text-zinc-700 text-xs">·</span><span className="text-zinc-600 text-xs">{timeAgo(post.createdAt)}</span></div>
          <p className="text-zinc-100 text-sm mt-1.5 leading-relaxed break-words">{post.content}</p>
          {post.imageUrl && <img src={post.imageUrl} alt="" className="mt-2.5 rounded-2xl w-full object-cover max-h-72 border border-zinc-800" />}
          <div className="flex items-center gap-5 mt-3 -ml-1">
            <button onClick={() => onLike(post.id, liked)} className={`flex items-center gap-1.5 text-xs font-medium p-1 rounded-full transition-all active:scale-90 ${liked ? 'text-red-400' : 'text-zinc-500 hover:text-red-400'}`}><Heart className={`w-4.5 h-4.5 ${liked ? 'fill-red-400' : ''}`} /><span>{Number(post.likesCount || 0) > 0 ? post.likesCount : ''}</span></button>
            <Link href={`/posts/${post.id}`} className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-blue-400 p-1 transition-colors"><MessageCircle className="w-4.5 h-4.5" /><span>{Number(post.commentsCount || 0) > 0 ? post.commentsCount : ''}</span></Link>
            <button className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-green-400 p-1 transition-colors"><Share2 className="w-4.5 h-4.5" /></button>
          </div>
        </div>
      </div>
    </article>
  );
}
