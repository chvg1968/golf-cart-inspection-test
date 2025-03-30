<template>
  <div class="q-pa-md">
    <!-- Logo y Título -->
    <div class="col-12 text-center q-mb-md header-section">
      <img 
        src="../assets/images/logo.png" 
        alt="Company Logo" 
        class="company-logo"
      />
      <h1 class="page-title">Golf Cart Inspection</h1>
    </div>

    <q-form ref="formContainerRef" @submit.prevent="submitInspectionForm">
      <!-- Guest Information Section -->
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">Guest Information</div>
            <div class="column q-col-gutter-md">
              <div class="col-12">
                <q-input 
                  v-model="guestInfo.name"
                  label="Guest Name *" 
                  outlined 
                  required
                  input-class="custom-input-text"
                />
              </div>
              <div class="col-12">
                <q-input 
                  v-model="guestInfo.email"
                  type="email"
                  label="Guest Email *" 
                  outlined 
                  required
                  input-class="custom-input-text"
                />
              </div>
              <div class="col-12">
                <q-input 
                  v-model="guestInfo.phone"
                  type="tel"
                  label="Phone Number *" 
                  outlined 
                  required
                  input-class="custom-input-text"
                  :rules="[
                    val => val && val.length >= 10 || 'Please enter a valid phone number'
                  ]"
                />
              </div>
              <div class="col-12">
                <q-input 
                  v-model="guestInfo.inspectionDate" 
                  type="date" 
                  label="Inspection Date" 
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
                    option-label="label"
                    option-value="id"
                    label="Property *"
                    outlined
                    required
                    input-class="custom-input-text"
                  />
                </div>
                <div class="col-12">
                  <q-select 
                    v-model="selectedCartType" 
                    :options="cartTypeOptions" 
                    label="Cart Type" 
                    outlined 
                    input-class="custom-input-text"
                    @update:model-value="onCartTypeSelect($event)"
                  />
                </div>
                <div class="col-12">
                  <q-input 
                    v-model="cartNumber"
                    label="Cart Number" 
                    outlined 
                    input-class="custom-input-text"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Diagram Annotation Section -->
        <div class="row justify-center q-mt-md">
          <div class="col-12 text-center">
            <CartDiagramAnnotations 
              :cart-type="cartTypeForDiagram"
              @drawing-created="annotatedDiagramImage = $event"
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
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- PDF Generation Section -->
        <div class="row justify-center q-mt-md">
          <PDFGenerator 
            ref="pdfGeneratorRef" 
            :form-container="formContainerRef" 
            :guest-information="guestInfo"
            :selected-property="selectedProperty"
            :annotated-diagram-image="annotatedDiagramImage"
          />

          <!-- PDF Download Button (Single Button) -->
          <div class="col-12 text-center q-mt-md">
            <q-btn 
              label="Download PDF" 
              color="primary" 
              @click="handlePDFGeneration"
              :disable="!canDownloadPDF"
            />
            <q-btn 
              label="Submit Inspection" 
              color="secondary" 
              class="q-ml-md"
              @click="submitInspectionForm"
              :disable="!isFormValid"
            />
          </div>
        </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'

import SignatureCanvas from '@/components/SignatureCanvas.vue'
import PDFGenerator from '@/components/PDFGenerator.vue'
import CartDiagramAnnotations from '@/components/CartDiagramAnnotations.vue'

import { sendInspectionLink } from '@/api/sendInvitationEmail'
import { PROPERTIES, GOLF_CART_TYPES } from '@/constants'

import { 
  Properties, 
  CartTypeOption, 
  GuestInfo
} from '@/types/new-inspection-types'

// Inicializar Quasar
const $q = useQuasar()

// Estado de información de invitado
const guestInfo = ref<GuestInfo>({
  name: '',
  email: '',
  phone: '',
  date: new Date().toISOString().split('T')[0],
  cartNumber: '',
  inspectionDate: new Date().toISOString().split('T')[0]
})

// Propiedades y tipos de carrito
const propertyOptions = PROPERTIES.map(prop => ({
  ...prop,
  label: prop.name,
  value: prop.id.toString(),
}))

// Definición de tipos de carrito con rutas de imagen resueltas
const cartTypeOptions = GOLF_CART_TYPES.map(cartType => ({
  ...cartType,
  diagramPath: cartType.label.includes('6') ? '../assets/images/6seater.jpg' : '../assets/images/4seater.jpg'
}))

// Definir un valor por defecto para el tipo de carrito
const defaultCartType: CartTypeOption = {
  id: 'default',
  name: 'Default Cart',
  label: '4 Seater',
  value: '4',
  diagramPath: '../assets/images/4seater.jpg',
}

