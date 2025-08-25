-- Check current storage policies for pdfs bucket
SELECT * FROM storage.policies WHERE bucket_id = 'pdfs';

-- Check if bucket exists and is public
SELECT * FROM storage.buckets WHERE name = 'pdfs';

-- Create policies if they don't exist (run these if needed)

-- Allow public read access to PDFs
-- INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression, command)
-- VALUES (
--   'public_pdf_read',
--   'pdfs',
--   'Allow public read access to PDFs',
--   'true',
--   'true',
--   'SELECT'
-- );

-- Allow authenticated users to upload PDFs
-- INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression, command)
-- VALUES (
--   'authenticated_pdf_upload',
--   'pdfs', 
--   'Allow authenticated users to upload PDFs',
--   'auth.role() = ''authenticated''',
--   'auth.role() = ''authenticated''',
--   'INSERT'
-- );

-- Allow authenticated users to update their own PDFs
-- INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression, command)
-- VALUES (
--   'authenticated_pdf_update',
--   'pdfs',
--   'Allow authenticated users to update PDFs', 
--   'auth.role() = ''authenticated''',
--   'auth.role() = ''authenticated''',
--   'UPDATE'
-- );