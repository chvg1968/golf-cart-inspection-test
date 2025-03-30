export interface Damage {
  type: string
  location: string
  quantity?: number
}

export interface InspectionFormData {
  guestName: string
  guestEmail: string
  propertyId: string
  cartType: string
  cartNumber: string
  damages?: Damage[]
  observations?: string
  signature?: string
}

export interface PDFGenerationOptions {
  formData: InspectionFormData
  includeObservations?: boolean
  includeSignature?: boolean
}

export interface EmailOptions {
  to: string
  from?: string
  subject?: string
  link?: string
  formData: InspectionFormData
}
