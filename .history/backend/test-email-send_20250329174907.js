import dotenv from 'dotenv'
import { sendInspectionLinkEmail } from './sendgrid-email-service.js'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Depuración de carga de variables de entorno
console.log('Directorio actual:', process.cwd())
console.log('Ruta del script:', import.meta.url)

// Configuración para cargar variables de entorno
const envPath = path.resolve(process.cwd(), '.env')
console.log('Ruta del archivo .env:', envPath)

// Intentar cargar variables de entorno de múltiples ubicaciones
const envFiles = [
  '.env',
  '../.env',
  '.env.local',
  '../.env.local'
]

let envLoaded = false
for (const envFile of envFiles) {
  try {
    const fullPath = path.resolve(process.cwd(), envFile)
    console.log(`Intentando cargar: ${fullPath}`)
    
    if (fs.existsSync(fullPath)) {
      const result = dotenv.config({ 
        path: fullPath,
        debug: true // Modo de depuración para ver más detalles
      })
      console.log(`Resultado de carga de ${envFile}:`, result)
      
      if (result.error) {
        console.error('Error al cargar .env:', result.error)
      } else {
        envLoaded = true
        break
      }
    }
  } catch (error) {
    console.error(`Error al procesar ${envFile}:`, error)
  }
}

if (!envLoaded) {
  console.error('No se pudo cargar ningún archivo de variables de entorno')
}

// Imprimir todas las variables de entorno
console.log('Variables de entorno:', Object.keys(process.env))
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'Presente' : 'Ausente')

async function testEmailSend() {
  try {
    // Limpiar el valor de la API Key para eliminar espacios
    const apiKey = (process.env.SENDGRID_API_KEY || '').trim()
    console.log('API Key: ' + (apiKey ? 'Presente' : 'Ausente'))
    console.log('API Key (primeros 5 caracteres): ' + (apiKey ? apiKey.slice(0, 5) : 'N/A'))

    // Generar enlace de inspección
    const linkId = uuidv4()
    const baseUrl = 'https://golfinspection.netlify.app'
    const inspectionLink = `${baseUrl}/complete-inspection/${linkId}`

    // Datos de prueba para el correo
    const testEmail = 'conradovilla@gmail.com'
    const testGuestName = 'Juan Pérez'
    const testPropertyName = 'Campo de Golf Sunset'

    console.log('Detalles de prueba:', {
      email: testEmail,
      link: inspectionLink,
      guestName: testGuestName,
      propertyName: testPropertyName
    })

    console.log('Enviando correo de prueba...')
    const result = await sendInspectionLinkEmail(
      testEmail, 
      inspectionLink, 
      testGuestName, 
      testPropertyName
    )
    console.log('Correo enviado con éxito:', result)
  } catch (error) {
    console.error('Error en prueba de envío de correo:', error)
    
    // Imprimir detalles específicos del error
    if (error.response) {
      console.error('Detalles de la respuesta de error:', JSON.stringify(error.response, null, 2))
    }
  }
}

testEmailSend()
