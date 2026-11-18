/*
  # Create user credits and subscriptions tables

  ## Overview
  Adds billing support to track per-user note credits and active subscriptions.

  ## New Tables

  ### `user_credits`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users, unique) — one row per user
  - `credits` (integer) — remaining one-time note credits
  - `updated_at` (timestamptz)

  ### `user_subscriptions`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users, unique) — one active sub per user
  - `stripe_subscription_id` (text) — Stripe subscription ID
  - `status` (text) — 'active', 'canceled', 'past_due', etc.
  - `current_period_end` (timestamptz) — when the current billing period ends
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - RLS enabled on both tables
  - Users can only read their own rows
  - Only service role can insert/update (managed by edge functions)
*/

CREATE TABLE IF NOT EXISTS user_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own credits"
  ON user_credits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
