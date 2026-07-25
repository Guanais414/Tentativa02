/*
# Create leaderboard table (single-tenant, no auth)

1. New Tables
- `leaderboard_entries`
- `id` (uuid, primary key)
- `player_name` (text, display name shown on the leaderboard)
- `mascot_type` (text, either 'otter' or 'duck')
- `level` (integer, player level)
- `xp` (integer, total experience points)
- `streak` (integer, current day streak)
- `country` (text, player's country, optional)
- `avatar` (text, cosmetic avatar identifier, optional)
- `updated_at` (timestamp, last sync time)
2. Security
- Enable RLS on `leaderboard_entries`.
- Allow anon + authenticated full CRUD because the leaderboard is intentionally public/shared (no sign-in screen).
*/

CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  mascot_type text NOT NULL DEFAULT 'otter',
  level integer NOT NULL DEFAULT 1,
  xp integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  country text,
  avatar text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_leaderboard" ON leaderboard_entries;
CREATE POLICY "anon_select_leaderboard" ON leaderboard_entries FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_leaderboard" ON leaderboard_entries;
CREATE POLICY "anon_insert_leaderboard" ON leaderboard_entries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_leaderboard" ON leaderboard_entries;
CREATE POLICY "anon_update_leaderboard" ON leaderboard_entries FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_leaderboard" ON leaderboard_entries;
CREATE POLICY "anon_delete_leaderboard" ON leaderboard_entries FOR DELETE
  TO anon, authenticated USING (true);
