import { ref, computed } from 'vue'
import type { GuestInfo, Properties, CartTypeOption } from '@/types/base-types'
import { InspectionService } from '@/services/InspectionService'

export function useFormState() {
  // Estado del formulario
  const guestInfo = ref<GuestInfo>({
    name: '',
    email: '',
    phone: '',
    date: new Date().toISOString().split('T')[0]
  })
  
  const selectedProperty = ref<Properties | null>(null)
  const selectedCartType = ref<CartTypeOption | null>(null)
  const cartNumber = ref('')
  const annotatedDiagramImage = ref<string | null>(null)
  const signature = ref<string | null>(null)
  const termsAccepted = ref(false)

  // Propiedades computadas
  const properties = computed(() => InspectionService.getProperties())
  const cartTypes = computed(() => InspectionService.getCartTypes())
  
  const canDownloadPDF = computed(() => {
    if (!selectedProperty.value || !selectedCartType.value) return false
    
    return InspectionService.validateForm({
      guestInfo: guestInfo.value,
      selectedProperty: selectedProperty.value,
      selectedCartType: selectedCartType.value,
      cartNumber: cartNumber.value,
      annotatedDiagramImage: annotatedDiagramImage.value || undefined,
      signature: signature.value || undefined,
      termsAccepted: termsAccepted.value
    })
  })

  const canSubmitInspection = computed(() => {
    if (!selectedProperty.value || !selectedCartType.value) return false
    
    return InspectionService.validateForSubmission({
      guestInfo: guestInfo.value,
      selectedProperty: selectedProperty.value,
      selectedCartType: selectedCartType.value,
      cartNumber: cartNumber.value,
      annotatedDiagramImage: annotatedDiagramImage.value || undefined,
      signature: signature.value || undefined,
      termsAccepted: termsAccepted.value
    })
  })

  // Métodos
  const onPropertySelect = (property: Properties) => {
    console.log('Propiedad seleccionada:', property)
    selectedProperty.value = property
    selectedCartType.value = InspectionService.getCartTypeForProperty(property)
    cartNumber.value = property.cartNumber || ''
  }

  const onCartTypeSelect = (cartType: CartTypeOption) => {
    console.log('Tipo de carrito seleccionado:', cartType)
    selectedCartType.value = cartType
  }

  const handleDiagramAnnotated = (image: string) => {
    console.log('Diagrama anotado recibido')
    annotatedDiagramImage.value = image
  }

  const handleSignatureChange = (newSignature: string) => {
    console.log('Firma actualizada')
    signature.value = newSignature
  }

  return {
    // Estado
    guestInfo,
    selectedProperty,
    selectedCartType,
    cartNumber,
    annotatedDiagramImage,
    signature,
    termsAccepted,
    
    // Propiedades computadas
    properties,
    cartTypes,
    canDownloadPDF,
    canSubmitInspection,
    
    // Métodos
    onPropertySelect,
    onCartTypeSelect,
    handleDiagramAnnotated,
    handleSignatureChange
  }
}