/*
  # Update RLS policies for cases table

  1. Changes
    - Drop existing RLS policies
    - Create new policies that allow all authenticated users to:
      - Create new cases
      - Read all cases
      - Update any case
      - Delete any case
    
  2. Security
    - Only authenticated users can access cases
    - No restrictions on which cases users can access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create cases" ON cases;
DROP POLICY IF EXISTS "Users can read own cases" ON cases;
DROP POLICY IF EXISTS "Users can update own cases" ON cases;
DROP POLICY IF EXISTS "Users can delete own cases" ON cases;

-- Create new policies that allow all authenticated users to access all cases
CREATE POLICY "Users can create cases"
ON cases
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can read all cases"
ON cases
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update any case"
ON cases
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can delete any case"
ON cases
FOR DELETE
TO authenticated
USING (true);