/*
  # Fix database schema for cases table

  1. Changes
    - Drop and recreate cases table with correct column names and types
    - Add proper constraints and defaults
    - Enable RLS with appropriate policies
    - Add updated_at trigger

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

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

-- Create policies for authenticated users
CREATE POLICY "Users can create cases"
ON cases FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can read all cases"
ON cases FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can update any case"
ON cases FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can delete any case"
ON cases FOR DELETE TO authenticated
USING (true);

-- Create updated_at trigger
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