-- Crear tabla para formularios de inspección
CREATE TABLE IF NOT EXISTS inspection_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  property TEXT NOT NULL,
  cart_type TEXT,
  cart_number TEXT,
  inspection_date TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  diagram_data JSONB,
  observations TEXT,
  signature_data TEXT,
  terms_accepted BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  form_link TEXT UNIQUE
);

-- Índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS inspection_forms_guest_email_idx ON inspection_forms(guest_email);
CREATE INDEX IF NOT EXISTS inspection_forms_status_idx ON inspection_forms(status);
CREATE INDEX IF NOT EXISTS inspection_forms_form_link_idx ON inspection_forms(form_link);

-- Función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_inspection_forms_updated_at
BEFORE UPDATE ON inspection_forms
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
