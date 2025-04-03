import type { 
  GuestInfo, 
  Properties, 
  CartTypeOption 
} from '@/types/base-types'

import { PROPERTIES, GOLF_CART_TYPES } from '@/constants'
import { fourSeaterImage, sixSeaterImage } from '@/assets/images'

export interface InspectionFormData {
  guestInfo: GuestInfo
  selectedProperty: Properties
  selectedCartType: CartTypeOption
  cartNumber: string
  annotatedDiagramImage?: string
  signature?: string
  termsAccepted: boolean
}

export class InspectionService {
  static getProperties(): Properties[] {
    return PROPERTIES.map(prop => ({
      ...prop,
      diagramPath: prop.diagramType?.includes('6seater') ? sixSeaterImage : fourSeaterImage
    }))
  }

  static getCartTypes(): CartTypeOption[] {
    return GOLF_CART_TYPES
  }

  static getCartTypeForProperty(property: Properties): CartTypeOption {
    const cartTypeMatch = GOLF_CART_TYPES.find(type => 
      (property.diagramType?.includes('6seater') && type.name.includes('6')) ||
      (property.diagramType?.includes('4seater') && type.name.includes('4')) ||
      property.name.toLowerCase().includes(type.name.toLowerCase().replace(' ', ''))
    )

    return cartTypeMatch || GOLF_CART_TYPES[0]
  }

  static validateForm(data: InspectionFormData): boolean {
    return !!(
      data.guestInfo?.name?.trim() &&
      data.guestInfo?.email?.trim() &&
      data.guestInfo?.phone?.trim() &&
      data.selectedProperty &&
      data.selectedCartType &&
      data.annotatedDiagramImage
    )
  }

  static validateForSubmission(data: InspectionFormData): boolean {
    return Boolean(this.validateForm(data) && data.signature && data.termsAccepted)
  }

  static generateFileName(guestName: string): string {
    const date = new Date().toISOString().split('T')[0]
    return `Inspeccion_${guestName}_${date}.pdf`
  }
}