/*
  # Fix RLS policies for cases table

  1. Changes
    - Drop existing RLS policies for cases table
    - Create new RLS policies that properly handle user authentication and ownership
    
  2. Security
    - Enable RLS on cases table
    - Add policies for:
      - INSERT: Users can create cases with their own user_id
      - SELECT: Users can read their own cases
      - UPDATE: Users can update their own cases
      - DELETE: Users can delete their own cases
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create cases" ON cases;
DROP POLICY IF EXISTS "Users can read own cases" ON cases;
DROP POLICY IF EXISTS "Users can update own cases" ON cases;
DROP POLICY IF EXISTS "Users can delete own cases" ON cases;

-- Recreate policies with correct conditions
CREATE POLICY "Users can create cases"
ON cases
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can read own cases"
ON cases
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

CREATE POLICY "Users can update own cases"
ON cases
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can delete own cases"
ON cases
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
);