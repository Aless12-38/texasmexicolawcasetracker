/*
  # Create cases table and policies

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
    - Enable RLS on cases table
    - Add policies for authenticated users to:
      - Create cases
      - Read own cases
      - Update own cases
      - Delete own cases
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

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cases' 
    AND policyname = 'Users can create cases'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cases' 
    AND policyname = 'Users can read own cases'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cases' 
    AND policyname = 'Users can update own cases'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cases' 
    AND policyname = 'Users can delete own cases'
  ) THEN
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
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_cases_updated_at'
  ) THEN
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
  END IF;
END $$;