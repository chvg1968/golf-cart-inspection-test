import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import type { GuestInfo, Properties, CartTypeOption } from '@/types/base-types'
import { InspectionService, type InspectionFormData } from '@/services/InspectionService'
import { PDFService } from '@/services/PDFService'

export function useInspectionForm() {
  const $q = useQuasar()
  
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

  const generatePDF = async () => {
    let loadingNotification: any = null
    try {
      // Validar formulario
      if (!canDownloadPDF.value) {
        $q.notify({
          type: 'warning',
          message: 'Por favor complete todos los campos requeridos antes de generar el PDF',
          position: 'top'
        })
        return
      }

      // Mostrar notificación de carga
      loadingNotification = $q.notify({
        type: 'ongoing',
        message: 'Generando PDF...',
        position: 'top',
        timeout: 0
      })

      // Obtener el formulario
      const form = document.querySelector('.form-container')
      if (!form || !(form instanceof HTMLElement)) {
        throw new Error('No se pudo encontrar el formulario')
      }

      // Generar PDF
      const pdfBlob = await PDFService.generateFromHTML(form, {
        scale: 2,
        quality: 1,
        margin: 10
      })

      // Cerrar notificación de carga
      if (loadingNotification) {
        loadingNotification()
      }
      
      // Crear y descargar archivo
      const pdfUrl = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = InspectionService.generateFileName(guestInfo.value.name)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(pdfUrl)

      // Mostrar notificación de éxito
      $q.notify({
        type: 'positive',
        message: 'PDF generado y descargado exitosamente',
        position: 'top'
      })

    } catch (error) {
      console.error('Error en generación de PDF:', error)
      
      // Cerrar notificación de carga si existe
      if (loadingNotification) {
        loadingNotification()
      }
      
      // Mostrar notificación de error específica
      let errorMessage = 'Error al generar el PDF'
      if (error instanceof Error) {
        if (error.message.includes('Invalid coordinates')) {
          errorMessage = 'Error al calcular las dimensiones del PDF'
        } else if (error.message.includes('No se pudo encontrar el formulario')) {
          errorMessage = 'No se pudo encontrar el formulario para generar el PDF'
        }
      }
      
      $q.notify({
        type: 'negative',
        message: errorMessage,
        position: 'top'
      })
    }
  }

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

      await generatePDF()
      
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