import axios from 'axios'
import { generateUniqueLink } from './LinkGeneratorService'
import { v4 as uuidv4 } from 'uuid'

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
  initial_data?: string // Agregar para coincidir con LinkGeneratorService
  created_at?: Date // Agregar para coincidir con LinkGeneratorService
  status?: string // Agregar para coincidir con LinkGeneratorService
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
    const linkId = await generateUniqueLink({
      id: uuidv4(),
      guest_name: inspectionData.guest_name,
      guest_email: inspectionData.guest_email,
      property_name: inspectionData.property_name,
      cart_number: inspectionData.cart_number,
      annotatedDiagramImage: inspectionData.annotatedDiagramImage,
      initial_data: JSON.stringify(inspectionData),
      created_at: new Date(),
      status: 'pending'
    })

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