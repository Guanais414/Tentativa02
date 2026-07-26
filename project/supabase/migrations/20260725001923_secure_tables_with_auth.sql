/*
# Add user_id to leaderboard_entries and secure both tables with auth-scoped RLS

## What this does
The app now requires sign-in (email/password via Supabase Auth). This migration:
1. Adds a `user_id` column to `leaderboard_entries` so each row is owned by an authenticated user.
2. Replaces the previous anon-open policies on `leaderboard_entries` with authenticated, owner-scoped policies. Only the owner can insert/update/delete their entry; everyone (authenticated) can read the leaderboard (it's a public ranking).
3. Tightens `bamboo_letters` policies to require authentication: only authenticated users can read unreplied letters, post letters, and reply. This prevents anonymous spam and abuse.

## Tables

### leaderboard_entries (modified)
- New column: `user_id` (uuid, NOT NULL, defaults to auth.uid(), references auth.users ON DELETE CASCADE)
- Added unique constraint on user_id so each user has exactly one leaderboard entry

### bamboo_letters (no schema change)
- Policy role changes from `anon, authenticated` to `authenticated` only

## Security
- leaderboard_entries: SELECT is public to authenticated users (it's a ranking board). INSERT/UPDATE/DELETE are owner-scoped via auth.uid() = user_id.
- bamboo_letters: all operations require authenticated users. SELECT limited to unreplied letters. UPDATE only on unreplied letters (prevents double-replies and tampering).

## Important notes
1. The `user_id` column has DEFAULT auth.uid() so frontend inserts that omit user_id still succeed.
2. The unique constraint on user_id ensures one leaderboard entry per user (upsert pattern).
3. anon role is now blocked from both tables — the app requires sign-in.
*/

-- Add user_id to leaderboard_entries
ALTER TABLE leaderboard_entries
  ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;

-- Unique constraint: one leaderboard entry per user
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leaderboard_entries_user_id_key') THEN
    ALTER TABLE leaderboard_entries ADD CONSTRAINT leaderboard_entries_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- ============================================================
-- leaderboard_entries: authenticated, owner-scoped
-- ============================================================
-- Everyone authenticated can read the leaderboard (public ranking)
DROP POLICY IF EXISTS "anon_select_leaderboard" ON leaderboard_entries;
DROP POLICY IF EXISTS "auth_select_leaderboard" ON leaderboard_entries;
CREATE POLICY "auth_select_leaderboard" ON leaderboard_entries FOR SELECT
  TO authenticated USING (true);

-- Only owner can insert their entry
DROP POLICY IF EXISTS "anon_insert_leaderboard" ON leaderboard_entries;
DROP POLICY IF EXISTS "auth_insert_leaderboard" ON leaderboard_entries;
CREATE POLICY "auth_insert_leaderboard" ON leaderboard_entries FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Only owner can update their entry
DROP POLICY IF EXISTS "anon_update_leaderboard" ON leaderboard_entries;
DROP POLICY IF EXISTS "auth_update_leaderboard" ON leaderboard_entries;
CREATE POLICY "auth_update_leaderboard" ON leaderboard_entries FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Only owner can delete their entry
DROP POLICY IF EXISTS "anon_delete_leaderboard" ON leaderboard_entries;
DROP POLICY IF EXISTS "auth_delete_leaderboard" ON leaderboard_entries;
CREATE POLICY "auth_delete_leaderboard" ON leaderboard_entries FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- bamboo_letters: authenticated only (no anon access)
-- ============================================================
-- Only authenticated users can read unreplied letters
DROP POLICY IF EXISTS "anon_select_bamboo" ON bamboo_letters;
DROP POLICY IF EXISTS "auth_select_bamboo" ON bamboo_letters;
CREATE POLICY "auth_select_bamboo" ON bamboo_letters FOR SELECT
  TO authenticated USING (replied = false);

-- Only authenticated users can post a letter
DROP POLICY IF EXISTS "anon_insert_bamboo" ON bamboo_letters;
DROP POLICY IF EXISTS "auth_insert_bamboo" ON bamboo_letters;
CREATE POLICY "auth_insert_bamboo" ON bamboo_letters FOR INSERT
  TO authenticated WITH CHECK (true);

-- Only authenticated users can reply to an unreplied letter
DROP POLICY IF EXISTS "anon_update_bamboo" ON bamboo_letters;
DROP POLICY IF EXISTS "auth_update_bamboo" ON bamboo_letters;
CREATE POLICY "auth_update_bamboo" ON bamboo_letters FOR UPDATE
  TO authenticated USING (replied = false) WITH CHECK (true);
