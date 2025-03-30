import { 
  Properties, 
  CartTypeOption 
} from './base-types'

export interface PDFGeneratorRef {
  generatePDF: () => Promise<Blob>
}

export interface GuestInfo {
  name: string;
  email: string;
  phone: string;
  date: string;
  cartNumber: string;
  inspectionDate?: string;
}

export interface NewInspectionState {
  selectedProperty: Properties | null
  selectedCartType: CartTypeOption
  guestInfo: GuestInfo
  guestObservations: string
  signature: string | null
  termsAccepted: boolean
}

// Re-exportar tipos base para evitar conflictos de importación
export type { 
  Properties, 
  CartTypeOption 
}
