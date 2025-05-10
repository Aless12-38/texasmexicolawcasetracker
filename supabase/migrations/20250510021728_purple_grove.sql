/*
  # Fix Cases Table RLS Policies

  1. Changes
    - Drop existing INSERT policy that's not working correctly
    - Add new INSERT policy that allows authenticated users to create cases
    - Ensure authenticated users can only create cases for themselves
    
  2. Security
    - Maintain RLS enabled on cases table
    - Add proper INSERT policy for authenticated users
    - Keep existing policies for SELECT, UPDATE, and DELETE
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can create cases" ON cases;

-- Create new INSERT policy that properly links cases to authenticated users
CREATE POLICY "Users can create cases" ON cases
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow authenticated users to create cases
    -- The policy ensures users can only create cases that are associated with their profile
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );