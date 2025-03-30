// Dependencias para envío de correo y generación de PDF
export { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
export { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.0'
export { default as sgMail } from 'https://esm.sh/@sendgrid/mail@7.7.0'
export { PDFDocument } from 'https://esm.sh/pdf-lib@1.17.1'
export { encode } from 'https://deno.land/std@0.168.0/encoding/base64.ts'
