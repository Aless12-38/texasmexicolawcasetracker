/*
  # Create cases table with proper column naming

  1. New Tables
    - `cases`
      - `id` (uuid, primary key)
      - `type` (text, not null)
      - `case_number` (text)
      - `client_name` (text, not null)
      - `offense` (text)
      - `court` (text)
      - `court_date` (timestamptz)
      - `next_step` (text)
      - `follow_up` (text)
      - `checklist` (jsonb)
      - `transcripts` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `deleted` (boolean)

  2. Security
    - Enable RLS
    - Add policies for authenticated users to:
      - Create their own cases
      - Read their own cases
      - Update their own cases
      - Delete their own cases
*/

CREATE TABLE IF NOT EXISTS cases (
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
  deleted boolean DEFAULT false
);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create cases"
  ON cases
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT profiles.id
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can read own cases"
  ON cases
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT profiles.id
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can update own cases"
  ON cases
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT profiles.id
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT profiles.id
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own cases"
  ON cases
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT profiles.id
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

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