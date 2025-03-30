import axios from 'axios'
import { LinkGeneratorService } from './LinkGeneratorService'

export interface EmailData {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    content: string
    filename: string
    type: string
  }>
}

export const sendEmailWithPDF = async (emailData: EmailData) => {
  try {
    const response = await axios.post('/api/send-email', emailData)
    return response.data
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export const sendInspectionLink = async (inspectionData: {
  guest_name: string
  guest_email: string
  property_name?: string
  cart_number?: string
}) => {
  try {
    // Generar enlace único
    const inspectionLink = await LinkGeneratorService.generateUniqueLink(inspectionData)

    // Preparar datos de correo
    const emailData: EmailData = {
      to: inspectionData.guest_email,
      subject: `Formulario de Inspección de Carrito de Golf - ${inspectionData.property_name || 'Propiedad'}`,
      html: `
        <p>Estimado/a ${inspectionData.guest_name},</p>
        <p>Ha sido invitado a completar un formulario de inspección de carrito de golf.</p>
        <p>Por favor, haga clic en el siguiente enlace para continuar:</p>
        <p><a href="${inspectionLink}">Completar Formulario de Inspección</a></p>
        <p>Este enlace es válido por 24 horas.</p>
        <p>Saludos cordiales,<br>Equipo de Inspección de Carrito de Golf</p>
      `
    }

    // Enviar correo con enlace
    const response = await axios.post('/api/send-email', emailData)
    return response.data
  } catch (error) {
    console.error('Error enviando correo de inspección:', error)
    throw error
  }
}
