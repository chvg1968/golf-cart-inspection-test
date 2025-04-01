<template>
  <q-page class="q-pa-md">
    <q-form 
      ref="inspectionForm" 
      @submit.prevent="submitForm"
      class="form-container"
    >
      <div class="row q-col-gutter-md">
        <!-- Logo y Título -->
        <div class="col-12 text-center q-mb-md header-section">
          <img 
            src="../assets/images/logo.png" 
            alt="Company Logo" 
            class="company-logo"
          />
          <h1 class="page-title">Golf Cart Inspection</h1>
        </div>

        <!-- Guest Information Section -->
        <div class="col-12">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6">Guest Information</div>
              <div class="column q-col-gutter-md">
                <div class="col-12">
                  <q-input 
                    v-model="guestInfo.name" 
                    label="Guest Name" 
                    outlined 
                    required
                    style="width: 100%;"
                    input-class="custom-input-text"
                  />
                </div>
                <div class="col-12">
                  <q-input 
                    v-model="guestInfo.email" 
                    label="Guest Email" 
                    type="email" 
                    outlined 
                    required
                    style="width: 100%;"
                    input-class="custom-input-text"
                    :rules="[val => val && val.includes('@') || 'Invalid email']"
                  />
                </div>
                <div class="col-12">
                  <q-input 
                    v-model="guestInfo.phone" 
                    label="Guest Phone" 
                    outlined 
                    required
                    style="width: 100%;"
                    input-class="custom-input-text"
                    :rules="[
                      val => val && val.length >= 10 || 'Please enter a valid phone number'
                    ]"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Property and Cart Type Section -->
        <div class="col-12">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6">Property and Cart Type</div>
              <div class="column q-col-gutter-md">
                <div class="col-12">
                  <q-select 
                    v-model="selectedProperty"
                    :options="propertyOptions"
                    option-label="name"
                    option-value="id"
                    label="Property *"
                    outlined
                    dense
                    :rules="[val => !!val || 'Property is required']"
                    @update:model-value="onPropertySelect"
                  />
                </div>
                <div class="col-12">
                  <q-select 
                    v-model="selectedCartType"
                    :options="cartTypeOptions"
                    option-label="name"
                    option-value="name"
                    label="Cart Type *"
                    outlined
                    dense
                    :rules="[val => !!val || 'Cart Type is required']"
                    @update:model-value="onCartTypeSelect"
                  />
                </div>
                <div class="col-12">
                  <q-input 
                    v-model="cartNumber" 
                    label="Cart Number" 
                    outlined 
                    readonly
                    style="width: 100%;"
                    input-class="custom-input-text"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Sección de diagrama con selección condicional -->
        <div class="row justify-center q-mt-md">
          <div class="col-12 text-center">
            <cart-diagram-annotations
              :cart-type="selectedCartType.name"
              :diagram-path="selectedCartType.diagramPath"
              :diagram-type="selectedProperty.diagramType"
              @drawing-created="handleDrawingCreated"
            />
          </div>
        </div>

        <!-- Guest Observations -->
        <div class="col-12 col-md-6 offset-md-3">
          <q-input 
            v-model="guestObservations" 
            label="Guest Observations" 
            type="textarea" 
            outlined
            :maxlength="200"
            hint="Maximum 200 characters"
            rows="3"
            input-class="custom-input-text"
          />
        </div>

        <!-- Terms and Signature Section -->
        <div class="col-12">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6">Terms and Signature</div>
              <SignatureCanvas 
                v-model:terms-accepted="termsAccepted"
                @signature-change="signature = $event"
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- PDF Generator -->
        <pdf-generator
          ref="pdfGeneratorRef"
          :selected-property="selectedProperty"
          :selected-cart-type="selectedCartType"
          :guest-info="guestInfo"
          :cart-number="cartNumber"
          :annotated-diagram-image="annotatedDiagramImage"
          @pdf-generated="onPDFGenerated"
          @pdf-error="onPDFError"
        />

        <!-- PDF Download Button (Single Button) -->
        <div class="col-12 text-center pdf-buttons" >
          <q-btn 
            label="Download PDF" 
            color="primary" 
            @click="downloadPDF"
            :disable="!canDownloadPDF"
          />
          <q-btn 
            label="Submit Inspection Form" 
            color="primary" 
            type="submit"
            :disable="!canDownloadPDF"
          />
        </div>
      </div>
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { 
  Notify, 
  Dialog, 
  useQuasar 
} from 'quasar'

import PDFGenerator from '@/components/PDFGenerator.vue'
import SignatureCanvas from '@/components/SignatureCanvas.vue'
import CartDiagramAnnotations from '@/components/CartDiagramAnnotations.vue'

import {
  Properties, 
  PropertyOption,
  CartTypeOption, 
  GuestInfo,
  PDFData,
  EMPTY_GUEST_INFO,
  EMPTY_PROPERTY,
  EMPTY_CART_TYPE
} from '@/types/base-types'

