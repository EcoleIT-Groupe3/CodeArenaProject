/*
  # Add INSERT policy for profiles table

  This migration adds the missing INSERT policy for the profiles table.
  
  ## Changes
  - Adds policy allowing authenticated users to insert their own profile
  - Policy ensures users can only create a profile for their own auth.uid()
*/

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
