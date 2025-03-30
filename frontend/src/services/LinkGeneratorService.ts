import { supabase } from '@/lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import type { GuestInfo } from '@/types/base-types'

export async function generateInspectionLink(
  guestInfo: GuestInfo, 
  propertyId: string, 
  cartType: string, 
  initialUserId?: string
): Promise<string> {
  try {
    const linkId = uuidv4()

    // Generar enlace con información inicial
    await supabase
      .from('inspection_links')
      .insert({
        id: linkId,
        guest_name: guestInfo.name,
        guest_email: guestInfo.email,
        property_id: propertyId,
        cart_type: cartType,
        initial_user_id: initialUserId,
        status: 'pending'
      })

    // Construir URL del enlace
    const baseUrl = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:8080'
    const inspectionLink = `${baseUrl}/inspection/${linkId}`

    return inspectionLink
  } catch (error) {
    console.error('Error generando enlace de inspección:', error)
    throw error
  }
}