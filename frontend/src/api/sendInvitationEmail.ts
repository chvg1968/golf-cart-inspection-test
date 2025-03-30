import { generateInspectionLink } from '@/services/LinkGeneratorService'
import type { GuestInfo, EmailData } from '@/types/base-types'

export async function sendInspectionLink(
  guestInfo: GuestInfo, 
  propertyId: string, 
  cartType: string, 
  initialUserId?: string
): Promise<string> {
  try {
    // Generar enlace de inspección
    const inspectionLink = await generateInspectionLink(
      guestInfo, 
      propertyId, 
      cartType, 
      initialUserId
    )

    // Preparar datos de correo
    const emailData: EmailData = {
      to: guestInfo.email || '',
      subject: 'Enlace de Inspección de Carrito de Golf',
      html: `
        <p>Hola ${guestInfo.name},</p>
        <p>Por favor, haga clic en el siguiente enlace para completar la inspección del carrito de golf:</p>
        <a href="${inspectionLink}">${inspectionLink}</a>
        <p>Gracias,<br>Equipo de Inspección</p>
      `
    }

    // Simular envío de correo
    console.log('Enviando correo:', emailData)

    return inspectionLink
  } catch (error) {
    console.error('Error enviando enlace de inspección:', error)
    throw error
  }
}

interface EmailInvitationRequest {
  email: string
  formData?: any
}

export const sendInvitationEmail = async (request: EmailInvitationRequest) => {
  try {
    // Implementación de envío de correo de invitación
    console.log('Enviando correo de invitación:', request)
    return {
      success: true,
      message: 'Correo de invitación enviado'
    }
  } catch (error) {
    console.error('Error en sendInvitationEmail:', error)
    return {
      success: false,
      message: 'Error al enviar correo de invitación'
    }
  }
}
