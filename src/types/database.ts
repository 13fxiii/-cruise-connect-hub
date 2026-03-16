export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_streaks: {
        Row: {
          current_streak: number | null
          id: string
          last_active_date: string | null
          longest_streak: number | null
          total_days: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          current_streak?: number | null
          id?: string
          last_active_date?: string | null
          longest_streak?: number | null
          total_days?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          current_streak?: number | null
          id?: string
          last_active_date?: string | null
          longest_streak?: number | null
          total_days?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_submissions: {
        Row: {
          brand_name: string
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string | null
          description: string | null
          ends_at: string | null
          id: string
          link_url: string | null
          package: string
          payment_ref: string | null
          price: number
          starts_at: string | null
          status: string | null
        }
        Insert: {
          brand_name: string
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          link_url?: string | null
          package: string
          payment_ref?: string | null
          price: number
          starts_at?: string | null
          status?: string | null
        }
        Update: {
          brand_name?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          link_url?: string | null
          package?: string
          payment_ref?: string | null
          price?: number
          starts_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_audit_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_audit_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_clicks: {
        Row: {
          affiliate_code: string
          converted: boolean | null
          created_at: string | null
          id: string
          ip_hash: string | null
          referrer_url: string | null
        }
        Insert: {
          affiliate_code: string
          converted?: boolean | null
          created_at?: string | null
          id?: string
          ip_hash?: string | null
          referrer_url?: string | null
        }
        Update: {
          affiliate_code?: string
          converted?: boolean | null
          created_at?: string | null
          id?: string
          ip_hash?: string | null
          referrer_url?: string | null
        }
        Relationships: []
      }
      affiliate_tiers: {
        Row: {
          badge_color: string | null
          bonus_naira: number | null
          commission_rate: number
          id: string
          level: number
          min_referrals: number
          name: string
          perks: Json | null
        }
        Insert: {
          badge_color?: string | null
          bonus_naira?: number | null
          commission_rate?: number
          id?: string
          level: number
          min_referrals?: number
          name: string
          perks?: Json | null
        }
        Update: {
          badge_color?: string | null
          bonus_naira?: number | null
          commission_rate?: number
          id?: string
          level?: number
          min_referrals?: number
          name?: string
          perks?: Json | null
        }
        Relationships: []
      }
      affiliates: {
        Row: {
          affiliate_code: string
          click_count: number | null
          conversion_rate: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          paid_out: number | null
          pending_payout: number | null
          tier: string | null
          total_earned: number | null
          total_referrals: number | null
          user_id: string | null
        }
        Insert: {
          affiliate_code: string
          click_count?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          paid_out?: number | null
          pending_payout?: number | null
          tier?: string | null
          total_earned?: number | null
          total_referrals?: number | null
          user_id?: string | null
        }
        Update: {
          affiliate_code?: string
          click_count?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          paid_out?: number | null
          pending_payout?: number | null
          tier?: string | null
          total_earned?: number | null
          total_referrals?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_generations: {
        Row: {
          created_at: string | null
          id: string
          is_saved: boolean | null
          prompt: string
          result: string
          tokens_used: number | null
          tool_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_saved?: boolean | null
          prompt: string
          result: string
          tokens_used?: number | null
          tool_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_saved?: boolean | null
          prompt?: string
          result?: string
          tokens_used?: number | null
          tool_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_generations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_snapshots: {
        Row: {
          earnings: number | null
          followers: number | null
          id: string
          likes_count: number | null
          points: number | null
          posts_count: number | null
          snapshot_date: string
          user_id: string | null
        }
        Insert: {
          earnings?: number | null
          followers?: number | null
          id?: string
          likes_count?: number | null
          points?: number | null
          posts_count?: number | null
          snapshot_date?: string
          user_id?: string | null
        }
        Update: {
          earnings?: number | null
          followers?: number | null
          id?: string
          likes_count?: number | null
          points?: number | null
          posts_count?: number | null
          snapshot_date?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_snapshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_snapshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_snapshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_config: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      artist_submissions: {
        Row: {
          admin_notes: string | null
          artist_id: string | null
          artist_name: string
          cover_url: string | null
          created_at: string | null
          description: string | null
          featured_from: string | null
          featured_until: string | null
          genre: string | null
          id: string
          like_count: number | null
          play_count: number | null
          social_links: Json | null
          status: string | null
          track_title: string
          track_url: string
        }
        Insert: {
          admin_notes?: string | null
          artist_id?: string | null
          artist_name: string
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          featured_from?: string | null
          featured_until?: string | null
          genre?: string | null
          id?: string
          like_count?: number | null
          play_count?: number | null
          social_links?: Json | null
          status?: string | null
          track_title: string
          track_url: string
        }
        Update: {
          admin_notes?: string | null
          artist_id?: string | null
          artist_name?: string
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          featured_from?: string | null
          featured_until?: string | null
          genre?: string | null
          id?: string
          like_count?: number | null
          play_count?: number | null
          social_links?: Json | null
          status?: string | null
          track_title?: string
          track_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_submissions_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_submissions_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_submissions_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_track_likes: {
        Row: {
          created_at: string | null
          track_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          track_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          track_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_track_likes_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "artist_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_track_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_track_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_track_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_track_plays: {
        Row: {
          id: string
          played_at: string | null
          track_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          played_at?: string | null
          track_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          played_at?: string | null
          track_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_track_plays_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "artist_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_track_plays_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_track_plays_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_track_plays_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          account_name: string
          account_number: string
          bank_code: string
          bank_name: string
          created_at: string | null
          id: string
          is_default: boolean | null
          user_id: string
        }
        Insert: {
          account_name: string
          account_number: string
          bank_code: string
          bank_name: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_code?: string
          bank_name?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cc_tournament_entries: {
        Row: {
          eliminated_at: string | null
          final_rank: number | null
          joined_at: string | null
          paid: boolean | null
          tournament_id: string
          user_id: string
        }
        Insert: {
          eliminated_at?: string | null
          final_rank?: number | null
          joined_at?: string | null
          paid?: boolean | null
          tournament_id: string
          user_id: string
        }
        Update: {
          eliminated_at?: string | null
          final_rank?: number | null
          joined_at?: string | null
          paid?: boolean | null
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cc_tournament_entries_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "cc_tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cc_tournament_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cc_tournament_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cc_tournament_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cc_tournaments: {
        Row: {
          created_at: string | null
          current_players: number | null
          current_round: number | null
          entry_fee: number | null
          game_type: string
          id: string
          max_players: number | null
          prize_pool: number
          rules: string | null
          starts_at: string | null
          status: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          current_players?: number | null
          current_round?: number | null
          entry_fee?: number | null
          game_type: string
          id?: string
          max_players?: number | null
          prize_pool?: number
          rules?: string | null
          starts_at?: string | null
          status?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          current_players?: number | null
          current_round?: number | null
          entry_fee?: number | null
          game_type?: string
          id?: string
          max_players?: number | null
          prize_pool?: number
          rules?: string | null
          starts_at?: string | null
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      community_id_cards: {
        Row: {
          card_number: string
          id: string
          is_active: boolean | null
          issued_at: string | null
          qr_data: string | null
          user_id: string | null
        }
        Insert: {
          card_number: string
          id?: string
          is_active?: boolean | null
          issued_at?: string | null
          qr_data?: string | null
          user_id?: string | null
        }
        Update: {
          card_number?: string
          id?: string
          is_active?: boolean | null
          issued_at?: string | null
          qr_data?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_id_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_id_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_id_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_rules: {
        Row: {
          created_at: string | null
          description: string
          emoji: string | null
          id: string
          is_active: boolean | null
          rule_number: number
          title: string
        }
        Insert: {
          created_at?: string | null
          description: string
          emoji?: string | null
          id?: string
          is_active?: boolean | null
          rule_number: number
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          emoji?: string | null
          id?: string
          is_active?: boolean | null
          rule_number?: number
          title?: string
        }
        Relationships: []
      }
      content_reports: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          details: string | null
          id: string
          reason: string
          reporter_id: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          details?: string | null
          id?: string
          reason: string
          reporter_id?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_analytics: {
        Row: {
          engagement_rate: number | null
          followers_count: number | null
          games_played: number | null
          gifts_earned: number | null
          id: string
          merch_earned: number | null
          referral_earned: number | null
          referrals_count: number | null
          spaces_hosted: number | null
          total_comments: number | null
          total_earned: number | null
          total_likes: number | null
          total_posts: number | null
          total_shares: number | null
          tournament_earned: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          engagement_rate?: number | null
          followers_count?: number | null
          games_played?: number | null
          gifts_earned?: number | null
          id?: string
          merch_earned?: number | null
          referral_earned?: number | null
          referrals_count?: number | null
          spaces_hosted?: number | null
          total_comments?: number | null
          total_earned?: number | null
          total_likes?: number | null
          total_posts?: number | null
          total_shares?: number | null
          tournament_earned?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          engagement_rate?: number | null
          followers_count?: number | null
          games_played?: number | null
          gifts_earned?: number | null
          id?: string
          merch_earned?: number | null
          referral_earned?: number | null
          referrals_count?: number | null
          spaces_hosted?: number | null
          total_comments?: number | null
          total_earned?: number | null
          total_likes?: number | null
          total_posts?: number | null
          total_shares?: number | null
          tournament_earned?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_checkins: {
        Row: {
          checkin_date: string
          id: string
          points_earned: number | null
          streak_day: number | null
          user_id: string | null
        }
        Insert: {
          checkin_date?: string
          id?: string
          points_earned?: number | null
          streak_day?: number | null
          user_id?: string | null
        }
        Update: {
          checkin_date?: string
          id?: string
          points_earned?: number | null
          streak_day?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_tasks: {
        Row: {
          completed_at: string | null
          id: string
          is_complete: boolean | null
          points: number | null
          task_date: string
          task_type: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          is_complete?: boolean | null
          points?: number | null
          task_date?: string
          task_type: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          is_complete?: boolean | null
          points?: number | null
          task_date?: string
          task_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_theme_log: {
        Row: {
          created_at: string | null
          id: string
          theme_id: string | null
          used_date: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          theme_id?: string | null
          used_date?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          theme_id?: string | null
          used_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_theme_log_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "daily_theme_pool"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_theme_pool: {
        Row: {
          activities: Json | null
          category: string | null
          created_at: string | null
          day_hint: number | null
          description: string
          hashtag: string
          id: string
          is_active: boolean | null
          theme_emoji: string
          theme_name: string
          weight: number | null
        }
        Insert: {
          activities?: Json | null
          category?: string | null
          created_at?: string | null
          day_hint?: number | null
          description: string
          hashtag: string
          id?: string
          is_active?: boolean | null
          theme_emoji: string
          theme_name: string
          weight?: number | null
        }
        Update: {
          activities?: Json | null
          category?: string | null
          created_at?: string | null
          day_hint?: number | null
          description?: string
          hashtag?: string
          id?: string
          is_active?: boolean | null
          theme_emoji?: string
          theme_name?: string
          weight?: number | null
        }
        Relationships: []
      }
      daily_themes: {
        Row: {
          activities: Json | null
          created_at: string | null
          day_of_week: number
          description: string | null
          hashtag: string | null
          id: string
          is_active: boolean | null
          theme_emoji: string
          theme_name: string
        }
        Insert: {
          activities?: Json | null
          created_at?: string | null
          day_of_week: number
          description?: string | null
          hashtag?: string | null
          id?: string
          is_active?: boolean | null
          theme_emoji: string
          theme_name: string
        }
        Update: {
          activities?: Json | null
          created_at?: string | null
          day_of_week?: number
          description?: string | null
          hashtag?: string | null
          id?: string
          is_active?: boolean | null
          theme_emoji?: string
          theme_name?: string
        }
        Relationships: []
      }
      daily_votes: {
        Row: {
          category: string
          created_at: string | null
          id: string
          nominee_id: string | null
          theme_id: string | null
          vote_date: string
          voter_id: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          id?: string
          nominee_id?: string | null
          theme_id?: string | null
          vote_date?: string
          voter_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          nominee_id?: string | null
          theme_id?: string | null
          vote_date?: string
          voter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_votes_nominee_id_fkey"
            columns: ["nominee_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_votes_nominee_id_fkey"
            columns: ["nominee_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_votes_nominee_id_fkey"
            columns: ["nominee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_votes_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "daily_themes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dao_proposals: {
        Row: {
          category: string | null
          created_at: string | null
          description: string
          id: string
          implemented_at: string | null
          min_votes: number | null
          pass_threshold: number | null
          proposer_id: string | null
          status: string | null
          title: string
          votes_abstain: number | null
          votes_against: number | null
          votes_for: number | null
          voting_ends_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description: string
          id?: string
          implemented_at?: string | null
          min_votes?: number | null
          pass_threshold?: number | null
          proposer_id?: string | null
          status?: string | null
          title: string
          votes_abstain?: number | null
          votes_against?: number | null
          votes_for?: number | null
          voting_ends_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string
          id?: string
          implemented_at?: string | null
          min_votes?: number | null
          pass_threshold?: number | null
          proposer_id?: string | null
          status?: string | null
          title?: string
          votes_abstain?: number | null
          votes_against?: number | null
          votes_for?: number | null
          voting_ends_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dao_proposals_proposer_id_fkey"
            columns: ["proposer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dao_proposals_proposer_id_fkey"
            columns: ["proposer_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dao_proposals_proposer_id_fkey"
            columns: ["proposer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dao_votes: {
        Row: {
          created_at: string | null
          id: string
          proposal_id: string | null
          reason: string | null
          vote: string
          vote_weight: number | null
          voter_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          proposal_id?: string | null
          reason?: string | null
          vote: string
          vote_weight?: number | null
          voter_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          proposal_id?: string | null
          reason?: string | null
          vote?: string
          vote_weight?: number | null
          voter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dao_votes_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "dao_proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dao_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dao_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dao_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dm_conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message: string | null
          last_message_at: string | null
          participant1: string | null
          participant2: string | null
          unread_p1: number | null
          unread_p2: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          participant1?: string | null
          participant2?: string | null
          unread_p1?: number | null
          unread_p2?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          participant1?: string | null
          participant2?: string | null
          unread_p1?: number | null
          unread_p2?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dm_conversations_participant1_fkey"
            columns: ["participant1"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dm_conversations_participant1_fkey"
            columns: ["participant1"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dm_conversations_participant1_fkey"
            columns: ["participant1"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dm_conversations_participant2_fkey"
            columns: ["participant2"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dm_conversations_participant2_fkey"
            columns: ["participant2"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dm_conversations_participant2_fkey"
            columns: ["participant2"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dm_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          sender_id: string | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dm_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "dm_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dm_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dm_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dm_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_participants: {
        Row: {
          joined_at: string | null
          rank: number | null
          score: number | null
          session_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string | null
          rank?: number | null
          score?: number | null
          session_id: string
          user_id: string
        }
        Update: {
          joined_at?: string | null
          rank?: number | null
          score?: number | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          created_at: string | null
          ended_at: string | null
          entry_fee: number | null
          game_type: string
          host_id: string | null
          id: string
          max_players: number | null
          metadata: Json | null
          prize_pool: number | null
          started_at: string | null
          status: string | null
          winner_id: string | null
        }
        Insert: {
          created_at?: string | null
          ended_at?: string | null
          entry_fee?: number | null
          game_type: string
          host_id?: string | null
          id?: string
          max_players?: number | null
          metadata?: Json | null
          prize_pool?: number | null
          started_at?: string | null
          status?: string | null
          winner_id?: string | null
        }
        Update: {
          created_at?: string | null
          ended_at?: string | null
          entry_fee?: number | null
          game_type?: string
          host_id?: string | null
          id?: string
          max_players?: number | null
          metadata?: Json | null
          prize_pool?: number | null
          started_at?: string | null
          status?: string | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_sessions_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_sessions_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_sessions_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_sessions_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_sessions_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_types: {
        Row: {
          animation: string | null
          display_price: string
          emoji: string
          id: string
          is_active: boolean | null
          name: string
          value: number
        }
        Insert: {
          animation?: string | null
          display_price: string
          emoji: string
          id?: string
          is_active?: boolean | null
          name: string
          value: number
        }
        Update: {
          animation?: string | null
          display_price?: string
          emoji?: string
          id?: string
          is_active?: boolean | null
          name?: string
          value?: number
        }
        Relationships: []
      }
      gifts: {
        Row: {
          amount: number
          created_at: string | null
          gift_type_id: string | null
          id: string
          message: string | null
          net_amount: number
          platform_fee: number
          receiver_id: string | null
          sender_id: string | null
          space_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          gift_type_id?: string | null
          id?: string
          message?: string | null
          net_amount: number
          platform_fee?: number
          receiver_id?: string | null
          sender_id?: string | null
          space_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          gift_type_id?: string | null
          id?: string
          message?: string | null
          net_amount?: number
          platform_fee?: number
          receiver_id?: string | null
          sender_id?: string | null
          space_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gifts_gift_type_id_fkey"
            columns: ["gift_type_id"]
            isOneToOne: false
            referencedRelation: "gift_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gifts_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gifts_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gifts_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gifts_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gifts_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gifts_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gifts_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "live_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applicant_id: string
          cover_letter: string | null
          created_at: string | null
          id: string
          job_id: string
          status: string | null
        }
        Insert: {
          applicant_id: string
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          job_id: string
          status?: string | null
        }
        Update: {
          applicant_id?: string
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          job_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listings: {
        Row: {
          apply_email: string | null
          apply_url: string | null
          category: string | null
          company: string
          created_at: string | null
          description: string
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          location: string | null
          poster_id: string | null
          requirements: string | null
          salary_max: number | null
          salary_min: number | null
          title: string
          type: string | null
        }
        Insert: {
          apply_email?: string | null
          apply_url?: string | null
          category?: string | null
          company: string
          created_at?: string | null
          description: string
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          poster_id?: string | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          title: string
          type?: string | null
        }
        Update: {
          apply_email?: string | null
          apply_url?: string | null
          category?: string | null
          company?: string
          created_at?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          poster_id?: string | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_listings_poster_id_fkey"
            columns: ["poster_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_listings_poster_id_fkey"
            columns: ["poster_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_listings_poster_id_fkey"
            columns: ["poster_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard_seasons: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          name: string
          prize_pool: number | null
          start_date: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          name: string
          prize_pool?: number | null
          start_date: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          name?: string
          prize_pool?: number | null
          start_date?: string
          status?: string | null
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      live_spaces: {
        Row: {
          created_at: string | null
          description: string | null
          ended_at: string | null
          host_id: string | null
          id: string
          listener_count: number | null
          scheduled_at: string | null
          source: string | null
          started_at: string | null
          status: string | null
          synced_at: string | null
          title: string
          topic_tags: string[] | null
          x_space_id: string | null
          x_space_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          host_id?: string | null
          id?: string
          listener_count?: number | null
          scheduled_at?: string | null
          source?: string | null
          started_at?: string | null
          status?: string | null
          synced_at?: string | null
          title: string
          topic_tags?: string[] | null
          x_space_id?: string | null
          x_space_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          host_id?: string | null
          id?: string
          listener_count?: number | null
          scheduled_at?: string | null
          source?: string | null
          started_at?: string | null
          status?: string | null
          synced_at?: string | null
          title?: string
          topic_tags?: string[] | null
          x_space_id?: string | null
          x_space_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_spaces_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_spaces_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_spaces_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          category: string
          cover_url: string | null
          created_at: string | null
          description: string
          id: string
          price: number
          price_display: string
          purchase_count: number | null
          seller_id: string | null
          status: string | null
          tags: string[] | null
          title: string
        }
        Insert: {
          category: string
          cover_url?: string | null
          created_at?: string | null
          description: string
          id?: string
          price: number
          price_display: string
          purchase_count?: number | null
          seller_id?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
        }
        Update: {
          category?: string
          cover_url?: string | null
          created_at?: string | null
          description?: string
          id?: string
          price?: number
          price_display?: string
          purchase_count?: number | null
          seller_id?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_orders: {
        Row: {
          amount: number
          buyer_id: string | null
          created_at: string | null
          id: string
          listing_id: string | null
          net_amount: number
          platform_fee: number
          seller_id: string | null
          status: string | null
        }
        Insert: {
          amount: number
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          listing_id?: string | null
          net_amount: number
          platform_fee: number
          seller_id?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          listing_id?: string | null
          net_amount?: number
          platform_fee?: number
          seller_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_orders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      member_bans: {
        Row: {
          banned_by: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_permanent: boolean | null
          reason: string
          user_id: string | null
        }
        Insert: {
          banned_by?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_permanent?: boolean | null
          reason: string
          user_id?: string | null
        }
        Update: {
          banned_by?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_permanent?: boolean | null
          reason?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_bans_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_bans_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_bans_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_bans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_bans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_bans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      member_rules_accepted: {
        Row: {
          accepted_at: string | null
          user_id: string
          version: number | null
        }
        Insert: {
          accepted_at?: string | null
          user_id: string
          version?: number | null
        }
        Update: {
          accepted_at?: string | null
          user_id?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "member_rules_accepted_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_rules_accepted_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_rules_accepted_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_queue: {
        Row: {
          action_taken: string | null
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reporter_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          action_taken?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          action_taken?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_queue_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_queue_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_queue_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_queue_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_queue_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_queue_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderators: {
        Row: {
          added_at: string | null
          added_by: string | null
          permissions: Json | null
          role: string | null
          user_id: string
        }
        Insert: {
          added_at?: string | null
          added_by?: string | null
          permissions?: Json | null
          role?: string | null
          user_id: string
        }
        Update: {
          added_at?: string | null
          added_by?: string | null
          permissions?: Json | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderators_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderators_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderators_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      music_likes: {
        Row: {
          created_at: string | null
          track_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          track_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          track_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "music_likes_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "music_tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "music_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "music_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "music_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      music_playlists: {
        Row: {
          cover_url: string | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          id: string
          is_official: boolean | null
          is_public: boolean | null
          play_count: number | null
          title: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          is_official?: boolean | null
          is_public?: boolean | null
          play_count?: number | null
          title: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          is_official?: boolean | null
          is_public?: boolean | null
          play_count?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "music_playlists_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "music_playlists_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "music_playlists_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      music_plays: {
        Row: {
          id: string
          played_at: string | null
          source: string | null
          track_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          played_at?: string | null
          source?: string | null
          track_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          played_at?: string | null
          source?: string | null
          track_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "music_plays_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "music_tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "music_plays_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "music_plays_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "music_plays_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      music_promos: {
        Row: {
          apple_url: string | null
          artist_name: string
          cover_url: string | null
          created_at: string | null
          genre: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          linktree_url: string | null
          play_count: number | null
          promo_expires_at: string | null
          spotify_url: string | null
          stream_url: string | null
          track_title: string
          twitter_handle: string | null
          youtube_id: string | null
        }
        Insert: {
          apple_url?: string | null
          artist_name: string
          cover_url?: string | null
          created_at?: string | null
          genre?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          linktree_url?: string | null
          play_count?: number | null
          promo_expires_at?: string | null
          spotify_url?: string | null
          stream_url?: string | null
          track_title: string
          twitter_handle?: string | null
          youtube_id?: string | null
        }
        Update: {
          apple_url?: string | null
          artist_name?: string
          cover_url?: string | null
          created_at?: string | null
          genre?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          linktree_url?: string | null
          play_count?: number | null
          promo_expires_at?: string | null
          spotify_url?: string | null
          stream_url?: string | null
          track_title?: string
          twitter_handle?: string | null
          youtube_id?: string | null
        }
        Relationships: []
      }
      music_submissions: {
        Row: {
          admin_notes: string | null
          apple_music_url: string | null
          artist_id: string | null
          artist_name: string
          bio: string | null
          cover_art_url: string | null
          created_at: string | null
          featured_at: string | null
          genre: string
          id: string
          like_count: number | null
          play_count: number | null
          social_handle: string | null
          soundcloud_url: string | null
          spotify_url: string | null
          status: string | null
          track_title: string
          youtube_url: string | null
        }
        Insert: {
          admin_notes?: string | null
          apple_music_url?: string | null
          artist_id?: string | null
          artist_name: string
          bio?: string | null
          cover_art_url?: string | null
          created_at?: string | null
          featured_at?: string | null
          genre: string
          id?: string
          like_count?: number | null
          play_count?: number | null
          social_handle?: string | null
          soundcloud_url?: string | null
          spotify_url?: string | null
          status?: string | null
          track_title: string
          youtube_url?: string | null
        }
        Update: {
          admin_notes?: string | null
          apple_music_url?: string | null
          artist_id?: string | null
          artist_name?: string
          bio?: string | null
          cover_art_url?: string | null
          created_at?: string | null
          featured_at?: string | null
          genre?: string
          id?: string
          like_count?: number | null
          play_count?: number | null
          social_handle?: string | null
          soundcloud_url?: string | null
          spotify_url?: string | null
          status?: string | null
          track_title?: string
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "music_submissions_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "music_submissions_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "music_submissions_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      music_tracks: {
        Row: {
          album: string | null
          apple_music_id: string | null
          artist: string
          artist_name: string | null
          cover_url: string | null
          created_at: string | null
          duration_sec: number | null
          external_url: string | null
          genre: string | null
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          like_count: number | null
          play_count: number | null
          source: string | null
          spotify_id: string | null
          stream_url: string | null
          submitted_by: string | null
          title: string
          youtube_id: string | null
        }
        Insert: {
          album?: string | null
          apple_music_id?: string | null
          artist: string
          artist_name?: string | null
          cover_url?: string | null
          created_at?: string | null
          duration_sec?: number | null
          external_url?: string | null
          genre?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          like_count?: number | null
          play_count?: number | null
          source?: string | null
          spotify_id?: string | null
          stream_url?: string | null
          submitted_by?: string | null
          title: string
          youtube_id?: string | null
        }
        Update: {
          album?: string | null
          apple_music_id?: string | null
          artist?: string
          artist_name?: string | null
          cover_url?: string | null
          created_at?: string | null
          duration_sec?: number | null
          external_url?: string | null
          genre?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          like_count?: number | null
          play_count?: number | null
          source?: string | null
          spotify_id?: string | null
          stream_url?: string | null
          submitted_by?: string | null
          title?: string
          youtube_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "music_tracks_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "music_tracks_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "music_tracks_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          announcements: boolean | null
          community: boolean | null
          dao: boolean | null
          games: boolean | null
          gifts: boolean | null
          jobs: boolean | null
          marketplace: boolean | null
          spaces: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          announcements?: boolean | null
          community?: boolean | null
          dao?: boolean | null
          games?: boolean | null
          gifts?: boolean | null
          jobs?: boolean | null
          marketplace?: boolean | null
          spaces?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          announcements?: boolean | null
          community?: boolean | null
          dao?: boolean | null
          games?: boolean | null
          gifts?: boolean | null
          jobs?: boolean | null
          marketplace?: boolean | null
          spaces?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          post_id: string | null
          recipient_id: string
          type: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          post_id?: string | null
          recipient_id: string
          type: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          post_id?: string | null
          recipient_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: Json | null
          buyer_id: string
          created_at: string | null
          id: string
          payment_ref: string | null
          product_id: string
          quantity: number | null
          status: string | null
          total_amount: number
        }
        Insert: {
          address?: Json | null
          buyer_id: string
          created_at?: string | null
          id?: string
          payment_ref?: string | null
          product_id: string
          quantity?: number | null
          status?: string | null
          total_amount: number
        }
        Update: {
          address?: Json | null
          buyer_id?: string
          created_at?: string | null
          id?: string
          payment_ref?: string | null
          product_id?: string
          quantity?: number | null
          status?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shop_products"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_metrics: {
        Row: {
          active_users: number | null
          created_at: string | null
          games_played: number | null
          gifts_sent: number | null
          id: string
          metric_date: string
          new_posts: number | null
          new_users: number | null
          referrals_made: number | null
          revenue_kobo: number | null
          spaces_hosted: number | null
          total_posts: number | null
          total_users: number | null
        }
        Insert: {
          active_users?: number | null
          created_at?: string | null
          games_played?: number | null
          gifts_sent?: number | null
          id?: string
          metric_date?: string
          new_posts?: number | null
          new_users?: number | null
          referrals_made?: number | null
          revenue_kobo?: number | null
          spaces_hosted?: number | null
          total_posts?: number | null
          total_users?: number | null
        }
        Update: {
          active_users?: number | null
          created_at?: string | null
          games_played?: number | null
          gifts_sent?: number | null
          id?: string
          metric_date?: string
          new_posts?: number | null
          new_users?: number | null
          referrals_made?: number | null
          revenue_kobo?: number | null
          spaces_hosted?: number | null
          total_posts?: number | null
          total_users?: number | null
        }
        Relationships: []
      }
      platform_revenue: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          metadata: Json | null
          reference: string | null
          source: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          reference?: string | null
          source: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          reference?: string | null
          source?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      platform_stats: {
        Row: {
          active_today: number | null
          ai_generations: number | null
          games_played: number | null
          id: string
          marketplace_sales: number | null
          new_users_today: number | null
          spaces_hosted: number | null
          stat_date: string
          total_posts: number | null
          total_revenue: number | null
          total_users: number | null
        }
        Insert: {
          active_today?: number | null
          ai_generations?: number | null
          games_played?: number | null
          id?: string
          marketplace_sales?: number | null
          new_users_today?: number | null
          spaces_hosted?: number | null
          stat_date?: string
          total_posts?: number | null
          total_revenue?: number | null
          total_users?: number | null
        }
        Update: {
          active_today?: number | null
          ai_generations?: number | null
          games_played?: number | null
          id?: string
          marketplace_sales?: number | null
          new_users_today?: number | null
          spaces_hosted?: number | null
          stat_date?: string
          total_posts?: number | null
          total_revenue?: number | null
          total_users?: number | null
        }
        Relationships: []
      }
      playlist_tracks: {
        Row: {
          added_at: string | null
          playlist_id: string
          position: number | null
          track_id: string
        }
        Insert: {
          added_at?: string | null
          playlist_id: string
          position?: number | null
          track_id: string
        }
        Update: {
          added_at?: string | null
          playlist_id?: string
          position?: number | null
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_tracks_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "music_playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "music_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string | null
          option_id: string
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          option_id: string
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          option_id?: string
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          category: string | null
          created_at: string | null
          creator_id: string | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          options: Json
          question: string
          total_votes: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          creator_id?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          options?: Json
          question: string
          total_votes?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          creator_id?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          options?: Json
          question?: string
          total_votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "polls_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polls_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polls_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          created_at: string | null
          emoji: string
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          emoji?: string
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          is_deleted: boolean | null
          is_pinned: boolean | null
          likes_count: number | null
          media_type: string | null
          media_url: string | null
          media_urls: string[] | null
          post_type: string | null
          replies_count: number | null
          reposts_count: number | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          media_type?: string | null
          media_url?: string | null
          media_urls?: string[] | null
          post_type?: string | null
          replies_count?: number | null
          reposts_count?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          media_type?: string | null
          media_url?: string | null
          media_urls?: string[] | null
          post_type?: string | null
          replies_count?: number | null
          reposts_count?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pr_ads: {
        Row: {
          admin_notes: string | null
          amount_ngn: number
          approved_at: string | null
          artist_name: string
          asset_type: string | null
          asset_url: string | null
          campaign_type: string
          contact_email: string
          contact_phone: string | null
          created_at: string | null
          description: string
          ends_at: string | null
          goes_live_at: string | null
          id: string
          linktree_url: string | null
          promotion_type: string
          requested_start_date: string | null
          status: string | null
          submitter_id: string
          target_audience: string | null
          title: string
          twitter_handle: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount_ngn: number
          approved_at?: string | null
          artist_name: string
          asset_type?: string | null
          asset_url?: string | null
          campaign_type: string
          contact_email: string
          contact_phone?: string | null
          created_at?: string | null
          description: string
          ends_at?: string | null
          goes_live_at?: string | null
          id?: string
          linktree_url?: string | null
          promotion_type: string
          requested_start_date?: string | null
          status?: string | null
          submitter_id: string
          target_audience?: string | null
          title: string
          twitter_handle?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount_ngn?: number
          approved_at?: string | null
          artist_name?: string
          asset_type?: string | null
          asset_url?: string | null
          campaign_type?: string
          contact_email?: string
          contact_phone?: string | null
          created_at?: string | null
          description?: string
          ends_at?: string | null
          goes_live_at?: string | null
          id?: string
          linktree_url?: string | null
          promotion_type?: string
          requested_start_date?: string | null
          status?: string | null
          submitter_id?: string
          target_audience?: string | null
          title?: string
          twitter_handle?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pr_ads_submitter_id_fkey"
            columns: ["submitter_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pr_ads_submitter_id_fkey"
            columns: ["submitter_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pr_ads_submitter_id_fkey"
            columns: ["submitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          avatar_url: string | null
          bio: string | null
          cover_url: string | null
          created_at: string | null
          current_streak: number | null
          display_name: string | null
          followers_count: number | null
          following_count: number | null
          id: string
          interests: string[] | null
          is_admin: boolean | null
          is_verified: boolean | null
          last_checkin: string | null
          level: string
          location: string | null
          longest_streak: number | null
          points: number | null
          referral_code: string | null
          referred_by: string | null
          role: string | null
          total_earned: number
          total_spent: number
          twitter_handle: string | null
          updated_at: string | null
          username: string
          wallet_balance: number
          website: string | null
          website_url: string | null
        }
        Insert: {
          avatar?: string | null
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string | null
          current_streak?: number | null
          display_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          id: string
          interests?: string[] | null
          is_admin?: boolean | null
          is_verified?: boolean | null
          last_checkin?: string | null
          level?: string
          location?: string | null
          longest_streak?: number | null
          points?: number | null
          referral_code?: string | null
          referred_by?: string | null
          role?: string | null
          total_earned?: number
          total_spent?: number
          twitter_handle?: string | null
          updated_at?: string | null
          username: string
          wallet_balance?: number
          website?: string | null
          website_url?: string | null
        }
        Update: {
          avatar?: string | null
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string | null
          current_streak?: number | null
          display_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          interests?: string[] | null
          is_admin?: boolean | null
          is_verified?: boolean | null
          last_checkin?: string | null
          level?: string
          location?: string | null
          longest_streak?: number | null
          points?: number | null
          referral_code?: string | null
          referred_by?: string | null
          role?: string | null
          total_earned?: number
          total_spent?: number
          twitter_handle?: string | null
          updated_at?: string | null
          username?: string
          wallet_balance?: number
          website?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "auth_profile_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      push_logs: {
        Row: {
          body: string
          delivered: boolean | null
          id: string
          sent_at: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          body: string
          delivered?: boolean | null
          id?: string
          sent_at?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string
          delivered?: boolean | null
          id?: string
          sent_at?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      push_notification_log: {
        Row: {
          body: string
          icon: string | null
          id: string
          link: string | null
          sent_at: string | null
          status: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          body: string
          icon?: string | null
          id?: string
          link?: string | null
          sent_at?: string | null
          status?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string
          icon?: string | null
          id?: string
          link?: string | null
          sent_at?: string | null
          status?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_notification_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_notification_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_notification_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          device_name: string | null
          endpoint: string
          id: string
          is_active: boolean | null
          p256dh: string
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string | null
          device_name?: string | null
          endpoint: string
          id?: string
          is_active?: boolean | null
          p256dh: string
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string | null
          device_name?: string | null
          endpoint?: string
          id?: string
          is_active?: boolean | null
          p256dh?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_payouts: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          referred_id: string | null
          referrer_id: string | null
          status: string | null
          trigger_event: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          referred_id?: string | null
          referrer_id?: string | null
          status?: string | null
          trigger_event?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          referred_id?: string | null
          referrer_id?: string | null
          status?: string | null
          trigger_event?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_payouts_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_payouts_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_payouts_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_payouts_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_payouts_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_payouts_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_tiers: {
        Row: {
          badge_label: string | null
          bonus_points: number | null
          color: string | null
          commission_rate: number
          id: string
          min_referrals: number
          tier_name: string
        }
        Insert: {
          badge_label?: string | null
          bonus_points?: number | null
          color?: string | null
          commission_rate: number
          id?: string
          min_referrals: number
          tier_name: string
        }
        Update: {
          badge_label?: string | null
          bonus_points?: number | null
          color?: string | null
          commission_rate?: number
          id?: string
          min_referrals?: number
          tier_name?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          commission_paid: number | null
          commission_rate: number | null
          created_at: string | null
          id: string
          referral_type: string | null
          referred_user: string | null
          referrer_id: string | null
          status: string | null
        }
        Insert: {
          commission_paid?: number | null
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          referral_type?: string | null
          referred_user?: string | null
          referrer_id?: string | null
          status?: string | null
        }
        Update: {
          commission_paid?: number | null
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          referral_type?: string | null
          referred_user?: string | null
          referrer_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_user_fkey"
            columns: ["referred_user"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_user_fkey"
            columns: ["referred_user"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_user_fkey"
            columns: ["referred_user"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      replies: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          is_deleted: boolean | null
          post_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          post_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "replies_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replies_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replies_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          price: number
          seller_id: string | null
          stock: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          price: number
          seller_id?: string | null
          stock?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          price?: number
          seller_id?: string | null
          stock?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sp_discount_codes: {
        Row: {
          code: string
          created_at: string | null
          discount_percent: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          discount_percent: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          discount_percent?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          used_count?: number | null
        }
        Relationships: []
      }
      sp_order_items: {
        Row: {
          id: string
          order_id: string | null
          price_per_unit: number
          quantity: number
          service_id: string | null
          service_name: string
          target_url: string | null
          total_price: number
        }
        Insert: {
          id?: string
          order_id?: string | null
          price_per_unit: number
          quantity: number
          service_id?: string | null
          service_name: string
          target_url?: string | null
          total_price: number
        }
        Update: {
          id?: string
          order_id?: string | null
          price_per_unit?: number
          quantity?: number
          service_id?: string | null
          service_name?: string
          target_url?: string | null
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sp_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "sp_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sp_order_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "sp_services"
            referencedColumns: ["id"]
          },
        ]
      }
      sp_orders: {
        Row: {
          completed_at: string | null
          created_at: string | null
          discount_amount: number | null
          discount_code: string | null
          email: string
          id: string
          payment_method: Database["public"]["Enums"]["sp_payment_method"]
          status: Database["public"]["Enums"]["sp_order_status"] | null
          stripe_payment_id: string | null
          subtotal: number
          total: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          discount_amount?: number | null
          discount_code?: string | null
          email: string
          id?: string
          payment_method: Database["public"]["Enums"]["sp_payment_method"]
          status?: Database["public"]["Enums"]["sp_order_status"] | null
          stripe_payment_id?: string | null
          subtotal: number
          total: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          discount_amount?: number | null
          discount_code?: string | null
          email?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["sp_payment_method"]
          status?: Database["public"]["Enums"]["sp_order_status"] | null
          stripe_payment_id?: string | null
          subtotal?: number
          total?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sp_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_profile_status"
            referencedColumns: ["id"]
          },
        ]
      }
      sp_services: {
        Row: {
          base_price: number
          category: string | null
          created_at: string | null
          description: string
          icon: string
          id: string
          is_active: boolean | null
          max_quantity: number
          min_quantity: number
          name: string
          price_per_unit: number
          slug: string
          updated_at: string | null
        }
        Insert: {
          base_price: number
          category?: string | null
          created_at?: string | null
          description: string
          icon: string
          id?: string
          is_active?: boolean | null
          max_quantity: number
          min_quantity: number
          name: string
          price_per_unit: number
          slug: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          category?: string | null
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          max_quantity?: number
          min_quantity?: number
          name?: string
          price_per_unit?: number
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sp_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          order_id: string | null
          payment_method: Database["public"]["Enums"]["sp_payment_method"]
          status: Database["public"]["Enums"]["sp_transaction_status"] | null
          stripe_payment_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          order_id?: string | null
          payment_method: Database["public"]["Enums"]["sp_payment_method"]
          status?: Database["public"]["Enums"]["sp_transaction_status"] | null
          stripe_payment_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          order_id?: string | null
          payment_method?: Database["public"]["Enums"]["sp_payment_method"]
          status?: Database["public"]["Enums"]["sp_transaction_status"] | null
          stripe_payment_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sp_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "sp_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_profile_status"
            referencedColumns: ["id"]
          },
        ]
      }
      sp_users: {
        Row: {
          created_at: string | null
          credits: number | null
          email: string
          id: string
          name: string | null
          password: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credits?: number | null
          email: string
          id?: string
          name?: string | null
          password: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credits?: number | null
          email?: string
          id?: string
          name?: string | null
          password?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      space_topic_suggestions: {
        Row: {
          category: string | null
          created_at: string | null
          day_theme: number | null
          description: string | null
          id: string
          is_active: boolean | null
          tags: string[] | null
          title: string
          used_count: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          day_theme?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          tags?: string[] | null
          title: string
          used_count?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          day_theme?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          tags?: string[] | null
          title?: string
          used_count?: number | null
        }
        Relationships: []
      }
      spaces: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          ended_at: string | null
          host_id: string
          id: string
          listener_count: number | null
          scheduled_at: string | null
          started_at: string | null
          status: string | null
          title: string
          x_space_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          host_id: string
          id?: string
          listener_count?: number | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
          title: string
          x_space_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          host_id?: string
          id?: string
          listener_count?: number | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
          title?: string
          x_space_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spaces_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spaces_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spaces_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsorship_applications: {
        Row: {
          admin_notes: string | null
          brand_name: string
          budget_range: string | null
          campaign_brief: string
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string | null
          id: string
          industry: string | null
          package_id: string | null
          start_date: string | null
          status: string | null
          website: string | null
        }
        Insert: {
          admin_notes?: string | null
          brand_name: string
          budget_range?: string | null
          campaign_brief: string
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          package_id?: string | null
          start_date?: string | null
          status?: string | null
          website?: string | null
        }
        Update: {
          admin_notes?: string | null
          brand_name?: string
          budget_range?: string | null
          campaign_brief?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          package_id?: string | null
          start_date?: string | null
          status?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsorship_applications_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "sponsorship_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsorship_packages: {
        Row: {
          description: string
          duration_days: number
          features: Json | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          price: number
          price_display: string
          sort_order: number | null
        }
        Insert: {
          description: string
          duration_days: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          price: number
          price_display: string
          sort_order?: number | null
        }
        Update: {
          description?: string
          duration_days?: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          price?: number
          price_display?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      tournaments: {
        Row: {
          date: string | null
          fee: number | null
          id: number
          name: string | null
        }
        Insert: {
          date?: string | null
          fee?: number | null
          id?: never
          name?: string | null
        }
        Update: {
          date?: string | null
          fee?: number | null
          id?: never
          name?: string | null
        }
        Relationships: []
      }
      tracks: {
        Row: {
          apple_url: string | null
          artist: string
          audiomack_url: string | null
          created_at: string | null
          genre: string | null
          id: string
          is_featured: boolean | null
          likes: number | null
          linktree_url: string | null
          plays: number | null
          spotify_url: string | null
          status: string | null
          submitter_id: string | null
          title: string
          twitter_handle: string | null
          youtube_url: string | null
        }
        Insert: {
          apple_url?: string | null
          artist: string
          audiomack_url?: string | null
          created_at?: string | null
          genre?: string | null
          id?: string
          is_featured?: boolean | null
          likes?: number | null
          linktree_url?: string | null
          plays?: number | null
          spotify_url?: string | null
          status?: string | null
          submitter_id?: string | null
          title: string
          twitter_handle?: string | null
          youtube_url?: string | null
        }
        Update: {
          apple_url?: string | null
          artist?: string
          audiomack_url?: string | null
          created_at?: string | null
          genre?: string | null
          id?: string
          is_featured?: boolean | null
          likes?: number | null
          linktree_url?: string | null
          plays?: number | null
          spotify_url?: string | null
          status?: string | null
          submitter_id?: string | null
          title?: string
          twitter_handle?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracks_submitter_id_fkey"
            columns: ["submitter_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracks_submitter_id_fkey"
            columns: ["submitter_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracks_submitter_id_fkey"
            columns: ["submitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          reason: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          reason?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          reason?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          reference: string | null
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          reference?: string | null
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          reference?: string | null
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      auth_profile_status: {
        Row: {
          display_name: string | null
          email: string | null
          has_accepted_rules: boolean | null
          has_profile: boolean | null
          id: string | null
          username: string | null
        }
        Relationships: []
      }
      leaderboard: {
        Row: {
          avatar_url: string | null
          display_name: string | null
          id: string | null
          level: string | null
          points: number | null
          rank: number | null
          username: string | null
          wins: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "auth_profile_status"
            referencedColumns: ["id"]
          },
        ]
      }
      member_earnings: {
        Row: {
          display_name: string | null
          id: string | null
          total_earned: number | null
          total_gifts_received: number | null
          total_referral_commission: number | null
          total_tournament_wins: number | null
          username: string | null
          wallet_balance: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "auth_profile_status"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      sp_order_status:
        | "PENDING"
        | "PROCESSING"
        | "COMPLETED"
        | "FAILED"
        | "REFUNDED"
      sp_payment_method: "CARD" | "CRYPTO" | "ALTERNATIVE"
      sp_transaction_status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      sp_order_status: [
        "PENDING",
        "PROCESSING",
        "COMPLETED",
        "FAILED",
        "REFUNDED",
      ],
      sp_payment_method: ["CARD", "CRYPTO", "ALTERNATIVE"],
      sp_transaction_status: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
    },
  },
} as const
