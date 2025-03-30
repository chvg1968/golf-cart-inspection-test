import { supabase } from '@/lib/supabaseClient'
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

export async function ensureAuthentication() {
  try {
    // Obtener la sesión actual
    const { data: sessionData } = await supabase.auth.getSession()
    
    // Si no hay sesión, intentar iniciar sesión con credenciales de servicio
    if (!sessionData.session) {
      console.log('No hay sesión activa. Intentando autenticación de servicio.')
      
      const serviceEmail = import.meta.env.VITE_SERVICE_EMAIL
      const servicePassword = import.meta.env.VITE_SERVICE_PASSWORD

      if (!serviceEmail || !servicePassword) {
        throw new Error('Credenciales de servicio no configuradas')
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: serviceEmail,
        password: servicePassword
      })

      if (error) {
        console.error('Error de autenticación de servicio:', error)
        throw error
      }

      console.log('Autenticación de servicio exitosa')
      return data.session
    }

    return sessionData.session
  } catch (error) {
    console.error('Error en ensureAuthentication:', error)
    throw error
  }
}

export async function sendEmailWithPDF(emailData: EmailData) {
  try {
    // Asegurar autenticación
    const session = await ensureAuthentication()

    if (!session) {
      throw new Error('No se pudo establecer una sesión')
    }

    const token = session.access_token
    console.log('Session token:', token)
    console.log('Email data:', JSON.stringify(emailData, null, 2))

    const corsHeaders = {
      'Access-Control-Allow-Origin': import.meta.env.VITE_FRONTEND_URL,
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Credentials': 'true'
    }

    const response = await fetch('https://rqhxljmtacohouycjnus.supabase.co/functions/v1/send-email', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(emailData)
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error sending email:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    const responseData = await response.json()
    console.log('Response data:', responseData)

    return responseData
  } catch (error) {
    console.error('Detailed error sending email:', error)
    throw error
  }
}

export async function sendInspectionLink(inspectionData: InspectionData) {
  try {
    // Verificar que la URL del frontend esté definida
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL
    if (!frontendUrl) {
      throw new Error('Frontend URL is not defined in environment variables')
    }

    // Generar enlace único para la inspección
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

    // Enviar correo usando función de Supabase
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