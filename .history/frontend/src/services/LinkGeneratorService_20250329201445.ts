// En LinkGeneratorService.ts
import { createClient } from '@supabase/supabase-js'
import { useSupabaseUser } from '@/composables/useSupabaseUser'
import { User } from '@supabase/supabase-js'
import { ref, Ref, unref } from 'vue'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

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
  // Obtener usuario actualizado usando composable
  const { user } = useSupabaseUser()

  if (!user.value) {
    throw new Error('User must be authenticated to generate inspection link')
  }

  const { data, error } = await supabase
    .from('golf_inspections')
    .insert([{
      ...inspectionData,
      created_by: user.value.id
    }])
    .select()

  if (error) {
    throw new Error(`Error generando enlace de inspección: ${error.message}`)
  }

  return data?.[0]?.id || ''
}