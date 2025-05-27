/*
  # Fix cases table structure and policies

  1. Changes
    - Drop and recreate cases table with correct column types
    - Add proper RLS policies
    - Fix timestamp handling for court_date
    - Ensure proper user authorization checks

  2. Security
    - Enable RLS
    - Add policies for CRUD operations
    - Link cases to authenticated users via profiles
*/

-- Drop existing table and recreate with correct structure
DROP TABLE IF EXISTS cases;

CREATE TABLE cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  case_number text,
  client_name text NOT NULL,
  offense text,
  court text,
  court_date timestamptz,
  next_step text,
  follow_up text,
  checklist jsonb DEFAULT '{}'::jsonb,
  transcripts jsonb DEFAULT '{"audio": {"items": []}, "videos": {"items": []}}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted boolean DEFAULT false,
  user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Enable RLS
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create cases"
  ON cases
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can read own cases"
  ON cases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own cases"
  ON cases
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cases"
  ON cases
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create or replace the updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();