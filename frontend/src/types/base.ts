// Tipos base para la aplicación de inspección de carrito de golf

export interface Point {
  x: number
  y: number
}

export interface GuestInfo {
  name: string
  email: string
  phone: string
  date: string
}

export interface CartPart {
  id: string
  name: string
}

export interface CartTypeOption {
  name: string
  value: string
  diagramPath?: string
}

export interface DamageType {
  id: string
  name: string
  description?: string
}

export interface Damage {
  type: string
  description: string
  location: string
}

export interface DiagramMarking {
  [key: string]: string
}

export interface PDFGenerationData {
  guestInfo: GuestInfo
  selectedProperty: Properties | null
  selectedCartType: CartTypeOption | null
  cartNumber: string
  annotatedDiagramImage: string | null
  guestObservations: string
  signature: string
}

export interface Properties {
  id: string
  name: string
  address: string
  contact: string
  cartNumber?: string
  diagramType?: string
  label?: string
  value?: string
  type?: string
  required?: boolean
}

export interface FormData {
  guestName: string
  guestEmail: string
  guestPhone: string
  propertyId: string
  cartType: string
  cartNumber: string
  diagramImage?: string
  observations?: string
  signature?: string
}

export interface InspectionLink {
  token: string
  initial_form_data: FormData
  completed_form_data?: Partial<FormData>
  status: 'pending' | 'completed'
  created_at: string
  completed_at?: string
}
