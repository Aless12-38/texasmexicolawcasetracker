/*
  # Create cases table for case management system

  1. New Tables
    - `cases`
      - `id` (uuid, primary key)
      - `type` (text) - Case type/category (e.g., 'upcoming', 'heavy', 'dallas')
      - `caseNumber` (text) - Unique case identifier
      - `clientName` (text) - Name of the client
      - `offense` (text) - Type of offense
      - `court` (text) - Court where the case is being heard
      - `courtDate` (timestamptz) - Date of court appearance
      - `nextStep` (text) - Next action required
      - `followUp` (timestamptz) - Follow-up date
      - `checklist` (jsonb) - Case checklist items
      - `transcripts` (jsonb) - Transcript information
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record last update timestamp
      - `deleted` (boolean) - Soft delete flag

  2. Security
    - Enable RLS on `cases` table
    - Add policies for authenticated users to:
      - Read their own cases
      - Create new cases
      - Update their own cases
      - Delete their own cases
*/

CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  caseNumber text,
  clientName text NOT NULL,
  offense text,
  court text,
  courtDate timestamptz,
  nextStep text,
  followUp timestamptz,
  checklist jsonb DEFAULT '{}'::jsonb,
  transcripts jsonb DEFAULT '{
    "videos": {"items": []},
    "audio": {"items": []}
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own cases"
  ON cases
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can create cases"
  ON cases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update own cases"
  ON cases
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE id = auth.uid()
  ))
  WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete own cases"
  ON cases
  FOR DELETE
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE id = auth.uid()
  ));

-- Add updated_at trigger
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