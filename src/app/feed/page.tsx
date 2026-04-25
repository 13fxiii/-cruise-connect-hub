// @ts-nocheck
'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
         Image as Img, Smile, Send, X, Loader2, RefreshCw } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/layout/BottomNav';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60000) return 'now';
  if (d < 3600000) return `${Math.floor(d / 60000)}m`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h`;
  return `${Math.floor(d / 86400000)}d`;
}

export default function FeedPage() {
  const { user }         = useAuth();
  const [posts, setPosts]  = useState<any[]>([]);
  const [loading, setLd]   = useState(true);
  const [compose, setCp]   = useState(false);
  const [newPost, setNp]   = useState('');
  const [posting, setPg]   = useState(false);
  const [liked, setLiked]  = useState<Set<string>>(new Set());
  const [profile, setProf] = useState<any>(null);
  const supabase = createClient();

  const load = useCallback(async () => {
    setLd(true);
    const r = await fetch('/api/posts');
    const d = await r.json();
    setPosts(d.posts || []);
    setLd(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const reloadFeed = async () => {
      await load();
    };

    const channel = supabase
      .channel('feed-live-posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        reloadFeed
      )
    const channel = supabase
      .channel('feed-live-posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, load)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('avatar_url,display_name,username')
      .eq('id', user.id).single().then(({ data }) => setProf(data));
  }, [user]);

  const submit = async () => {
    if (!newPost.trim() || posting) return;
    setPg(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPost.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to post');
      }
      setNp(''); setCp(false);
      load();
    } catch (err: any) {
      alert('Could not post: ' + err.message);
    }
    setPg(false);
  };

  const toggleLike = async (id: string, liked_: boolean) => {
    setLiked(prev => { const s = new Set(prev); liked_ ? s.delete(id) : s.add(id); return s; });
    setPosts(prev => prev.map(p => p.id === id
      ? { ...p, likes_count: p.likes_count + (liked_ ? -1 : 1) } : p));
    await fetch(`/api/posts/${id}/like`, { method: liked_ ? 'DELETE' : 'POST' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <AppHeader showSearch action={
        <button onClick={() => setCp(true)} className="px-3 py-1.5 bg-yellow-400 text-black text-xs font-black rounded-full active:scale-95">
          Post
        </button>
      } />

      {/* Compose sheet */}
      {compose && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end" onClick={() => setCp(false)}>
          <div className="w-full bg-zinc-900 rounded-t-3xl p-5 pb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} className="w-9 h-9 rounded-full object-cover" alt="" />
                : <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-300">
                    {(profile?.display_name || profile?.username || user?.email || '?')[0].toUpperCase()}
                  </div>}
              <span className="font-bold text-white text-sm">{profile?.display_name || profile?.username}</span>
              <button onClick={() => setCp(false)} className="ml-auto text-zinc-500 p-1"><X className="w-5 h-5" /></button>
            </div>
            <textarea
              autoFocus
              className="w-full bg-transparent text-white placeholder-zinc-600 text-base resize-none outline-none min-h-[100px]"
              placeholder="What's the cruise today? 🚌"
              value={newPost}
              onChange={e => setNp(e.target.value)}
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
              <span className="text-xs text-zinc-600">{500 - newPost.length} left</span>
              <button
                disabled={!newPost.trim() || posting}
                onClick={submit}
                className="flex items-center gap-2 px-5 py-2 bg-yellow-400 text-black font-black text-sm rounded-full disabled:opacity-40 active:scale-95">
                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {posting ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="max-w-lg mx-auto">
        {/* Daily theme banner */}
        <DailyTheme />

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 text-yellow-400 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="text-4xl mb-3">🚌</div>
            <p className="text-white font-bold text-lg mb-1">No posts yet</p>
            <p className="text-zinc-500 text-sm mb-6">Be the first to cruise today</p>
            <button onClick={() => setCp(true)} className="px-6 py-2.5 bg-yellow-400 text-black font-black rounded-full text-sm">
              Post something
            </button>
          </div>
        ) : (
          <>
            {/* Refresh pull hint */}
            <button onClick={load} className="flex items-center gap-2 mx-auto py-3 text-zinc-600 text-xs active:text-zinc-400">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            {posts.map(post => (
              <PostCard key={post.id} post={post} userId={user?.id || ''} liked={liked.has(post.id)} onLike={toggleLike} />
            ))}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

function DailyTheme() {
  const [theme, setTheme] = useState<any>(null);
  useEffect(() => {
    fetch('/api/daily-theme').then(r => r.json()).then(d => setTheme(d));
  }, []);
  if (!theme?.theme) return null;
  return (
    <div className="mx-4 mt-3 mb-1 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl px-4 py-3 flex items-center gap-3">
      <span className="text-2xl">{theme.emoji || '✨'}</span>
      <div className="min-w-0">
        <p className="text-yellow-400 font-black text-xs tracking-wider">TODAY'S THEME</p>
        <p className="text-white font-bold text-sm truncate">{theme.theme}</p>
      </div>
    </div>
  );
}

function PostCard({ post, userId, liked, onLike }: any) {
  const name   = post.profiles?.display_name || post.profiles?.username || 'Member';
  const handle = post.profiles?.username || 'user';
  const avatar = post.profiles?.avatar_url;
  const isOwn  = post.author_id === userId;

  return (
    <article className="border-b border-zinc-900 px-4 py-4 active:bg-zinc-900/30">
      <div className="flex gap-3">
        {/* Avatar */}
        <Link href={`/profile/${handle}`} className="shrink-0">
          {avatar
            ? <img src={avatar} className="w-10 h-10 rounded-full object-cover" alt={name} />
            : <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-400">
                {name[0].toUpperCase()}
              </div>}
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link href={`/profile/${handle}`} className="font-bold text-white text-sm hover:underline">{name}</Link>
            <span className="text-zinc-600 text-xs">@{handle}</span>
            <span className="text-zinc-700 text-xs">·</span>
            <span className="text-zinc-600 text-xs">{timeAgo(post.created_at)}</span>
          </div>

          {/* Content */}
          <p className="text-zinc-100 text-sm mt-1.5 leading-relaxed break-words">{post.content}</p>

          {/* Image */}
          {post.image_url && (
            <img src={post.image_url} alt="" className="mt-2.5 rounded-2xl w-full object-cover max-h-72 border border-zinc-800" />
          )}

          {/* Actions */}
          <div className="flex items-center gap-5 mt-3 -ml-1">
            <button
              onClick={() => onLike(post.id, liked)}
              className={`flex items-center gap-1.5 text-xs font-medium p-1 rounded-full transition-all active:scale-90 ${
                liked ? 'text-red-400' : 'text-zinc-500 hover:text-red-400'}`}>
              <Heart className={`w-4.5 h-4.5 ${liked ? 'fill-red-400' : ''}`} />
              <span>{(post.likes_count || 0) > 0 ? post.likes_count : ''}</span>
            </button>
            <Link href={`/posts/${post.id}`} className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-blue-400 p-1 transition-colors">
              <MessageCircle className="w-4.5 h-4.5" />
              <span>{(post.replies_count || 0) > 0 ? post.replies_count : ''}</span>
            </Link>
            <button className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-green-400 p-1 transition-colors">
              <Share2 className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
