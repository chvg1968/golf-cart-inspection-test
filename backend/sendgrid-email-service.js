import sgMail from '@sendgrid/mail'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

// Configuración de variables de entorno
const envPath = path.resolve(process.cwd(), '.env')
const result = dotenv.config({ path: envPath })

const apiKey = process.env.SENDGRID_API_KEY

if (!apiKey) {
  console.error('ERROR: No se encontró la clave de API de SendGrid')
  throw new Error('Clave de API de SendGrid no configurada')
}

sgMail.setApiKey(apiKey)

export async function sendInspectionLinkEmail(to, link, guestName, propertyName) {
  try {
    // Generar un ID único para el correo
    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Validaciones adicionales de entrada
    if (!to || !link || !guestName) {
      console.error('Parámetros inválidos:', { to, link, guestName })
      throw new Error('Parámetros de correo incompletos')
    }

    // Verificar dominio de correo
    const emailDomain = to.split('@')[1].toLowerCase()
    const knownHotmailDomains = ['hotmail.com', 'outlook.com', 'live.com', 'windowslive.com']
    const isHotmailDomain = knownHotmailDomains.includes(emailDomain)

    console.log('Detalles de diagnóstico:', {
      emailDomain,
      isHotmailDomain,
      to,
      link,
      guestName,
      propertyName
    })

    const msg = {
      to: to,
      from: {
        email: 'hernancalendar01@gmail.com', 
        name: 'Golf Cart Inspection'
      },
      replyTo: 'hernancalendar01@gmail.com',
      subject: `Formulario de Inspección - ${propertyName || 'Propiedad'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
          <div style="background-color: #f4f4f4; padding: 10px; text-align: center;">
            <img src="https://via.placeholder.com/150x50.png?text=Golf+Cart+Inspection" alt="Logo" style="max-width: 150px;">
          </div>
          <div style="padding: 20px; background-color: white;">
            <h2 style="color: #333; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Invitación de Inspección</h2>
            <p style="color: #666;">Hola ${guestName},</p>
            <p style="color: #666;">Ha sido invitado a completar un formulario de inspección de carrito de golf.</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${link}" style="
                display: inline-block; 
                background-color: #4CAF50; 
                color: white; 
                padding: 12px 24px; 
                text-decoration: none; 
                border-radius: 5px;
                font-weight: bold;">
                Completar Formulario
              </a>
            </div>
            <p style="color: #666; font-size: 0.9em;">
              Este enlace es válido por 24 horas. Si no solicitó esta inspección, puede ignorar este correo.
            </p>
            <p style="color: #999; font-size: 0.8em; margin-top: 20px;">
              Si tiene problemas, copie y pegue este enlace en su navegador: ${link}
            </p>
          </div>
          <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 0.8em; color: #666;">
            ${new Date().getFullYear()} Golf Cart Inspection
          </div>
        </div>
      `,
      // Configuraciones avanzadas para mejorar entregabilidad
      headers: {
        'Message-ID': `<${messageId}@golfcartinspection.com>`,
        'X-Mailer': 'SendGrid',
        // Añadir encabezados para dominios Microsoft
        ...(isHotmailDomain ? {
          'X-MS-Exchange-Organization-SkipMccScan': 'true',
          'X-MS-Exchange-Organization-SkipSafetyNetAntiSpam': 'true'
        } : {})
      },
      trackingSettings: {
        clickTracking: {
          enable: true,
          enableText: true
        },
        openTracking: {
          enable: true
        }
      },
      categories: ['golf-cart-inspection', 'user-invitation'],
      mailSettings: {
        sandboxMode: {
          enable: false
        }
      }
    }

    console.log('Configuración de correo:', JSON.stringify(msg, null, 2))

    const response = await sgMail.send(msg)
    
    console.log('Correo enviado. Código de estado:', response[0].statusCode)
    console.log('Message-ID:', messageId)
    console.log('Respuesta completa:', JSON.stringify(response, null, 2))
    
    return response
  } catch (error) {
    console.error('Error en envío de correo:', {
      message: error.message,
      code: error.code,
      response: error.response ? JSON.stringify(error.response.body) : 'Sin respuesta',
      stack: error.stack
    })
    throw error
  }
}
