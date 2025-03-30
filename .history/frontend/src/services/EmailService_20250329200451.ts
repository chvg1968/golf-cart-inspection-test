import axios from 'axios'
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
  initial_data?: string 
  created_at?: Date 
  status?: string 
}

export async function sendEmailWithPDF(emailData: EmailData) {
  try {
    const response = await axios.post('/api/send-email', emailData)
    return response.data
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export async function sendInspectionLink(inspectionData: InspectionData) {
  try {
    // Generar enlace único para la inspección
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL
    const inspectionLink = `${frontendUrl}/complete-inspection/${uuidv4()}`

    // Preparar datos para envío de correo
    const emailPayload = {
      to: inspectionData.guest_email,
      from: 'noreply@golfcartinspection.com',
      subject: 'Golf Cart Inspection Request',
      html: `
        <h1>Golf Cart Inspection Request</h1>
        <p>Hello ${inspectionData.guest_name},</p>
        <p>Please complete the golf cart inspection by clicking the link below:</p>
        <a href="${inspectionLink}">Complete Inspection</a>
      `
    }

    // Enviar correo usando SendGrid (simular con axios)
    await sendEmailWithPDF(emailPayload)

    return inspectionData
  } catch (error) {
    console.error('Error sending inspection link:', error)
    throw error
  }
}

export async function sendCompletedInspectionEmail(completedInspectionData: any) {
  try {
    // Lógica para enviar PDF completado al usuario inicial
    const emailPayload = {
      to: completedInspectionData.initial_user_email,
      from: 'noreply@golfcartinspection.com',
      subject: 'Completed Golf Cart Inspection',
      html: `
        <h1>Completed Golf Cart Inspection</h1>
        <p>The inspection for ${completedInspectionData.guest_name} is now complete.</p>
      `,
      attachments: [
        {
          content: completedInspectionData.pdfBase64,
          filename: 'completed-inspection.pdf',
          type: 'application/pdf'
        }
      ]
    }

    await sendEmailWithPDF(emailPayload)
  } catch (error) {
    console.error('Error sending completed inspection email:', error)
    throw error
  }
}