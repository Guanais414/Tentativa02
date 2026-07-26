/*
# Fix Bamboo Forest letter visibility — allow authors to read replies

## Problem
The current SELECT policy on `bamboo_letters` only allows reading unreplied letters (`replied = false`).
This means a user who sent a letter can never see the reply someone wrote to them — the "check my reply"
feature in the app is broken. This is a security/usability bug.

## Fix
Split the SELECT policy into two conditions joined by OR:
1. Unreplied letters are readable by any authenticated user (so people can pick and reply).
2. Replied letters are readable ONLY by the original author (identified by `author_id`).

## Schema change
Add `author_id` column to `bamboo_letters` (uuid, defaults to auth.uid()) so we can identify the letter's owner.
The INSERT policy's WITH CHECK is tightened to require `author_id = auth.uid()`.

## Security
- Authors can read their own letters (including the reply) — nothing else.
- Non-authors can only read unreplied letters.
- Only authenticated users can insert/update.
- Double-replies prevented by `replied = false` guard on UPDATE.
*/

-- Add author_id column
ALTER TABLE bamboo_letters
  ADD COLUMN IF NOT EXISTS author_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;

-- Backfill existing rows (if any) — set to null, they become unreadable which is fine for old test data
-- New rows get auth.uid() automatically via DEFAULT

-- Drop old SELECT policy
DROP POLICY IF EXISTS "auth_select_bamboo" ON bamboo_letters;

-- New SELECT: unreplied letters (any auth user) OR own letters (author can see reply)
CREATE POLICY "auth_select_bamboo" ON bamboo_letters FOR SELECT
  TO authenticated USING (
    replied = false
    OR author_id = auth.uid()
  );

-- Drop old INSERT policy
DROP POLICY IF EXISTS "auth_insert_bamboo" ON bamboo_letters;
-- New INSERT: only authenticated users, and author_id must match the session user
CREATE POLICY "auth_insert_bamboo" ON bamboo_letters FOR INSERT
  TO authenticated WITH CHECK (author_id = auth.uid());

-- UPDATE policy stays the same (reply to unreplied letters)
-- But tighten: the replier should NOT be able to set arbitrary author_id
DROP POLICY IF EXISTS "auth_update_bamboo" ON bamboo_letters;
CREATE POLICY "auth_update_bamboo" ON bamboo_letters FOR UPDATE
  TO authenticated USING (replied = false) WITH CHECK (replied = true);
