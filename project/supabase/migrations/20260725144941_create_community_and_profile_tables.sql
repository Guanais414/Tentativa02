/*
# Community, Profile Photos, and Photo History

1. Purpose
   Adds tables for a community feed (posts, comments, likes, follows),
   a personal photo history album, and public profile data (bio, interests, avatar).
   Also adds avatar_url and bio columns to leaderboard_entries so the
   leaderboard can show profile photos.

2. New Tables
   - community_posts: user-shared photos/moments with caption, image, moderation status
   - community_comments: comments on posts, with moderation status
   - community_likes: likes on posts (one per user per post)
   - community_follows: follow relationships between users
   - photo_history: personal album of all images captured/created in the app
   - user_profiles: public profile data (display name, bio, avatar url, interests)

3. Modified Tables
   - leaderboard_entries: add avatar_url (text, nullable) and bio (text, nullable)

4. Security
   - All tables have RLS enabled.
   - community_posts: authenticated users can read all posts (community is shared),
     insert/update/delete own posts.
   - community_comments: authenticated users read all comments, insert/update/delete own.
   - community_likes: authenticated users read all likes, insert/delete own.
   - community_follows: authenticated users read all follows, insert/delete own.
   - photo_history: authenticated users CRUD only their own photos.
   - user_profiles: authenticated users read all profiles (public), update own only.
   - leaderboard_entries: add avatar_url and bio columns (existing policies remain).

5. Notes
   - moderation_status defaults to 'pending'. The app's AI moderation edge function
     will set it to 'approved' or 'rejected'. Only approved posts/comments are shown.
   - All owner columns default to auth.uid() so frontend inserts omitting user_id work.
*/

-- Add avatar_url and bio to leaderboard_entries
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS bio text;

-- community_posts
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  caption text NOT NULL DEFAULT '',
  image_url text,
  mascot_type text DEFAULT 'otter',
  moderation_status text NOT NULL DEFAULT 'approved',
  moderation_reason text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_community_posts" ON community_posts;
CREATE POLICY "select_community_posts" ON community_posts FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_community_posts" ON community_posts;
CREATE POLICY "insert_own_community_posts" ON community_posts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_community_posts" ON community_posts;
CREATE POLICY "update_own_community_posts" ON community_posts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_community_posts" ON community_posts;
CREATE POLICY "delete_own_community_posts" ON community_posts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- community_comments
CREATE TABLE IF NOT EXISTS community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  moderation_status text NOT NULL DEFAULT 'approved',
  moderation_reason text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_community_comments" ON community_comments;
CREATE POLICY "select_community_comments" ON community_comments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_community_comments" ON community_comments;
CREATE POLICY "insert_own_community_comments" ON community_comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_community_comments" ON community_comments;
CREATE POLICY "update_own_community_comments" ON community_comments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_community_comments" ON community_comments;
CREATE POLICY "delete_own_community_comments" ON community_comments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- community_likes
CREATE TABLE IF NOT EXISTS community_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_community_likes" ON community_likes;
CREATE POLICY "select_community_likes" ON community_likes FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_community_likes" ON community_likes;
CREATE POLICY "insert_own_community_likes" ON community_likes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_community_likes" ON community_likes;
CREATE POLICY "delete_own_community_likes" ON community_likes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- community_follows
CREATE TABLE IF NOT EXISTS community_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);
ALTER TABLE community_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_community_follows" ON community_follows;
CREATE POLICY "select_community_follows" ON community_follows FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_community_follows" ON community_follows;
CREATE POLICY "insert_own_community_follows" ON community_follows FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "delete_own_community_follows" ON community_follows;
CREATE POLICY "delete_own_community_follows" ON community_follows FOR DELETE
  TO authenticated USING (auth.uid() = follower_id);

-- photo_history
CREATE TABLE IF NOT EXISTS photo_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  image_data text NOT NULL,
  source text NOT NULL DEFAULT 'camera',
  caption text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE photo_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_photo_history" ON photo_history;
CREATE POLICY "select_own_photo_history" ON photo_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_photo_history" ON photo_history;
CREATE POLICY "insert_own_photo_history" ON photo_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_photo_history" ON photo_history;
CREATE POLICY "delete_own_photo_history" ON photo_history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- user_profiles (public profile data)
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  avatar_url text,
  interests text[] DEFAULT '{}',
  mascot_type text DEFAULT 'otter',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_user_profiles" ON user_profiles;
CREATE POLICY "select_user_profiles" ON user_profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_user_profile" ON user_profiles;
CREATE POLICY "insert_own_user_profile" ON user_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_user_profile" ON user_profiles;
CREATE POLICY "update_own_user_profile" ON user_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_comments_post ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_post ON community_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_follows_following ON community_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_photo_history_user ON photo_history(user_id, created_at DESC);
