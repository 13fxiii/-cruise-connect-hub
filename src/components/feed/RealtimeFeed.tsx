"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Rss, RefreshCw, Bell, Zap, ChevronDown } from "lucide-react";

type Post = {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  profiles: { display_name: string; username: string; avatar_url?: string; twitter_handle?: string } | null;
};

export default function RealtimeFeed({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [newCount, setNewCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval>>();
  const latestCreatedAt = useRef(initialPosts[0]?.created_at || new Date().toISOString());

  const fetchNew = useCallback(async (silent = true) => {
    try {
      const res = await fetch(`/api/posts?limit=5`);
      const data = await res.json();
      if (!data.posts) return;
      const newest = data.posts.filter((p: Post) => p.created_at > latestCreatedAt.current && !p.is_pinned);
      if (newest.length > 0 && silent) {
        setNewCount(c => c + newest.length);
      }
    } catch { /**/ }
  }, []);

  const loadFresh = async () => {
    setLoading(true);
    setNewCount(0);
    try {
      const res = await fetch("/api/posts?limit=30");
      const data = await res.json();
      if (data.posts?.length > 0) {
        setPosts(data.posts);
        latestCreatedAt.current = data.posts[0].created_at;
      }
    } catch { /**/ }
    setLoading(false);
  };

  // Poll for new posts every 15 seconds
  useEffect(() => {
    pollingRef.current = setInterval(() => fetchNew(true), 15000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [fetchNew]);

  if (posts.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
        <Rss className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
        <p className="text-zinc-500">No posts yet. Be the first to post!</p>
      </div>
    );
  }

  return (
    <div>
      {/* New posts banner */}
      {newCount > 0 && (
        <button onClick={loadFresh}
          className="w-full mb-4 bg-yellow-400/10 border border-yellow-400/30 hover:bg-yellow-400/20 rounded-xl py-2.5 text-yellow-400 text-sm font-bold transition-all flex items-center justify-center gap-2 animate-pulse">
          <Bell className="w-4 h-4" />
          {newCount} new post{newCount > 1 ? "s" : ""} — tap to refresh
        </button>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCardInline key={post.id} post={post} />
        ))}
      </div>

      {/* Load more */}
      <div className="flex justify-center mt-6">
        <button onClick={loadFresh} disabled={loading}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Loading..." : "Refresh feed"}
        </button>
      </div>
    </div>
  );
}

function PostCardInline({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes_count);

  const toggleLike = async () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    try {
      await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
    } catch { /**/ }
  };

  const author = post.profiles;
  const initials = author?.display_name?.slice(0, 2).toUpperCase() || "CC";
  const timeAgo = getTimeAgo(post.created_at);

  return (
    <div className={`bg-zinc-900 border rounded-2xl p-4 transition-all ${post.is_pinned ? "border-yellow-400/30 bg-yellow-400/5" : "border-zinc-800 hover:border-zinc-700"}`}>
      {post.is_pinned && (
        <div className="flex items-center gap-1.5 text-yellow-400 text-xs font-bold mb-3">
          <Zap className="w-3 h-3" /> Pinned Post
        </div>
      )}
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400/30 to-yellow-600/10 border border-zinc-700 flex items-center justify-center text-yellow-400 text-sm font-black flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-bold text-white text-sm">{author?.display_name || "Anonymous"}</span>
            {author?.twitter_handle && (
              <span className="text-zinc-500 text-xs">@{author.twitter_handle}</span>
            )}
            <span className="text-zinc-600 text-xs ml-auto">{timeAgo}</span>
          </div>
          <p className="text-zinc-200 text-sm mt-1.5 leading-relaxed whitespace-pre-wrap">{post.content}</p>

          <div className="flex items-center gap-4 mt-3">
            <button onClick={toggleLike}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${liked ? "text-red-400" : "text-zinc-500 hover:text-red-400"}`}>
              <span>{liked ? "❤️" : "🤍"}</span> {likeCount}
            </button>
            <span className="flex items-center gap-1.5 text-xs text-zinc-500">
              💬 {post.comments_count}
            </span>
            <button className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors ml-auto">
              Share ↗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(iso: string) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`;
  return `${Math.floor(secs / 86400)}d`;
}
