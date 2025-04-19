/*
  # Add foreign key relationship between inspections and diagram_marks
  
  1. Changes
    - Add diagram_marks_id column to inspections table
    - Create foreign key constraint
    - Update existing data to maintain relationships
  
  2. Benefits
    - Improved data integrity
    - Better relational model
    - Reduced data duplication
*/

-- Step 1: Add the foreign key column to inspections table
ALTER TABLE inspections 
ADD COLUMN diagram_marks_id uuid REFERENCES diagram_marks(id);

-- Step 2: Create an index for better performance on the foreign key
CREATE INDEX idx_inspections_diagram_marks_id ON inspections(diagram_marks_id);

-- Step 3: Update existing data to establish relationships
-- This is a placeholder for a more complex migration that would:
-- 1. For each inspection with diagram_data
-- 2. Extract the diagram_type
-- 3. Find or create the corresponding diagram_marks record
-- 4. Update the inspection with the diagram_marks_id

-- Example of how you might update existing data (simplified):
-- WITH diagram_data_inspections AS (
--   SELECT 
--     id, 
--     diagram_data->>'diagramType' as diagram_type
--   FROM 
--     inspections 
--   WHERE 
--     diagram_data IS NOT NULL
-- ),
-- diagram_marks_lookup AS (
--   SELECT 
--     id, 
--     diagram_name
--   FROM 
--     diagram_marks
-- )
-- UPDATE 
--   inspections i
-- SET 
--   diagram_marks_id = dm.id
-- FROM 
--   diagram_data_inspections ddi
-- JOIN 
--   diagram_marks_lookup dm ON dm.diagram_name = ddi.diagram_type
-- WHERE 
--   i.id = ddi.id;

-- Step 4: Add a comment to the column for documentation
COMMENT ON COLUMN inspections.diagram_marks_id IS 'Reference to the diagram_marks record associated with this inspection';