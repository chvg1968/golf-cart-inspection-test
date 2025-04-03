import { useQuasar } from 'quasar'
import { PDFService } from '@/services/PDFService'
import { InspectionService } from '@/services/InspectionService'
import type { GuestInfo } from '@/types/base-types'
import { useFormState } from '@/composables/useFormState'

export function usePDFGeneration() {
  const $q = useQuasar()
  const { selectedProperty, selectedCartType, cartNumber } = useFormState()

  const generatePDF = async (formElement: HTMLElement, guestInfo: GuestInfo) => {
    let loadingNotification: any = null
    try {
      // Mostrar notificación de carga
      loadingNotification = $q.notify({
        type: 'ongoing',
        message: 'Generando PDF...',
        position: 'top',
        timeout: 0
      })

      // Asegurar que el elemento esté montado y visible
      await new Promise<void>((resolve, reject) => {
        const maxAttempts = 200; // 20 segundos máximo (200 * 100ms)
        let attempts = 0;
        
        const checkElement = () => {
          const rect = formElement.getBoundingClientRect();
          const style = window.getComputedStyle(formElement);
          const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
          
          if (formElement.isConnected && rect.width > 0 && rect.height > 0 && isVisible) {
            // Dar tiempo adicional para que los recursos se carguen completamente
            setTimeout(resolve, 500);
            return;
          }
          
          attempts++;
          if (attempts >= maxAttempts) {
            reject(new Error('El formulario no está listo para generar el PDF. Por favor, asegúrese de que todos los elementos estén cargados y visibles.'));
            return;
          }
          
          setTimeout(checkElement, 100);
        };
        
        checkElement();
      });

      // Generar PDF
      const pdfBlob = await PDFService.generateFromHTML({
        formData: {
          guestName: guestInfo.name,
          guestEmail: guestInfo.email,
          propertyId: selectedProperty.value?.id || '',
          cartType: selectedCartType.value?.name || '',
          cartNumber: cartNumber.value
        },
        includeObservations: true,
        includeSignature: true
      })

      // Cerrar notificación de carga
      if (loadingNotification) {
        loadingNotification()
      }
      
      // Crear y descargar archivo
      const pdfUrl = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = InspectionService.generateFileName(guestInfo.name)
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

      return true
    } catch (error) {
      console.error('Error en generación de PDF:', error)
      
      // Cerrar notificación de carga si existe
      if (loadingNotification) {
        loadingNotification()
      }
      
      // Mostrar notificación de error específica
      let errorMessage = 'Error al generar el PDF'
      if (error instanceof Error) {
        if (error.message.includes('Element is not attached')) {
          errorMessage = 'Por favor, espere a que el formulario esté completamente cargado antes de generar el PDF'
        } else if (error.message.includes('Invalid coordinates')) {
          errorMessage = 'Error al calcular las dimensiones del PDF'
        } else if (error.message.includes('No se pudo encontrar el formulario')) {
          errorMessage = 'No se pudo encontrar el formulario para generar el PDF'
        } else {
          errorMessage = error.message
        }
      }
      
      $q.notify({
        type: 'negative',
        message: errorMessage,
        position: 'top'
      })

      return false
    }
  }

  return {
    generatePDF
  }
}