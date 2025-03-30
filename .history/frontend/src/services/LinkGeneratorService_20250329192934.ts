import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@supabase/supabase-js'
import { useSupabaseUser } from '@/composables/useSupabaseUser'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)
const { user } = useSupabaseUser()
export interface InspectionLink {
  id: string
  guest_name: string
  guest_email: string
  property_name?: string
  cart_number?: string
  status: 'pending' | 'completed'
  initial_data: string
  created_at: Date
  annotatedDiagram:string
}

export class LinkGeneratorService {
  static async generateUniqueLink(inspectionData: {
    guest_name: string
    guest_email: string
    property_name?: string
    cart_number?: string
  }): Promise<string> {
    // Generar un UUID único para el enlace
    const linkId = uuidv4()

    // Preparar datos de la inspección para almacenar
    const linkData: InspectionLink = {
      id: linkId,
      guest_name: inspectionData.guest_name,
      guest_email: inspectionData.guest_email,
      property_name: inspectionData.property_name,
      cart_number: inspectionData.cart_number,
      status: 'pending',
      initial_data: JSON.stringify(inspectionData),
      created_at: new Date()
    }

    // Guardar enlace en Supabase
    const { error } = await supabase
    .from('golf_inspections')
    .insert([{
      id: linkId,
      guest_name: inspectionData.guest_name,
      guest_email: inspectionData.guest_email,
      property_id: inspectionData.property_name,
      cart_type: inspectionData.cart_number,
      cart_number: inspectionData.cart_number,
      annotatedDiagramImage: annotatedDiagramImage.value,
      initial_user_id: user.value?.id,
      status: 'pending'
  }])

    if (error) {
      console.error('Error generando enlace:', error)
      throw new Error('No se pudo generar el enlace de inspección')
    }

    // Construir URL completa (ajustar según tu configuración de frontend)
    const baseUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000'
    return `${baseUrl}/complete-inspection/${linkId}`
  }

  static async validateLink(linkId: string): Promise<InspectionLink | null> {
    const { data, error } = await supabase
      .from('inspection_links')
      .select('*')
      .eq('id', linkId)
      .eq('status', 'pending')
      .single()

    if (error) {
      console.error('Error validando enlace:', error)
      return null
    }

    return data
  }
}
