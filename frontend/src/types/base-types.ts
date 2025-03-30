export interface Properties {
  id: string
  name: string
  type: string
  required: boolean
  cartNumber?: string
  diagramType?: string
  value?: string
  label?: string
}

export interface GuestInfo {
  name?: string
  email?: string
  phone?: string
  date?: string
  inspectionDate?: string
}

export interface CartTypeOption {
  id: string
  name: string
  label: string
  diagramPath: string
  value: string
}

export interface Damage {
  id?: string
  description: string
  location: string
  severity: 'low' | 'medium' | 'high'
  part?: string
  type?: string
  x?: number
  y?: number
  quantity?: number
  category?: CartPartCategoryType
  value?: string
  label?: string
}

export interface EmailData {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    content: string
    filename: string
    type: string
  }>
}

export interface FormData {
  [key: string]: any
}

export type CartPartCategoryType = 'exterior' | 'interior' | 'mechanical' | 'electrical'

export interface CartPart {
  id: string
  name: string
  category: CartPartCategoryType
}

export enum CartPartCategory {
  EXTERIOR = 'exterior',
  INTERIOR = 'interior',
  MECHANICAL = 'mechanical',
  ELECTRICAL = 'electrical'
}

export interface DamageType {
  id: string
  name: string
  description: string
  value?: string
  label?: string
  severity?: 'low' | 'medium' | 'high'
}

export interface InspectionData {
  id: string
  guest_name: string
  guest_email: string
  property_name: string
  cart_number: string
  annotatedDiagramImage: string
  initial_data: string
  created_at: Date
  status: string
  initial_user_id?: string
  date: string
}
