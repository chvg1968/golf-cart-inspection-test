// Type Exports for Golf Cart Inspection
export * from './base-types'



// Tipos adicionales si son necesarios
import { User } from '@supabase/supabase-js'

export interface UserExtended extends User {
  email: string
}

export type { FormData } from './base-types'
