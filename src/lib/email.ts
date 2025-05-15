import { v4 as uuidv4 } from 'uuid';

export interface EmailParams {
  to_name: string;
  to_email: string;
  from_name?: string;
  from_email?: string;
  property: string;
  type?: 'guest-form' | 'completed-form';
  cart_type?: string;
  cart_number?: string;
  inspection_date?: string;
  form_link?: string;
  pdf_attachment?: string;
  reply_to?: string;
  subject?: string;
  observations?: string;
  diagram_base64?: string;
  formId?: string;
  form_id?: string;
  guestName?: string;
  isAdmin?: boolean;
  skipAdminAlert?: boolean;
  adminAlert?: boolean;
  diagram_points?: Array<{
    x: number;
    y: number;
    color: string;
    size?: number;
  }>;
}

export function generateMessageId(): string {
  try {
    // Generar UUID v4 seguro
    const uuid = uuidv4();
    
    // Usar el dominio desde variables de entorno
    const domain = process.env.EMAIL_DOMAIN || 'mail.luxepropertiespr.com';
    
    return `<${uuid}@${domain}>`;
  } catch (error) {
    console.error('Error generating message ID:', error);
    throw new Error('Failed to generate secure message ID');
  }
}

export async function sendFormEmail(type: 'guest-form' | 'completed-form', params: EmailParams) {

  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        guestName: params.to_name,
        guestEmail: params.to_email,
        property: params.property,
        type,
        cartType: params.cart_type,
        cartNumber: params.cart_number,
        inspectionDate: params.inspection_date,
        formLink: params.form_link,
        pdfBase64: params.pdf_attachment,
        diagramPoints: params.diagram_points,
        replyTo: params.reply_to || 'support@luxepropertiespr.com',
        isAdmin: params.isAdmin,
        skipAdminAlert: params.isAdmin ? true : params.skipAdminAlert,
        adminAlert: params.adminAlert,
        subject: params.subject || (
          type === 'guest-form'
            ? `Formulario de Inspección de Carrito de Golf - ${params.property}`
            : `Inspección de Carrito de Golf Completada - ${params.property}`
        )
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error en la respuesta del servicio de correo:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody
      });

      throw new Error(`Error al enviar correo: ${response.status} - ${errorBody}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error completo al enviar correo:', {
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorName: error instanceof Error ? error.name : 'Unknown error type',
      errorStack: error instanceof Error ? error.stack : 'No stack trace'
    });

    throw error;
  }
}