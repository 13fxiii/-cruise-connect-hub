"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Rss, Heart, MessageCircle, Share2, MoreHorizontal,
  Send, Loader2, RefreshCw, Pin, TrendingUp, Users,
  Music, Gamepad2, Radio, Zap
} from "lucide-react";

const REACTIONS = ["🔥","👀","💯","😭","🚀","❤️","😂","👏"];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000)  return "just now";
  if (diff < 3600000) return `${Math.floor(diff/60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff/3600000)}h`;
  return `${Math.floor(diff/86400000)}d`;
}

function Avatar({ profile, size = 36 }: { profile: any; size?: number }) {
  const letter = (profile?.display_name || profile?.username || "U").charAt(0).toUpperCase();
  return profile?.avatar_url ? (
    <img src={profile.avatar_url} alt=""
      style={{ width: size, height: size }}
      className="rounded-full object-cover flex-shrink-0 border-2 border-zinc-800" />
  ) : (
    <div
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className="rounded-full bg-yellow-400 flex items-center justify-center text-black font-black flex-shrink-0 border-2 border-zinc-800">
      {letter}
    </div>
  );
}

function PostCard({ post, currentUserId, onLike }: { post: any; currentUserId?: string; onLike: (id: string) => void }) {
  const [showComments, setShowComments]   = useState(false);
  const [comments, setComments]           = useState<any[]>([]);
  const [loadingCmts, setLoadingCmts]     = useState(false);
  const [commentText, setCommentText]     = useState("");
  const [posting, setPosting]             = useState(false);
  const [localLiked, setLocalLiked]       = useState(post.userLiked);
  const [localLikes, setLocalLikes]       = useState(post.likes_count || 0);
  const [showReactions, setShowReactions] = useState(false);

  const loadComments = useCallback(async () => {
    if (comments.length > 0) return;
    setLoadingCmts(true);
    const data = await fetch(`/api/comments?post_id=${post.id}`).then(r => r.json());
    setComments(data.comments || []);
    setLoadingCmts(false);
  }, [post.id, comments.length]);

  const toggleComments = () => {
    if (!showComments) loadComments();
    setShowComments(!showComments);
  };

  const handleLike = async () => {
    const wasLiked = localLiked;
    setLocalLiked(!wasLiked);
    setLocalLikes((n: number) => wasLiked ? n - 1 : n + 1);
    onLike(post.id);
    await fetch(`/api/posts/${post.id}/like`, { method: wasLiked ? 'DELETE' : 'POST' });
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || posting) return;
    setPosting(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: post.id, content: commentText.trim() }),
    });
    const data = await res.json();
    if (res.ok && data.comment) {
      setComments(c => [...c, data.comment]);
      setCommentText("");
    }
    setPosting(false);
  };

  const profile = post.profiles;

  return (
    <article className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <Avatar profile={profile} size={40} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-black text-sm">{profile?.display_name || profile?.username}</span>
            {profile?.twitter_handle && (
              <span className="text-zinc-500 text-xs">@{profile.twitter_handle}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-zinc-600 text-xs mt-0.5">
            <span>{timeAgo(post.created_at)}</span>
            {post.is_pinned && <span className="flex items-center gap-1 text-yellow-500"><Pin className="w-2.5 h-2.5" /> Pinned</span>}
          </div>
        </div>
        <button className="text-zinc-600 hover:text-zinc-400 p-1"><MoreHorizontal className="w-4 h-4" /></button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {post.tags.map((t: string) => (
              <span key={t} className="text-yellow-400 text-xs font-bold">#{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Media */}
      {post.media_urls?.length > 0 && (
        <div className={`grid gap-1 px-4 pb-3 ${post.media_urls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {post.media_urls.slice(0,4).map((url: string, i: number) => (
            <img key={i} src={url} alt="" className="rounded-xl object-cover w-full aspect-video" />
          ))}
        </div>
      )}

      {/* Reactions row */}
      <div className="px-4 pb-3 flex items-center gap-3">
        <div className="relative">
          <button onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setShowReactions(false)}
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${localLiked ? "text-red-400" : "text-zinc-500 hover:text-red-400"}`}>
            <Heart className={`w-4 h-4 ${localLiked ? "fill-current" : ""}`} /> {localLikes}
          </button>
          {showReactions && (
            <div className="absolute bottom-6 left-0 bg-zinc-900 border border-zinc-800 rounded-2xl px-2 py-1 flex gap-1 z-10 shadow-xl"
              onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setShowReactions(false)}>
              {REACTIONS.map(emoji => (
                <button key={emoji} className="text-lg hover:scale-125 transition-transform p-0.5"
                  onClick={() => { setShowReactions(false); }}>{emoji}</button>
              ))}
            </div>
          )}
        </div>
        <button onClick={toggleComments}
          className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${showComments ? "text-yellow-400" : "text-zinc-500 hover:text-yellow-400"}`}>
          <MessageCircle className="w-4 h-4" /> {post.comments_count || 0}
        </button>
        <button onClick={() => { navigator.share?.({ text: post.content }); }}
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-blue-400 transition-colors ml-auto">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-zinc-800/60 px-4 py-3 space-y-3">
          {loadingCmts ? (
            <div className="flex justify-center py-3"><Loader2 className="w-4 h-4 animate-spin text-zinc-600" /></div>
          ) : comments.length === 0 ? (
            <p className="text-zinc-600 text-xs text-center py-2">No comments yet — be first!</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {comments.map(c => (
                <div key={c.id} className="flex gap-2.5">
                  <Avatar profile={c.profiles} size={28} />
                  <div className="flex-1">
                    <div className="bg-zinc-900 rounded-xl px-3 py-2">
                      <span className="text-white font-bold text-xs">{c.profiles?.display_name || c.profiles?.username} </span>
                      <span className="text-zinc-300 text-xs">{c.content}</span>
                    </div>
                    <span className="text-zinc-600 text-[10px] ml-2 mt-0.5 block">{timeAgo(c.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentUserId && (
            <form onSubmit={submitComment} className="flex gap-2">
              <input value={commentText} onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment..." maxLength={500}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5 text-white text-xs outline-none focus:border-yellow-400" />
              <button type="submit" disabled={posting || !commentText.trim()}
                className="bg-yellow-400 text-black rounded-full p-1.5 hover:bg-yellow-300 disabled:opacity-40">
                {posting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              </button>
            </form>
          )}
        </div>
      )}
    </article>
  );
}

function CreatePost({ onPost }: { onPost: (p: any) => void }) {
  const { user } = useAuth();
  const [text, setText]       = useState("");
  const [posting, setPosting] = useState(false);

  if (!user) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || posting) return;
    setPosting(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text.trim() }),
    });
    const data = await res.json();
    if (res.ok && data.post) {
      onPost(data.post);
      setText("");
    }
    setPosting(false);
  };

  return (
    <form onSubmit={submit} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
      <textarea value={text} onChange={e => setText(e.target.value)} maxLength={2000} rows={3}
        placeholder="What's the cruise today? 🚌"
        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400 resize-none placeholder:text-zinc-600" />
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold ${text.length > 1800 ? "text-red-400" : "text-zinc-600"}`}>{text.length}/2000</span>
        <button type="submit" disabled={posting || !text.trim()}
          className="bg-yellow-400 text-black font-black px-4 py-2 rounded-xl text-xs hover:bg-yellow-300 disabled:opacity-40 flex items-center gap-2">
          {posting ? <><Loader2 className="w-3 h-3 animate-spin" />Posting...</> : <><Send className="w-3 h-3" />Post</>}
        </button>
      </div>
    </form>
  );
}

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts]         = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLMore]   = useState(false);
  const [cursor, setCursor]       = useState<string|null>(null);
  const [hasMore, setHasMore]     = useState(true);
  const [newCount, setNewCount]   = useState(0);
  const observerRef               = useRef<IntersectionObserver|null>(null);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const supabase                  = createClient();

  const loadPosts = useCallback(async (since?: string) => {
    const url = `/api/posts?limit=15${since ? `&cursor=${since}` : ""}`;
    const data = await fetch(url).then(r => r.json());
    return data.posts || [];
  }, []);

  // Initial load
  useEffect(() => {
    loadPosts().then(p => {
      setPosts(p);
      setCursor(p[p.length - 1]?.created_at || null);
      setHasMore(p.length >= 15);
      setLoading(false);
    });
  }, [loadPosts]);

  // Realtime subscription for new posts
  useEffect(() => {
    const channel = supabase
      .channel('feed-realtime')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'posts',
        filter: 'status=eq.published',
      }, () => {
        setNewCount(n => n + 1);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Infinite scroll
  useEffect(() => {
    if (!bottomRef.current) return;
    observerRef.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loadingMore) {
        setLMore(true);
        loadPosts(cursor || undefined).then(p => {
          if (p.length < 15) setHasMore(false);
          setPosts(prev => {
            const existingIds = new Set(prev.map((x: any) => x.id));
            const newPosts = p.filter((x: any) => !existingIds.has(x.id));
            return [...prev, ...newPosts];
          });
          setCursor(p[p.length - 1]?.created_at || null);
          setLMore(false);
        });
      }
    }, { threshold: 0.1 });
    observerRef.current.observe(bottomRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, cursor, loadPosts]);

  const handleLike = (id: string) => {
    setPosts(ps => ps.map(p => p.id === id ? { ...p, userLiked: !p.userLiked, likes_count: p.userLiked ? p.likes_count - 1 : p.likes_count + 1 } : p));
  };

  const handleNewPost = (post: any) => {
    setPosts(ps => [post, ...ps]);
  };

  const refreshFeed = async () => {
    setNewCount(0);
    setLoading(true);
    const p = await loadPosts();
    setPosts(p);
    setCursor(p[p.length - 1]?.created_at || null);
    setHasMore(p.length >= 15);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">

          {/* FEED */}
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-black text-white flex items-center gap-2">
                <Rss className="w-5 h-5 text-yellow-400" /> Community Feed
              </h1>
              <button onClick={refreshFeed} className="text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* New posts banner */}
            {newCount > 0 && (
              <button onClick={refreshFeed}
                className="w-full flex items-center justify-center gap-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 font-bold text-sm py-2.5 rounded-xl hover:bg-yellow-400/20 transition-all">
                <RefreshCw className="w-4 h-4" /> {newCount} new post{newCount > 1 ? "s" : ""} — tap to refresh
              </button>
            )}

            {/* Create post */}
            <CreatePost onPost={handleNewPost} />

            {/* Posts */}
            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3 animate-pulse">
                    <div className="flex gap-3"><div className="w-10 h-10 bg-zinc-800 rounded-full" /><div className="space-y-2"><div className="w-32 h-3 bg-zinc-800 rounded" /><div className="w-20 h-2 bg-zinc-800 rounded" /></div></div>
                    <div className="space-y-2"><div className="h-3 bg-zinc-800 rounded w-full" /><div className="h-3 bg-zinc-800 rounded w-3/4" /></div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16">
                <Rss className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500">Feed is quiet — be the first to post!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <PostCard key={post.id} post={post} currentUserId={user?.id} onLike={handleLike} />
                ))}
              </div>
            )}

            {/* Infinite scroll sentinel */}
            <div ref={bottomRef} className="h-4" />
            {loadingMore && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-yellow-400" />
              </div>
            )}
            {!hasMore && posts.length > 0 && (
              <p className="text-zinc-700 text-xs text-center py-4">You've seen it all 🚌</p>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="hidden md:block space-y-4">
            {/* Quick Nav */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2">
              <div className="text-zinc-500 text-xs font-bold mb-3">QUICK ACCESS</div>
              {[
                { href:"/spaces",  icon:Radio,    label:"Live Spaces",    badge:"LIVE" },
                { href:"/games",   icon:Gamepad2, label:"Play Games",     badge:null  },
                { href:"/music",   icon:Music,    label:"Music Hub",      badge:"NEW" },
                { href:"/earn",    icon:Zap,      label:"Earn Points",    badge:null  },
                { href:"/dao",     icon:Users,    label:"DAO Voting",     badge:null  },
              ].map(({ href, icon: Icon, label, badge }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors text-sm font-medium">
                  <Icon className="w-4 h-4 text-yellow-400" />
                  {label}
                  {badge && <span className="ml-auto text-[10px] font-black bg-yellow-400/20 text-yellow-400 px-1.5 py-0.5 rounded-full">{badge}</span>}
                </Link>
              ))}
            </div>

            {/* Trending */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-yellow-400" />
                <span className="text-zinc-500 text-xs font-bold">TRENDING TAGS</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["#NaijaMusic","#CCHub","#AfroBeats","#GamingNaija","#CruiseVibes","#NaijaTwitter","#BigCruise","#CCHubDAO"].map(tag => (
                  <span key={tag} className="text-yellow-400 text-xs font-bold bg-yellow-400/10 px-2 py-1 rounded-full hover:bg-yellow-400/20 cursor-pointer transition-colors">{tag}</span>
                ))}
              </div>
            </div>

            {/* Community links */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2">
              <div className="text-zinc-500 text-xs font-bold mb-2">COMMUNITY</div>
              {[
                { href:"/marketplace", label:"🛒 Marketplace" },
                { href:"/ai-tools",    label:"✨ AI Tools" },
                { href:"/analytics",   label:"📊 My Analytics" },
                { href:"/sponsors",    label:"💼 Sponsorships" },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="block text-zinc-400 text-xs hover:text-yellow-400 transition-colors py-0.5">{label}</Link>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
