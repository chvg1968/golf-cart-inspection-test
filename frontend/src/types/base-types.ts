export interface Properties {
  id: string
  name: string
  type: string
  required: boolean
  cartNumber?: string
  diagramType?: string
}

export interface PropertyOption extends Properties {
  label: string
  value: string
  diagramPath: string
}

export interface GuestInfo {
  name: string
  email: string
  phone: string
}

export interface CartTypeOption {
  id: string
  name: string
  label: string
  value: string
  diagramPath: string
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

export interface PDFData {
  guestInfo: GuestInfo
  selectedProperty: Properties
  selectedCartType: CartTypeOption
  cartNumber: string
  annotatedDiagram?: string
}

export interface InspectionData {
  id: string
  guestInfo: GuestInfo
  property: Properties
  cartType: CartTypeOption
  cartNumber: string
  observations?: string
  annotatedDiagram?: string
  created_at?: Date
  status?: string
}

export const EMPTY_GUEST_INFO: GuestInfo = {
  name: '',
  email: '',
  phone: ''
}

export const EMPTY_PROPERTY: Properties = {
  id: '',
  name: '',
  type: '',
  required: false
}

export const EMPTY_CART_TYPE: CartTypeOption = {
  id: '',
  name: '',
  label: '',
  value: '',
  diagramPath: ''
}
