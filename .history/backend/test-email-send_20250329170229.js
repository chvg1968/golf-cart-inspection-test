import 'dotenv/config'
const { sendInspectionLinkEmail } = require('./sendgrid-email-service')

async function testEmailSend() {
  try {
    // Datos de prueba
    const testData = {
      to: 'conradovilla@hotmail.com', // Reemplazar con un correo real para pruebas
      link: 'https://example.com/complete-inspection/test-link-123',
      guestName: 'Juan Pérez',
      propertyName: 'Campo de Golf Sunset'
    }

    console.log('Enviando correo de prueba...')
    const result = await sendInspectionLinkEmail(
      testData.to, 
      testData.link, 
      testData.guestName, 
      testData.propertyName
    )
    
    console.log('Prueba de envío de correo completada.')
    console.log('Detalles de respuesta:', result)
  } catch (error) {
    console.error('Error en prueba de envío de correo:', error)
  }
}

// Ejecutar prueba
testEmailSend()