import { PROPERTIES, GOLF_CART_TYPES } from '@/constants'
import { fourSeaterImage, sixSeaterImage } from '@/assets/images'

// Configuración de Quasar
const quasar = useQuasar()

// Debug: Imprimir propiedades para verificación
console.log('Propiedades definidas:', PROPERTIES)
console.log('Tipos de carrito definidos:', GOLF_CART_TYPES)

// Convertir PROPERTIES a un formato adecuado para el selector
const propertyOptions = ref<PropertyOption[]>(PROPERTIES.map(prop => ({
  ...prop,
  label: prop.name,
  value: prop.id,
  diagramPath: prop.diagramType?.includes('6seater') ? sixSeaterImage : fourSeaterImage
})))

// Inicializar referencias con valores por defecto
const selectedProperty = ref<Properties>(EMPTY_PROPERTY)
const selectedCartType = ref<CartTypeOption>(EMPTY_CART_TYPE)
const guestInfo = ref<GuestInfo>(EMPTY_GUEST_INFO)

// Usar tipos de carrito de constantes
const cartTypeOptions = ref<CartTypeOption[]>(GOLF_CART_TYPES)

// Referencias adicionales
const cartNumber = ref<string>('')
const guestObservations = ref<string>('')
const termsAccepted = ref<boolean>(false)
const signature = ref<string | null>(null)
const annotatedDiagramImage = ref<string | undefined>(undefined)

// Referencia al componente PDFGenerator
const pdfGeneratorRef = ref<InstanceType<typeof PDFGenerator> | null>(null)

// Método para manejar selección de propiedad
const onPropertySelect = (selectedValue: string | PropertyOption) => {
  console.log('Valor seleccionado:', selectedValue)
  
  // Determinar la propiedad seleccionada
  const selectedProp = typeof selectedValue === 'string'
    ? propertyOptions.value.find(prop => 
        prop.id === selectedValue || 
        prop.name === selectedValue
      )
    : selectedValue

  console.log('Propiedad encontrada:', selectedProp)
  
  if (selectedProp) {
    // Establecer propiedad seleccionada
    selectedProperty.value = {
      id: selectedProp.id,
      name: selectedProp.name,
      type: selectedProp.type,
      required: selectedProp.required,
      cartNumber: selectedProp.cartNumber,
      diagramType: selectedProp.diagramType || ''
    }
    
    console.log('Detalles de propiedad:', selectedProperty.value)
    
    // Determinar tipo de carrito basado en el tipo de diagrama de la propiedad
    const cartTypeMatch = cartTypeOptions.value.find(type => 
      (selectedProp.diagramType?.includes('6seater') && type.name.includes('6')) ||
      (selectedProp.diagramType?.includes('4seater') && type.name.includes('4')) ||
      selectedProp.name.toLowerCase().includes(type.name.toLowerCase().replace(' ', ''))
    )
    
    console.log('Tipo de carrito encontrado:', cartTypeMatch)
    
    if (cartTypeMatch) {
      // Establecer tipo de carrito
      selectedCartType.value = {
        ...cartTypeMatch,
        diagramPath: selectedProp.diagramType?.includes('6seater') ? sixSeaterImage : fourSeaterImage
      }
    } else {
      // Usar primer tipo de carrito si no hay coincidencia
      selectedCartType.value = cartTypeOptions.value[0]
    }
    
    console.log('Tipo de carrito seleccionado:', selectedCartType.value)
    
    // Establecer número de carrito
    cartNumber.value = selectedProp.cartNumber || ''
    
    console.log('Número de carrito:', cartNumber.value)
  } else {
    console.warn('No se encontró la propiedad:', selectedValue)
  }
}

// Watcher para depuración
watch([selectedProperty, selectedCartType], ([prop, cart]) => {
  console.log('Cambio en propiedad o carrito:', { prop, cart })
})

// Método para manejar selección de tipo de carrito
const onCartTypeSelect = (selectedValue: string) => {
  const cartTypeMatch = cartTypeOptions.value.find(type => type.name === selectedValue)
  if (cartTypeMatch) {
    selectedCartType.value = {
      ...cartTypeMatch,
      diagramPath: cartTypeMatch.name.includes('6') ? sixSeaterImage : fourSeaterImage
    }
  }
}

// Establecer valor por defecto al montar el componente
onMounted(() => {
  // Seleccionar la primera propiedad por defecto
  if (propertyOptions.value.length > 0) {
    const defaultProperty = propertyOptions.value.find(prop => prop.id === 'rental_6_passenger_150') || propertyOptions.value[0]
    onPropertySelect(defaultProperty)
  }
})

// Método para manejar dibujo creado
const handleDrawingCreated = (drawingData: { drawing: string, cartType: string }) => {
  annotatedDiagramImage.value = drawingData.drawing
}

