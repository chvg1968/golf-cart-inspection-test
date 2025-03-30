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
                  />
                </div>
                <div class="col-12">
                  <q-input 
                    v-model="guestInfo.date" 
                    label="Date" 
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
                    label="Property *" 
                    outlined 
                    dense 
                    required
                    input-class="custom-input-text"
                  />
                </div>
                <div v-if="selectedProperty" class="col-12 q-mt-sm">
                  <div class="text-subtitle2">Property Details</div>
                  <div class="text-body2">
                    <strong>Address:</strong> {{ selectedProperty.address }}<br>
                    <strong>Contact:</strong> {{ selectedProperty.contact || 'N/A' }}
                  </div>
                </div>
                <div class="col-12">
                  <q-select 
                    v-model="selectedCartType" 
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
                    required
                    style="width: 100%;"
                    input-class="custom-input-text"
                  />
                </div>
                <!-- Agregar imagen del carrito -->
                <div v-if="selectedProperty" class="col-12 text-center q-mt-md">
                  <img 
                    :src="getCartImage(selectedProperty.diagramType)" 
                    :alt="`${selectedProperty.name} Cart`" 
                    class="cart-image"
                    style="max-width: 300px; max-height: 200px;"
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

        <!-- Firma del invitado -->
        <div class="col-12">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6">Guest Signature</div>
              <SignatureCanvas @signature-created="signature = $event" />
            </q-card-section>
          </q-card>
        </div>

        <!-- PDF Generator -->
        <div class="col-12 text-center pdf-buttons" >
          <q-btn 
            label="Generate PDF" 
            color="primary" 
            type="submit"
            :disable="!canDownloadPDF"
          />
        </div>
      </div>
    </q-form>
    <PDFGenerator ref="pdfGeneratorRef" @pdf-generated="onPDFGenerated" @pdf-error="onPDFError" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, defineEmits } from 'vue'
import { useQuasar } from 'quasar'
import SignatureCanvas from '@/components/SignatureCanvas.vue'
import CartDiagramAnnotations from '@/components/CartDiagramAnnotations.vue'
import PDFGenerator from '@/components/PDFGenerator.vue'

import { PROPERTIES, GOLF_CART_TYPES } from '@/constants'
import { 
  Properties, 
  CartTypeOption, 
  FormData, 
  GuestInfo, 
  DiagramMarking 
} from '@/types/base'

// Configuración de Quasar
const quasar = useQuasar()

// Convertir PROPERTIES a un formato adecuado para el selector
const propertyOptions = ref<Properties[]>(PROPERTIES.map(prop => ({
  ...prop,
  label: prop.name,
  value: prop.id,
  address: prop.address || '', // Añadir dirección por defecto
  contact: prop.contact || ''
})))

const selectedProperty = ref<Properties | null>(null)

// Convertir GOLF_CART_TYPES a un formato adecuado para el selector
const cartTypeOptions = ref<CartTypeOption[]>(GOLF_CART_TYPES.map(type => ({
  name: type.name,
  value: type.name,
  diagramPath: type.name.includes('4') 
    ? '../assets/images/4seater.jpg' 
    : '../assets/images/6seater.png'
})))

const guestInfo = reactive<GuestInfo>({
  name: '',
  email: '',
  phone: '',
  date: ''
})

const selectedCartType = ref<CartTypeOption | null>(null)
const cartNumber = ref<string>('')
const guestObservations = ref<string>('')
const signature = ref<string>('')
const annotatedDiagramImage = ref<string | null>(null)

// Marcas de diagrama
const diagramMarkings = ref<DiagramMarking>({})

// Usar funciones para evitar advertencias de lint
const saveDiagramMarking = (diagramPath: string, marking: string): string => {
  diagramMarkings.value[diagramPath] = marking
  console.log('Marcas guardadas:', {
    diagramPath,
    hasMarking: !!marking
  })
  // Usar la función en el proceso de validación
  return validateDiagramMarking(diagramPath)
}

const getPreviousDiagramMarking = (diagramPath: string): string | null => {
  const previousMarking = diagramMarkings.value[diagramPath] || null
  console.log('Marcas previas:', { diagramPath, previousMarking })
  // Usar la función en el proceso de validación
  return previousMarking
}

// Función de validación de marcas de diagrama
const validateDiagramMarking = (diagramPath: string): string => {
  const marking = diagramMarkings.value[diagramPath]
  return marking ? 'Marca válida' : 'Sin marca'
}

