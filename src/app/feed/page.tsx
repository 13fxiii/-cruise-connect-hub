import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import CreatePost from "@/components/feed/CreatePost";
import PostCard from "@/components/feed/PostCard";
import { Rss, TrendingUp, Users, Zap, Megaphone } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getPosts(userId?: string) {
  const { data: rawPosts } = await supabaseAdmin
    .from("posts")
    .select(`
      id, content, created_at, likes_count, comments_count, is_pinned, media_urls,
      profiles!inner(id, display_name, username, avatar_url, twitter_handle)
    `)
    .eq("status", "published")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(30);

  const posts = (rawPosts || []) as any[];

  if (!userId) return posts;

  const { data: likes } = await supabaseAdmin
    .from("post_likes")
    .select("post_id")
    .eq("user_id", userId)
    .in("post_id", posts.map((p) => p.id));

  const likedSet = new Set((likes || []).map((l: any) => l.post_id));
  return posts.map((p) => ({ ...p, userLiked: likedSet.has(p.id) }));
}

export default async function FeedPage() {
  const session = await auth();
  const posts = await getPosts(session?.user?.id);

  return (
    <div className="min-h-screen bg-cch-black">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
          {/* Main Feed */}
          <div>
            {/* Feed Header */}
            <div className="flex items-center gap-2 mb-4">
              <Rss size={16} className="text-cch-gold" />
              <h1 className="font-bold text-white">Community Feed</h1>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse ml-1" />
            </div>

            {/* Create Post */}
            {session && <CreatePost />}

            {!session && (
              <div className="card mb-4 text-center py-6">
                <p className="text-cch-muted text-sm mb-3">Join to post and interact with the community</p>
                <Link href="/auth/signin" className="btn-gold text-sm inline-flex">
                  Join the Cruise 🚀
                </Link>
              </div>
            )}

            {/* Posts */}
            <div>
              {posts.length > 0 ? (
                posts.map((post: any) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={session?.user?.id}
                  />
                ))
              ) : (
                <div className="card text-center py-12">
                  <div className="text-4xl mb-3">🚌</div>
                  <p className="text-white font-semibold mb-1">No posts yet</p>
                  <p className="text-cch-muted text-sm">Be the first to share something with the Hub!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden md:block">
            {/* Community Stats */}
            <div className="card mb-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-cch-gold" />
                <h3 className="font-bold text-sm text-white">Hub Stats</h3>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Users, label: "Members", val: "15K+" },
                  { icon: Zap, label: "Posts Today", val: posts.length.toString() },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-cch-muted text-sm">
                      <s.icon size={13} />
                      {s.label}
                    </div>
                    <span className="text-cch-gold font-bold text-sm">{s.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Advertise CTA */}
            <div className="card border-cch-gold/30 bg-cch-gold/5">
              <div className="flex items-center gap-2 mb-2">
                <Megaphone size={14} className="text-cch-gold" />
                <h3 className="font-bold text-sm text-white">Promote with Us</h3>
              </div>
              <p className="text-cch-muted text-xs mb-3">
                Get your brand, music, or business in front of 15K+ members.
              </p>
              <div className="text-xs text-cch-gold font-semibold mb-3">From ₦20,000/day</div>
              <Link href="/ads" className="btn-gold text-sm w-full text-center block">
                Submit PR/AD
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
