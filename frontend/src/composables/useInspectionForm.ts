import { useFormState } from './useFormState'
import { usePDFGeneration } from './usePDFGeneration'
import { useQuasar } from 'quasar'

export function useInspectionForm() {
  const $q = useQuasar()
  
  const {
    guestInfo,
    selectedProperty,
    selectedCartType,
    cartNumber,
    annotatedDiagramImage,
    signature,
    termsAccepted,
    properties,
    cartTypes,
    canDownloadPDF,
    canSubmitInspection,
    onPropertySelect,
    onCartTypeSelect,
    handleDiagramAnnotated,
    handleSignatureChange
  } = useFormState()

  const { generatePDF } = usePDFGeneration()

  const submitForm = async () => {
    try {
      if (!canSubmitInspection.value) {
        $q.notify({
          type: 'warning',
          message: 'Por favor complete todos los campos requeridos',
          position: 'top'
        })
        return
      }

      const form = document.querySelector('.form-container')
      if (!form || !(form instanceof HTMLElement)) {
        throw new Error('No se pudo encontrar el formulario')
      }

      await generatePDF(form, guestInfo.value)
      
      // Aquí iría la lógica para enviar los datos al servidor
      
    } catch (error) {
      console.error('Error al enviar formulario:', error)
      $q.notify({
        type: 'negative',
        message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        position: 'top'
      })
    }
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
    handleSignatureChange,
    generatePDF,
    submitForm
  }
}