// Observador para actualizar Cart Number, Cart Type y Diagrama cuando se selecciona una propiedad
watch(selectedProperty, (newProperty) => {
  if (newProperty) {
    // Restablecer marcas al cambiar de propiedad
    const diagramPath = newProperty.diagramType || ''
    const previousMarking = getPreviousDiagramMarking(diagramPath)
    
    // Actualizar Cart Type basado en el diagrama
    const matchingCartType = cartTypeOptions.value.find(type => 
      diagramPath?.toLowerCase().includes(type.name.toLowerCase().replace(' seaters', ''))
    )
    
    if (matchingCartType) {
      selectedCartType.value = matchingCartType
    }
    
    // Actualizar Cart Number desde la propiedad
    cartNumber.value = newProperty.cartNumber || ''
    
    // Restablecer diagrama si hay una marca previa
    if (previousMarking) {
      // Lógica para restaurar marcas previas si es necesario
    }
  } else {
    // Resetear valores si no hay propiedad seleccionada
    selectedCartType.value = null
    cartNumber.value = ''
  }
})

const onCartTypeSelect = (value: CartTypeOption | null): void => {
  if (value) {
    // Lógica adicional si es necesario
    console.log('Cart Type seleccionado:', value)
  }
}

const emit = defineEmits<{
  (e: 'drawing-created', data: { drawing: string, cartType: string }): void
}>()

const handleDrawingCreated = (drawingData: { drawing: string, cartType: string }): void => {
  // Validar que drawingData y cartType existan
  if (!drawingData || !drawingData.cartType) {
    console.error('Datos de dibujo inválidos:', drawingData)
    quasar.notify({
      type: 'negative',
      message: 'Error al procesar el dibujo: datos incompletos'
    })
    return
  }

  annotatedDiagramImage.value = drawingData.drawing
  
  // Validar que el tipo de carrito coincida
  const matchingCartType = cartTypeOptions.value.find(
    type => type.value.toLowerCase() === drawingData.cartType.toLowerCase()
  )
  
  if (matchingCartType) {
    selectedCartType.value = matchingCartType
    // Emitir solo el valor del tipo de carrito como string
    emit('drawing-created', { 
      drawing: drawingData.drawing, 
      cartType: matchingCartType.value 
    })
  } else {
    console.warn('No se encontró un tipo de carrito coincidente:', drawingData.cartType)
    quasar.notify({
      type: 'warning',
      message: `Tipo de carrito no reconocido: ${drawingData.cartType}`
    })
  }
}

// Asegurar que cart-type siempre tenga un valor de cadena
const cartTypeForDiagram = computed<string>(() => {
  return selectedCartType.value?.value || ''
})

const validateForm = (): boolean => {
  // Validaciones de campos requeridos
  const isGuestInfoComplete = !!(
    guestInfo.name && 
    guestInfo.email && 
    guestInfo.phone && 
    guestInfo.date
  )
  
  const isPropertySelected = !!selectedProperty.value
  const isCartTypeSelected = !!selectedCartType.value
  const isCartNumberFilled = !!cartNumber.value
  const isDiagramAnnotated = !!annotatedDiagramImage.value

  return isGuestInfoComplete && 
         isPropertySelected && 
         isCartTypeSelected && 
         isCartNumberFilled && 
         isDiagramAnnotated
}

// Computed para habilitar/deshabilitar botón de PDF
const canDownloadPDF = computed<boolean>(() => {
  const isValid = validateForm()
  console.log('Puede descargar PDF:', isValid)
  return isValid
})

const generatePDF = (event: Event): void => {
  event.preventDefault()
  
  if (!validateForm()) {
    quasar.notify({
      type: 'warning',
      message: 'Por favor complete todos los campos requeridos'
    })
    return
  }

  const formData: FormData = {
    guestName: guestInfo.name,
    guestEmail: guestInfo.email,
    guestPhone: guestInfo.phone,
    propertyId: selectedProperty.value?.id || '',
    cartType: selectedCartType.value?.value || '',
    cartNumber: cartNumber.value,
    diagramImage: annotatedDiagramImage.value || undefined,
    observations: guestObservations.value || undefined,
    signature: signature.value || undefined
  }

  // Llamar al generador de PDF
  const pdfGeneratorRef = ref<InstanceType<typeof PDFGenerator> | null>(null)
  pdfGeneratorRef.value?.generatePDF(formData)
}

const onPDFGenerated = (): void => {
  quasar.notify({
    type: 'positive',
    message: 'PDF generado exitosamente'
  })
}

const onPDFError = (error: Error): void => {
  quasar.notify({
    type: 'negative',
    message: `Error generando PDF: ${error.message}`
  })
}

const getCartImage = (diagramType: string | undefined): string => {
  if (!diagramType) return ''

  const cartTypeMatch = cartTypeOptions.value.find(type => 
    diagramType?.toLowerCase().includes(type.name.toLowerCase().replace(' seaters', ''))
  )

  if (cartTypeMatch) {
    return cartTypeMatch.diagramPath || '/default-diagram.svg'
  }

  return '/default-diagram.svg'
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

.cart-image {
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>
