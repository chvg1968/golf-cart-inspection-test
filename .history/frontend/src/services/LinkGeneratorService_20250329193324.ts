// En LinkGeneratorService.ts
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
  annotatedDiagramImage: string
}

export async function generateUniqueLink(inspectionData: InspectionLink): Promise<string> {
  const linkId = uuidv4()

  const { error } = await supabase
    .from('golf_inspections')
    .insert([{
      id: linkId,
      guest_name: inspectionData.guest_name,
      guest_email: inspectionData.guest_email,
      property_id: inspectionData.property_name,
      cart_type: inspectionData.cart_number,
      cart_number: inspectionData.cart_number,
      annotatedDiagramImage: inspectionData.annotatedDiagramImage,
      initial_user_id: user.value?.id,
      status: 'pending'
    }])

  if (error) throw error
  return linkId
}