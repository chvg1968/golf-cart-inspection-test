<template>
  <q-page class="q-pa-md">
    <q-form 
      ref="inspectionForm" 
      @submit.prevent="generatePDF"
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
                <div class="col-12">
                  <q-input 
                    v-model="guestInfo.date" 
                    label="Inspection Date" 
                    type="date" 
                    outlined 
                    required
                    style="width: 100%;"
                    input-class="custom-input-text"
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
                    required
                    input-class="custom-input-text"
                  />
                </div>
                <div class="col-12">
                  <q-select 
                    v-model="selectedCartType.value" 
                    :options="cartTypeOptions" 
                    label="Cart Type" 
                    outlined 
                    input-class="custom-input-text"
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
            <CartDiagramAnnotations 
              :cart-type="cartTypeForDiagram"
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
        <PDFGenerator 
          ref="pdfGeneratorRef" 
          :form-container="formContainerRef" 
          @pdf-generated="onPDFGenerated"
          @pdf-error="onPDFError"
        />

        <!-- PDF Download Button (Single Button) -->
        <div class="col-12 text-center pdf-buttons" >
          <q-btn 
            label="Download PDF" 
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
import { ref, reactive, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import SignatureCanvas from '@/components/SignatureCanvas.vue'
import CartDiagramAnnotations from '@/components/CartDiagramAnnotations.vue'
import PDFGenerator from '@/components/PDFGenerator.vue'

import { PROPERTIES, GOLF_CART_TYPES } from '@/constants'
import { Properties } from '@/types/base-types'

// Configuración de Quasar
const quasar = useQuasar()

// Convertir PROPERTIES a un formato adecuado para el selector
const propertyOptions = ref<Properties[]>(PROPERTIES.map(prop => ({
  ...prop,
  label: prop.name,
  value: prop.id
})))

const selectedProperty = ref<Properties | null>(null)

// Convertir PROPERTIES a un formato adecuado para el selector
const cartTypeOptions = ref<any[]>(GOLF_CART_TYPES)

const guestInfo = reactive({
  name: '',
  email: '',
  phone: '',
  date: ''
})

// Definir una interfaz para el tipo de carrito con valores por defecto
interface CartType {
  id: string | number;
  name: string;
  label: string;
  diagramPath: string;
  value: string;
}

// Definir un valor por defecto para el tipo de carrito
const defaultCartType: CartType = {
  id: 'default',
  name: 'Default Cart',
  label: 'Default Cart',
  diagramPath: '/default-diagram.svg',
  value: 'default'
}

// Usar la interfaz definida para el ref con un valor inicial
const selectedCartType = ref<CartType>(defaultCartType)

const guestObservations = ref<string>('')
const signature = ref<string | null>(null)
const termsAccepted = ref<boolean>(false)

const cartNumber = ref<string>('')

// Declaración de referencias
const annotatedDiagramImage = ref<string | null>(null)
const diagramMarkings = ref<Record<string, string>>({})

// Método para guardar marcas de diagrama
const saveDiagramMarking = (diagramPath: string, marking: string) => {
  diagramMarkings.value[diagramPath] = marking
  console.log('Marcas guardadas:', {
    diagramPath,
    hasMarking: !!marking
  })
}

// Método para obtener marcas de diagrama previas
const getPreviousDiagramMarking = (diagramPath: string) => {
  return diagramMarkings.value[diagramPath] || null
}

// Observador para actualizar Cart Number, Cart Type y Diagrama cuando se selecciona una propiedad
watch(selectedProperty, (newProperty) => {
  if (newProperty) {
    // Restablecer marcas al cambiar de propiedad
    diagramMarkings.value = {}
    annotatedDiagramImage.value = null
    
    const selectedProp = propertyOptions.value.find(prop => prop.id === newProperty.id)
    if (selectedProp) {
      // Actualizar Cart Number
      cartNumber.value = selectedProp.cartNumber ?? ''
      
      // Determinar el tipo de carrito basado en la propiedad diagramType
      const cartTypeMatch = cartTypeOptions.value.find(type => 
        selectedProp.diagramType?.toLowerCase().includes(type.label.toLowerCase().replace(' seaters', ''))
      )
      
      // Usar el tipo de carrito encontrado o el valor por defecto
      if (cartTypeMatch) {
        selectedCartType.value = { 
          id: cartTypeMatch.id || 'default', 
          name: cartTypeMatch.name || 'Default Cart', 
          label: cartTypeMatch.label, 
          diagramPath: cartTypeMatch.diagramPath || '/default-diagram.svg', 
          value: cartTypeMatch.value 
        }

        // Obtener marcas previas para este diagrama
        const previousMarking = getPreviousDiagramMarking(cartTypeMatch.diagramPath)
        annotatedDiagramImage.value = previousMarking
      } else {
        selectedCartType.value = defaultCartType
      }
      
      // Depuración: Imprimir información para verificar la selección
      console.log('Selected Property:', selectedProp)
      console.log('Cart Number:', cartNumber.value)
      console.log('Cart Type Match:', cartTypeMatch)
      console.log('Selected Cart Type:', selectedCartType.value)
    }
  } else {
    // Resetear valores si no hay propiedad seleccionada
    cartNumber.value = ''
    selectedCartType.value = defaultCartType
    diagramMarkings.value = {}
    annotatedDiagramImage.value = null
  }
}, { immediate: true })

// Método para manejar la selección de Cart Type
const onCartTypeSelect = (value: any | null) => {
  if (value) {
    const diagramPath = value.diagramPath || '/default-diagram.svg'
    
    selectedCartType.value = {
      id: value.id || 'default',
      name: value.name || 'Default Cart',
      label: value.label,
      diagramPath: diagramPath,
      value: value.value
    }

    // Obtener marcas previas para este diagrama
    const previousMarking = getPreviousDiagramMarking(diagramPath)
    annotatedDiagramImage.value = previousMarking
  } else {
    selectedCartType.value = defaultCartType
  }
}

// Método para manejar marcas creadas
function handleDrawingCreated(drawingData: { drawing: string, cartType: string }) {
  const { drawing, cartType } = drawingData
  const diagramPath = selectedCartType.value?.diagramPath || '/default-diagram.svg'
  
  // Guardar marcas para el diagrama actual
  saveDiagramMarking(diagramPath, drawing)
  
  // Actualizar imagen anotada
  annotatedDiagramImage.value = drawing
}

// Asegurar que cart-type siempre tenga un valor de cadena
const cartTypeForDiagram = computed(() => {
  return selectedCartType.value?.value || ''
})

// Validación de formulario
function validateForm(): boolean {
  const { name, email, phone, date } = guestInfo
  
  // Validaciones detalladas con logs de depuración
  const hasValidGuestInfo = !!(name && email && phone && date)
  const hasValidProperty = selectedProperty.value !== null
  const hasValidCartType = selectedCartType.value !== null
  const hasValidDiagram = !!(annotatedDiagramImage.value || diagramMarkings.value[selectedCartType.value?.diagramPath || ''])

  console.log('Validación de formulario:', {
    guestInfo: hasValidGuestInfo,
    property: hasValidProperty,
    cartType: hasValidCartType,
    diagram: hasValidDiagram
  })

  return !!(
    hasValidGuestInfo && 
    hasValidProperty && 
    hasValidCartType && 
    hasValidDiagram
  )
}

// Computed para habilitar/deshabilitar botón de PDF
const canDownloadPDF = computed(() => {
  const isValid = validateForm()
  console.log('Puede descargar PDF:', isValid)
  return isValid
})

// Referencia al contenedor del formulario
const formContainerRef = ref<HTMLElement>(document.createElement('div'))

// Referencia al componente PDFGenerator
const pdfGeneratorRef = ref(null)

// Método para generar PDF
function generatePDF(event: Event) {
  event.preventDefault()

  // Validar el formulario
  const formValid = validateForm()
  if (!formValid) {
    quasar.notify({
      type: 'negative',
      message: 'Por favor, complete todos los campos requeridos',
      position: 'top'
    })
    return
  }

  // Preparar datos para PDF
  const pdfData = {
    guestInfo,
    selectedProperty: {
      ...selectedProperty.value,
      name: selectedProperty.value?.name || 'Unknown Property'
    },
    selectedCartType: selectedCartType.value,
    cartNumber: cartNumber.value,
    guestObservations: guestObservations.value,
    signature: signature.value,
    // Usar última marca del tipo de carrito actual
    cartDiagramDrawing: diagramMarkings.value[selectedCartType.value?.diagramPath || ''],
    annotatedDiagramImage: annotatedDiagramImage.value
  }

  // Llamar al método de generación de PDF
  if (pdfGeneratorRef.value) {
    const pdfGenerator = pdfGeneratorRef.value as { downloadPDF: (data: any) => void }
    if (typeof pdfGenerator.downloadPDF === 'function') {
      pdfGenerator.downloadPDF(pdfData)
    } else {
      console.error('downloadPDF no es una función', pdfGenerator)
      quasar.notify({
        type: 'negative',
        message: 'Error al generar PDF',
        position: 'top'
      })
    }
  }
}

// Método cuando se genera el PDF
function onPDFGenerated() {
  quasar.notify({
    type: 'positive',
    message: 'PDF generado exitosamente',
    position: 'top'
  })
}

// Método cuando hay un error en la generación del PDF
function onPDFError(error: Error) {
  quasar.notify({
    type: 'negative',
    message: 'Error al generar PDF: ' + error.message,
    position: 'top'
  })
}
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