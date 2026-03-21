// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/layout/BottomNav';
import Link from 'next/link';
import { UserPlus, UserCheck, MessageCircle, Music2, FileText, Trophy, Loader2, ExternalLink } from 'lucide-react';

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 3600000) return `${Math.floor(d / 60000)}m`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h`;
  return `${Math.floor(d / 86400000)}d`;
}

export default function PublicProfilePage({ params }: { params: { id: string } }) {
  const { user }           = useAuth();
  const [profile, setPf]   = useState<any>(null);
  const [posts, setPosts]  = useState<any[]>([]);
  const [tracks, setTracks]= useState<any[]>([]);
  const [following, setFw] = useState(false);
  const [loading, setLd]   = useState(true);
  const [tab, setTab]      = useState<'posts'|'music'>('posts');
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      // Load by username or id
      const { data: pf } = await supabase.from('profiles')
        .select('*')
        .or(`username.eq.${params.id},id.eq.${params.id}`)
        .maybeSingle();

      if (!pf) { setLd(false); return; }
      setPf(pf);

      // Load posts
      const { data: ps } = await supabase.from('posts')
        .select('*').eq('author_id', pf.id)
        .order('created_at', { ascending: false }).limit(20);
      setPosts(ps || []);

      // Load tracks
      const { data: tr } = await supabase.from('music_tracks')
        .select('*').eq('user_id', pf.id)
        .order('created_at', { ascending: false }).limit(10);
      setTracks(tr || []);

      // Check if following
      if (user && user.id !== pf.id) {
        const { data: fw } = await supabase.from('follows')
          .select('id').eq('follower_id', user.id).eq('following_id', pf.id).maybeSingle();
        setFw(!!fw);
      }

      setLd(false);
    };
    load();
  }, [params.id, user]);

  const toggleFollow = async () => {
    if (!user || !profile) return;
    const wasFollowing = following;
    setFw(!wasFollowing);
    setPf((p: any) => ({ ...p, followers_count: (p.followers_count || 0) + (wasFollowing ? -1 : 1) }));
    await fetch('/api/follow', {
      method: wasFollowing ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ following_id: profile.id }),
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <Loader2 className="w-7 h-7 text-yellow-400 animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-3">
      <div className="text-4xl">🔍</div>
      <p className="text-white font-bold">User not found</p>
      <Link href="/search" className="text-yellow-400 text-sm">Search members</Link>
    </div>
  );

  const isMe = user?.id === profile.id;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <AppHeader back />

      {/* Cover */}
      <div className="h-28 bg-gradient-to-br from-yellow-500/20 via-zinc-900 to-zinc-900 relative">
        {profile.cover_url && <img src={profile.cover_url} className="w-full h-full object-cover" alt="" />}
      </div>

      {/* Profile info */}
      <div className="px-4 pb-4">
        <div className="flex items-end justify-between -mt-9 mb-3">
          <div className="w-18 h-18 rounded-2xl overflow-hidden border-4 border-[#0a0a0a] bg-zinc-800">
            {profile.avatar_url
              ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt={profile.display_name} />
              : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-zinc-400">
                  {(profile.display_name || profile.username || '?')[0].toUpperCase()}
                </div>}
          </div>

          <div className="flex gap-2 mb-1">
            {isMe ? (
              <Link href="/profile/edit" className="px-4 py-2 bg-zinc-900 border border-zinc-700 text-white text-xs font-bold rounded-full">Edit Profile</Link>
            ) : (
              <>
                <Link href={`/messages?dm=${profile.username}`}
                  className="p-2 bg-zinc-900 border border-zinc-700 text-white rounded-full">
                  <MessageCircle className="w-4 h-4" />
                </Link>
                <button onClick={toggleFollow}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-full transition-all ${
                    following ? 'bg-zinc-900 border border-zinc-700 text-white' : 'bg-yellow-400 text-black'}`}>
                  {following ? <><UserCheck className="w-3.5 h-3.5" /> Following</> : <><UserPlus className="w-3.5 h-3.5" /> Follow</>}
                </button>
              </>
            )}
          </div>
        </div>

        <h1 className="font-black text-white text-xl leading-tight">{profile.display_name || profile.username}</h1>
        <p className="text-zinc-500 text-sm mb-2">@{profile.username}</p>
        {profile.bio && <p className="text-zinc-300 text-sm leading-relaxed mb-3">{profile.bio}</p>}

        {/* Stats row */}
        <div className="flex gap-5 mb-4">
          <div className="text-center">
            <p className="font-black text-white text-lg leading-none">{posts.length}</p>
            <p className="text-zinc-500 text-xs">Posts</p>
          </div>
          <div className="text-center">
            <p className="font-black text-white text-lg leading-none">{(profile.followers_count || 0).toLocaleString()}</p>
            <p className="text-zinc-500 text-xs">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-black text-white text-lg leading-none">{(profile.following_count || 0).toLocaleString()}</p>
            <p className="text-zinc-500 text-xs">Following</p>
          </div>
          <div className="text-center">
            <p className="font-black text-yellow-400 text-lg leading-none">{(profile.points || 0).toLocaleString()}</p>
            <p className="text-zinc-500 text-xs">Points</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900 p-1 rounded-2xl mb-4">
          <button onClick={() => setTab('posts')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${tab === 'posts' ? 'bg-yellow-400 text-black' : 'text-zinc-400'}`}>
            <FileText className="w-3.5 h-3.5" /> Posts
          </button>
          <button onClick={() => setTab('music')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${tab === 'music' ? 'bg-yellow-400 text-black' : 'text-zinc-400'}`}>
            <Music2 className="w-3.5 h-3.5" /> Music
          </button>
        </div>

        {/* Content */}
        {tab === 'posts' ? (
          posts.length === 0
            ? <div className="text-center py-10 text-zinc-500 text-sm">No posts yet</div>
            : <div className="space-y-3">
                {posts.map(p => (
                  <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                    <p className="text-zinc-200 text-sm leading-relaxed">{p.content}</p>
                    <div className="flex items-center gap-3 mt-2.5 text-xs text-zinc-600">
                      <span>❤️ {p.likes_count || 0}</span>
                      <span>💬 {p.replies_count || 0}</span>
                      <span className="ml-auto">{timeAgo(p.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
        ) : (
          tracks.length === 0
            ? <div className="text-center py-10 text-zinc-500 text-sm">No tracks yet</div>
            : <div className="space-y-2">
                {tracks.map(t => (
                  <div key={t.id} className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 overflow-hidden shrink-0">
                      {t.cover_url ? <img src={t.cover_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-lg">🎵</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">{t.title}</p>
                      <p className="text-zinc-500 text-xs capitalize">{t.genre}</p>
                    </div>
                    {t.audio_url && (
                      <a href={t.audio_url} target="_blank" rel="noreferrer" className="p-1.5 text-zinc-500"><ExternalLink className="w-4 h-4" /></a>
                    )}
                  </div>
                ))}
              </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
