/*
  # Fix cases table schema

  1. Drop existing table and recreate with correct column names
  2. Add RLS policies
  3. Add updated_at trigger

  This migration ensures the table schema matches the frontend code.
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
  follow_up timestamptz,
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