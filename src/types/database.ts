export type UserRole = "member" | "mod" | "admin";
export type PostStatus = "published" | "draft" | "flagged";
export type AdStatus = "pending" | "approved" | "rejected" | "live" | "expired";
export type AdPackage = "day" | "day_dual" | "weekly" | "monthly" | "ambassador_3m" | "ambassador_6m";

export type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  twitter_handle: string | null;
  role: UserRole;
  points: number;
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: string;
  author_id: string;
  content: string;
  media_urls: string[];
  tags: string[];
  status: PostStatus;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
};

export type PostWithAuthor = Post & {
  profiles: Profile | null;
  user_has_liked?: boolean;
};

export type PostLike = {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
};

export type AdSubmission = {
  id: string;
  submitter_id: string | null;
  brand_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  package: AdPackage;
  description: string;
  media_url: string | null;
  link_url: string | null;
  status: AdStatus;
  starts_at: string | null;
  ends_at: string | null;
  amount_ngn: number;
  payment_reference: string | null;
  payment_confirmed: boolean;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

// Legacy alias
export type PrAd = AdSubmission;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          twitter_handle?: string | null;
          role?: UserRole;
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      posts: {
        Row: Post;
        Insert: {
          id?: string;
          author_id: string;
          content: string;
          media_urls?: string[];
          tags?: string[];
          status?: PostStatus;
          likes_count?: number;
          comments_count?: number;
          shares_count?: number;
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Post, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      post_likes: {
        Row: PostLike;
        Insert: { id?: string; post_id: string; user_id: string; created_at?: string };
        Update: never;
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          content: string;
          likes_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          content: string;
          likes_count?: number;
          created_at?: string;
        };
        Update: Partial<{ content: string; likes_count: number }>;
        Relationships: [];
      };
      ad_submissions: {
        Row: AdSubmission;
        Insert: {
          id?: string;
          submitter_id?: string | null;
          brand_name: string;
          contact_name: string;
          contact_email: string;
          contact_phone?: string | null;
          package: AdPackage;
          description: string;
          media_url?: string | null;
          link_url?: string | null;
          status?: AdStatus;
          starts_at?: string | null;
          ends_at?: string | null;
          amount_ngn: number;
          payment_reference?: string | null;
          payment_confirmed?: boolean;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<AdSubmission, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// ── SPACES ─────────────────────────────────────────────────
export type SpaceStatus = "scheduled" | "live" | "ended";

export type Space = {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  status: SpaceStatus;
  listener_count: number;
  max_listeners: number;
  tags: string[];
  twitter_space_url: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
};

export type SpaceWithHost = Space & { profiles: Profile | null };

// ── GAMES ──────────────────────────────────────────────────
export type GameType = "trivia" | "truth_dare" | "polls" | "tournament" | "ludo";
export type GameStatus = "upcoming" | "active" | "ended";

export type Game = {
  id: string;
  title: string;
  type: GameType;
  status: GameStatus;
  entry_fee: number;
  prize_pool: number;
  max_players: number;
  player_count: number;
  starts_at: string;
  ended_at: string | null;
  winner_id: string | null;
  created_at: string;
};

export type LeaderboardEntry = {
  rank: number;
  profile: Profile;
  points: number;
  wins: number;
  games_played: number;
};

// ── WALLET ─────────────────────────────────────────────────
export type TxType = "gift_sent" | "gift_received" | "tournament_win" | "referral" | "withdrawal" | "deposit" | "ad_payment";

export type Transaction = {
  id: string;
  user_id: string;
  type: TxType;
  amount: number;
  description: string;
  reference: string | null;
  status: "pending" | "completed" | "failed";
  created_at: string;
};

export type Wallet = {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  updated_at: string;
};
