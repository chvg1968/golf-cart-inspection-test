import dotenv from 'dotenv'
import { sendInspectionLinkEmail } from './sendgrid-email-service.js'

// Cargar variables de entorno
dotenv.config()

async function testEmailSend() {
  try {
    const apiKey = process.env.SENDGRID_API_KEY
    console.log('API Key: ' + (apiKey ? 'Presente' : 'Ausente'))
    console.log('API Key (primeros 5 caracteres): ' + (apiKey ? apiKey.slice(0, 5) : 'N/A'))

    console.log('Enviando correo de prueba...')
    const result = await sendInspectionLinkEmail(
      'conradovilla@hotmail.com', // Reemplaza con un correo real para pruebas
      'https://ejemplo.com/inspeccion/123', 
      'Juan Pérez', 
      'Campo de Golf Sunset'
    )
    console.log('Correo enviado con éxito:', result)
  } catch (error) {
    console.error('Error en prueba de envío de correo:', error)
  }
}

testEmailSend()
