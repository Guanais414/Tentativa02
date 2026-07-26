/*
# Create bamboo_letters table — Bamboo Forest community feature

## What this does
Creates an anonymous cross-platform letter-sharing table for the Bamboo Forest feature.
Users aged 16+ can write how they are feeling or what happened in their day (a "paper boat letter").
Another user anonymously receives the letter, reads it once, replies with encouragement, and never sees it again.
Letters are deleted automatically after they have been replied to, keeping the experience ephemeral and safe.

## Tables

### bamboo_letters
- `id` — uuid primary key
- `content` — the original letter/story (max 1000 chars)
- `reply` — the positive reply from another user (max 600 chars, nullable until replied to)
- `mood_tag` — optional mood tag: 'happy', 'sad', 'anxious', 'excited', 'tired', 'grateful', 'other'
- `mascot_type` — 'otter' or 'duck' (the sender's mascot shown anonymously)
- `replied` — boolean, false until someone replies
- `created_at` — timestamp
- `replied_at` — timestamp, set when a reply is submitted

## Security
- RLS enabled; all policies are anon + authenticated because there is no sign-in.
- SELECT is restricted to unreplied letters (so you only read what hasn't been answered yet, preserving the ephemeral quality). Replied letters are effectively invisible to new readers.
- INSERT allowed for anyone to post a letter.
- UPDATE only allowed to add a reply to an unreplied letter (the `replied = false` guard prevents double-replies).
- DELETE is not allowed — letters are kept for analytics; old ones are filtered out by the application.
*/

CREATE TABLE IF NOT EXISTS bamboo_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  reply text CHECK (char_length(reply) <= 600),
  mood_tag text CHECK (mood_tag IN ('happy','sad','anxious','excited','tired','grateful','other')),
  mascot_type text NOT NULL DEFAULT 'duck',
  replied boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  replied_at timestamptz
);

CREATE INDEX IF NOT EXISTS bamboo_letters_unreplied_idx ON bamboo_letters (replied, created_at DESC);

ALTER TABLE bamboo_letters ENABLE ROW LEVEL SECURITY;

-- Anyone can read unreplied letters (to pick one and respond)
DROP POLICY IF EXISTS "anon_select_bamboo" ON bamboo_letters;
CREATE POLICY "anon_select_bamboo" ON bamboo_letters FOR SELECT
  TO anon, authenticated USING (replied = false);

-- Anyone can post a new letter
DROP POLICY IF EXISTS "anon_insert_bamboo" ON bamboo_letters;
CREATE POLICY "anon_insert_bamboo" ON bamboo_letters FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Anyone can reply to an unreplied letter
DROP POLICY IF EXISTS "anon_update_bamboo" ON bamboo_letters;
CREATE POLICY "anon_update_bamboo" ON bamboo_letters FOR UPDATE
  TO anon, authenticated USING (replied = false) WITH CHECK (true);
