import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { PDFGenerator } from './pdf-generator.ts'
import { EmailOptions, InspectionFormData } from './types.ts'
import sgMail from '@sendgrid/mail'

// Configurar SendGrid
const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY') || ''
const verifiedSender = Deno.env.get('SENDGRID_VERIFIED_SENDER') || ''

sgMail.setApiKey(sendgridApiKey)

async function handleEmailRequest(req: Request): Promise<Response> {
  // Manejar solicitudes CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  // Validar método de solicitud
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    // Parsear datos de la solicitud
    const formData: InspectionFormData = await req.json()

    // Generar PDF
    const pdfBytes = await PDFGenerator.generate({
      formData,
      includeObservations: true,
      includeSignature: true
    })

    // Configurar opciones de correo electrónico
    const emailOptions: EmailOptions = {
      to: formData.guestEmail,
      from: verifiedSender,
      subject: 'Informe de Inspección de Carrito de Golf',
      formData
    }

    // Enviar correo electrónico con PDF adjunto
    const msg = {
      to: emailOptions.to,
      from: emailOptions.from,
      subject: emailOptions.subject,
      html: `
        <h1>Informe de Inspección de Carrito de Golf</h1>
        <p>Estimado/a ${formData.guestName},</p>
        <p>Adjunto encontrará el informe de inspección de su carrito de golf.</p>
        <p>Detalles de la inspección:</p>
        <ul>
          <li>Propiedad: ${formData.propertyId}</li>
          <li>Tipo de Carrito: ${formData.cartType}</li>
          <li>Número de Carrito: ${formData.cartNumber}</li>
        </ul>
        <p>Por favor, revise el documento adjunto y no dude en contactarnos si tiene alguna pregunta.</p>
      `,
      attachments: [
        {
          content: Buffer.from(pdfBytes).toString('base64'),
          filename: 'inspeccion_carrito.pdf',
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    }

    await sgMail.send(msg)

    return new Response(JSON.stringify({ message: 'Correo enviado exitosamente' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error procesando solicitud:', error)
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

serve(handleEmailRequest)