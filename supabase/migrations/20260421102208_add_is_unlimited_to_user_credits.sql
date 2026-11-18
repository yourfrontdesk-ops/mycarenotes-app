/*
  # Add is_unlimited flag to user_credits

  ## Overview
  Adds a boolean `is_unlimited` column to `user_credits` so designated accounts
  can generate unlimited notes without consuming credits. Intended for admin/promo use.

  ## Changes
  - Adds `is_unlimited` (boolean, default false) to `user_credits`
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_credits' AND column_name = 'is_unlimited'
  ) THEN
    ALTER TABLE user_credits ADD COLUMN is_unlimited boolean NOT NULL DEFAULT false;
  END IF;
END $$;
