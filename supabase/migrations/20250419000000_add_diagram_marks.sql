/*
  # Create diagram_marks table
  
  1. New Table
    - `diagram_marks`
      - `id` (uuid, primary key)
      - `diagram_name` (text, unique)
      - `points` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `diagram_marks` table
    - Add policies for public access to read diagram marks
    - Add policies for authenticated users to create/update diagram marks
*/

-- Create the diagram_marks table
CREATE TABLE IF NOT EXISTS diagram_marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diagram_name text UNIQUE NOT NULL,
  points jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE diagram_marks ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anyone to read diagram marks
CREATE POLICY "Anyone can read diagram marks"
  ON diagram_marks
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to create diagram marks
CREATE POLICY "Authenticated users can create diagram marks"
  ON diagram_marks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update diagram marks
CREATE POLICY "Authenticated users can update diagram marks"
  ON diagram_marks
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);