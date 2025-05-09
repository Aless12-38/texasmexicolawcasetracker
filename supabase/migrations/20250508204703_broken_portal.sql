/*
  # Add INSERT policy for profiles table

  1. Security Changes
    - Add policy for authenticated users to:
      - Create their own profile during signup
    
  2. Notes
    - This policy ensures users can only create a profile with their own ID
    - Maintains security while enabling profile creation during signup
*/

CREATE POLICY "Users can create own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);