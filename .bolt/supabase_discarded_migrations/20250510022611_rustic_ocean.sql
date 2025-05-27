/*
  # Add case_number column to cases table

  1. Changes
    - Add `case_number` column to `cases` table
    - Make it nullable since existing records won't have a value

  2. Security
    - No changes to RLS policies needed as this is just adding a column
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cases' AND column_name = 'case_number'
  ) THEN
    ALTER TABLE cases ADD COLUMN case_number text;
  END IF;
END $$;