"use client";
import { useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface Post {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  profiles: {
    id: string;
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
    twitter_handle: string | null;
  };
  userLiked?: boolean;
}

interface PostCardProps {
  post: Post;
  currentUserId?: string;
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const [liked, setLiked] = useState(post.userLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (!currentUserId || liking) return;
    setLiking(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount(wasLiked ? likesCount - 1 : likesCount + 1);
    try {
      await fetch(`/api/posts/${post.id}/like`, {
        method: wasLiked ? "DELETE" : "POST",
      });
    } catch {
      setLiked(wasLiked);
      setLikesCount(post.likes_count);
    } finally {
      setLiking(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      await navigator.share({ title: "C&C Hub Post", url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const author = post.profiles;
  const displayName = author.display_name || author.username || "Community Member";
  const handle = author.twitter_handle ? `@${author.twitter_handle}` : author.username ? `@${author.username}` : null;

  return (
    <div className={`card mb-3 hover:border-cch-border/60 transition-colors ${post.is_pinned ? "border-cch-gold/40 bg-cch-gold/5" : ""}`}>
      {post.is_pinned && (
        <div className="text-xs text-cch-gold font-medium mb-2 flex items-center gap-1">
          📌 Pinned
        </div>
      )}

      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {author.avatar_url ? (
            <img src={author.avatar_url} alt={displayName} className="w-9 h-9 rounded-full border border-cch-border" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-cch-surface-2 border border-cch-border flex items-center justify-center">
              <User size={14} className="text-cch-muted" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div>
              <span className="font-semibold text-white text-sm">{displayName}</span>
              {handle && <span className="text-cch-muted text-xs ml-2">{handle}</span>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cch-muted text-xs">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
              <button className="text-cch-muted hover:text-white transition-colors">
                <MoreHorizontal size={14} />
              </button>
            </div>
          </div>

          {/* Content */}
          <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap break-words">
            {post.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-5 mt-3 pt-2">
            <button
              onClick={handleLike}
              disabled={!currentUserId}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                liked ? "text-red-400" : "text-cch-muted hover:text-red-400"
              } disabled:cursor-default`}
            >
              <Heart size={15} fill={liked ? "currentColor" : "none"} />
              <span>{likesCount > 0 ? likesCount : ""}</span>
            </button>

            <button className="flex items-center gap-1.5 text-cch-muted hover:text-blue-400 text-sm transition-colors">
              <MessageCircle size={15} />
              <span>{post.comments_count > 0 ? post.comments_count : ""}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-cch-muted hover:text-cch-gold text-sm transition-colors ml-auto"
            >
              <Share2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