// Validación de formulario
const isFormValid = computed(() => {
  // Validar información de invitado
  const isGuestInfoComplete = !!(
    guestInfo.value.name?.trim() &&
    guestInfo.value.email?.trim() &&
    guestInfo.value.email?.includes('@') &&
    guestInfo.value.phone?.trim()
  )

  // Validar propiedad seleccionada
  const isPropertySelected = !!selectedProperty.value?.id

  // Validar diagrama (al menos una marca)
  const hasDiagramAnnotations = !!annotatedDiagramImage.value

  // Retornar true solo si todas las condiciones se cumplen
  return isGuestInfoComplete && 
         isPropertySelected && 
         hasDiagramAnnotations
})

// Método para validar descarga de PDF
const canDownloadPDF = computed(() => {
  return isFormValid.value
})

// Método para descargar PDF
const downloadPDF = async () => {
  try {
    if (!pdfGeneratorRef.value) return

    const pdfData: PDFData = {
      guestInfo: {
        name: guestInfo.value.name || '',
        email: guestInfo.value.email || '',
        phone: guestInfo.value.phone || ''
      },
      selectedProperty: selectedProperty.value,
      selectedCartType: selectedCartType.value,
      cartNumber: cartNumber.value,
      annotatedDiagramImage: annotatedDiagramImage.value || '',
      guestObservations: guestObservations.value,
      signature: signature.value,
      termsAccepted: termsAccepted.value
    }

    const pdfBlob = await pdfGeneratorRef.value.generatePDF(pdfData)
    
    // Generar nombre de archivo personalizado
    const fileName = `golf_cart_${cartNumber.value}_${selectedProperty.value?.name}_${guestInfo.value.name}.pdf`
    
    // Crear un enlace de descarga
    const link = document.createElement('a')
    const pdfUrl = URL.createObjectURL(pdfBlob)
    
    link.href = pdfUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Limpiar el objeto URL
    URL.revokeObjectURL(pdfUrl)
    
    // Notificar éxito
    Notify.create({
      type: 'positive',
      message: 'PDF generado y descargado exitosamente',
      position: 'top'
    })
  } catch (error) {
    console.error('Error generando PDF:', error)
    Notify.create({
      type: 'negative',
      message: 'Error al generar PDF. Por favor, inténtelo de nuevo.',
      position: 'top'
    })
  }
}

// Método para manejar PDF generado
const onPDFGenerated = (pdfBlob: Blob) => {
  console.log('PDF generado', pdfBlob)
}

// Método para manejar error de PDF
const onPDFError = (error: Error) => {
  console.error('Error en PDF:', error)
  Notify.create({
    type: 'negative',
    message: `Error en PDF: ${error.message}`,
    position: 'top'
  })
}

// Método para enviar formulario de inspección
const submitForm = async () => {
  if (!isFormValid.value) {
    Notify.create({
      type: 'negative',
      message: 'Por favor complete todos los campos requeridos',
      position: 'top'
    })
    return
  }

  try {
    // Generar datos de PDF
    const pdfData: PDFData = {
      guestInfo: guestInfo.value,
      selectedProperty: selectedProperty.value,
      selectedCartType: selectedCartType.value,
      cartNumber: cartNumber.value,
      annotatedDiagram: annotatedDiagramImage.value || undefined
    }

    // Generar PDF
    const pdfBlob = await pdfGeneratorRef.value?.generatePDF(pdfData)
    
    if (pdfBlob) {
      // Método de descarga específico para iOS
      const downloadPDF = () => {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(pdfBlob)
        link.download = `Inspeccion_${selectedProperty.value.name}_${new Date().toISOString().split('T')[0]}.pdf`
        
        // Para iOS, crear un evento de clic sintético
        const event = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
        })
        link.dispatchEvent(event)
      }

      // Verificar si es iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream

      if (isIOS) {
        // Para iOS, usar un modal o interacción del usuario
        Dialog.create({
          title: 'Descargar PDF',
          message: '¿Desea descargar el PDF de inspección?',
          cancel: true,
          persistent: true
        }).onOk(() => {
          downloadPDF()
        })
      } else {
        // Para otros navegadores, descarga directa
        downloadPDF()
      }

      // Notificación de éxito
      Notify.create({
        type: 'positive',
        message: 'Inspección generada exitosamente',
        position: 'top'
      })
    }
  } catch (error) {
    console.error('Error al generar PDF:', error)
    Notify.create({
      type: 'negative',
      message: 'Error al generar la inspección',
      position: 'top'
    })
  }
}

// Exponer métodos para pruebas o acceso externo
defineExpose({
  submitForm,
  downloadPDF,
  onPDFGenerated,
  onPDFError
})
</script>

<style scoped>
.page-title, .custom-input-text {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.q-table__title {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.form-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
  text-align: center;
}

.company-logo {
  max-width: 250px;
  margin-bottom: 15px;
}

.q-card {
  width: 100%;
  margin-bottom: 20px;
}

.row {
  width: 100%;
  justify-content: center;
}

.col-12 {
  display: flex;
  justify-content: center;
}

.damage-record-list {
  width: 100%;
  max-width: 800px;
}

.q-table {
  width: 100%;
}

.q-btn {
  margin-top: 20px;
}
</style>