const selectedProperty = ref<Properties | null>(null)
const selectedCartType = ref<CartTypeOption | null>(null)
const cartNumber = ref('')

// Estado de anotaciones y observaciones
const annotatedDiagramImage = ref<string | null>(null)
const guestObservations = ref('')

// Estado de términos y firma
const termsAccepted = ref(false)

// Referencias para PDF y formulario
const pdfGeneratorRef = ref<InstanceType<typeof PDFGenerator> | null>(null)
const formContainerRef = ref<HTMLElement>(document.createElement('div'))

// Computed para validar campos de Guest Information
const isGuestInfoComplete = computed(() => {
  return !!(
    guestInfo.value.name.trim() && 
    guestInfo.value.email.trim() && 
    guestInfo.value.phone.trim() && 
    guestInfo.value.inspectionDate
  )
})

// Computed para validar selección de propiedad
const isPropertySelected = computed(() => {
  return !!selectedProperty.value
})

// Computed para habilitar descarga de PDF
const canDownloadPDF = computed(() => {
  return isGuestInfoComplete.value && isPropertySelected.value
})

// Computed para validar formulario completo
const isFormValid = computed(() => {
  return (
    isGuestInfoComplete.value && 
    isPropertySelected.value && 
    termsAccepted.value
  )
})

// Utilidad centralizada para resolución de imágenes
const ImageResolver = {
  resolveImagePath(cartType: CartTypeOption): string {
    return cartType.label.includes('6') ? '../assets/images/6seater.jpg' : '../assets/images/4seater.jpg'
  }
}

// Asegurar que cart-type siempre tenga un valor de cadena
const cartTypeForDiagram = computed(() => {
  return selectedCartType.value?.value || ''
})

// Wrapper for generatePDF to handle null case
const handlePDFGeneration = () => {
  if (pdfGeneratorRef.value) {
    pdfGeneratorRef.value.generatePDF()
  }
}

async function submitInspectionForm() {
  try {
    // Validaciones
    if (!isFormValid.value) {
      $q.notify({
        type: 'negative',
        message: 'Please complete all required fields',
        position: 'top'
      })
      return
    }

    // Enviar enlace de inspección
    const processedGuestInfo: GuestInfo = {
      ...guestInfo.value,
      date: guestInfo.value.inspectionDate || new Date().toISOString().split('T')[0]
    }

    await sendInspectionLink(
      processedGuestInfo, 
      selectedProperty.value?.id || '', 
      selectedCartType.value?.name || '',
      undefined // Opcional: supabaseUser.value?.id
    )

    $q.notify({
      type: 'positive',
      message: 'Inspection link sent successfully',
      position: 'top'
    })

  } catch (error: unknown) {
    console.error('Error submitting inspection:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Failed to submit inspection',
      position: 'top'
    })
  }
}

// Observador para actualizar Cart Number, Cart Type y Diagrama cuando se selecciona una propiedad
watch(selectedProperty, (newProperty) => {
  if (newProperty) {
    const selectedProp = propertyOptions.find(prop => prop.id === newProperty.id)
    if (selectedProp) {
      // Actualizar Cart Number
      guestInfo.value.cartNumber = selectedProp.cartNumber ?? ''
      cartNumber.value = selectedProp.cartNumber ?? ''
      
      // Determinar el tipo de carrito basado en la propiedad diagramType
      const cartTypeMatch = cartTypeOptions.find(type => 
        selectedProp.diagramType?.toLowerCase().includes(type.label.toLowerCase().replace(' seaters', ''))
      )
      
      // Usar el tipo de carrito encontrado o el valor por defecto
      if (cartTypeMatch) {
        selectedCartType.value = {
          id: cartTypeMatch.id,
          name: cartTypeMatch.name,
          label: cartTypeMatch.label,
          value: cartTypeMatch.value,
          diagramPath: ImageResolver.resolveImagePath(cartTypeMatch)
        }
      } else {
        selectedCartType.value = defaultCartType
      }
    } else {
      selectedCartType.value = defaultCartType
    }
  }
}, { immediate: true })

// Método para manejar la selección de Cart Type
const onCartTypeSelect = (value: any | null) => {
  if (value) {
    const diagramPath = value.diagramPath || '../assets/images/4seater.jpg'
    
    selectedCartType.value = {
      id: value.id,
      name: value.name,
      label: value.label,
      value: value.value,
      diagramPath: diagramPath
    }
  } else {
    selectedCartType.value = defaultCartType
  }
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