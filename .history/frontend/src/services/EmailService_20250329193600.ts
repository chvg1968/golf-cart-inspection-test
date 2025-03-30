import axios from 'axios'
import { generateUniqueLink } from './LinkGeneratorService'

export interface EmailData {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    content: string
    filename: string
    type: string
    disposition?: string
  }>
}

export interface InspectionData {
  guest_name: string
  guest_email: string
  property_name?: string
  cart_number?: string
  annotatedDiagramImage: string
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

export const sendInspectionLink = async (inspectionData: InspectionData) => {
  try {
    // Generar enlace único
    const linkId = await generateUniqueLink(inspectionData)

    // Construir URL de inspección
    const baseUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000'
    const inspectionUrl = `${baseUrl}/complete-inspection/${linkId}`

    // Preparar contenido del correo
    const emailContent = `
      <h1>Golf Cart Inspection Request</h1>
      <p>Hello ${inspectionData.guest_name},</p>
      <p>Please complete the golf cart inspection by clicking the link below:</p>
      <a href="${inspectionUrl}">Complete Inspection</a>
    `

    // Enviar correo
    await sendEmailWithPDF({
      to: inspectionData.guest_email,
      subject: 'Golf Cart Inspection Request',
      html: emailContent
    })

    return linkId
  } catch (error) {
    console.error('Error sending inspection link:', error)
    throw new Error('Failed to send inspection link')
  }
}