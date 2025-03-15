<template>
  <q-page-container>
    <q-page class="flex flex-center">
      <div class="full-width q-pa-md" style="max-width: 800px;">
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
                        v-model="selectedCartType" 
                        :options="cartTypeOptions" 
                        label="Cart Type" 
                        outlined 
                        required
                        input-class="custom-input-text"
                        @update:model-value="onCartTypeSelect"
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
                  :cart-type="selectedCartType"
                  :damages="damages"
                  @update-damage-position="updateDamagePosition"
                />
              </div>
            </div>

            <!-- Damage Records Table -->
            <div class="column q-mt-md">
              <div class="col-12">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h6">Damage Records</div>
                    <div class="column q-col-gutter-md">
                      <div class="col-12">
                        <q-table 
                          :rows="damages" 
                          :columns="damageColumns"
                          row-key="id"
                          flat 
                          bordered
                          title-class="q-table__title"
                        >
                          <template v-slot:body-cell-actions="props">
                            <q-td :props="props">
                              <q-btn 
                                flat 
                                round 
                                color="negative" 
                                icon="delete" 
                                @click="removeDamage(props.rowIndex)"
                                class="pdf-buttons"
                              />
                            </q-td>
                          </template>
                        </q-table>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Damage Record Form Section -->
            <div class="col-12 damage-record-form">
              <DamageRecordForm 
                :cart-parts="cartParts"
                :damage-types="damageTypes"
                @add="addDamage"
              />
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
                :disable="!isFormValid"
              />
            </div>
          </div>
        </q-form>
      </div>
    </q-page>
  </q-page-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'

// Reimportar componentes
import SignatureCanvas from '@/components/SignatureCanvas.vue'
import DamageRecordList from '@/components/DamageRecordList.vue'
import DamageRecordForm from '@/components/DamageRecordForm.vue'
import CartDiagramAnnotations from '@/components/CartDiagramAnnotations.vue'
import PDFGenerator from '@/components/PDFGenerator.vue'

// Reimportar tipos y constantes
import { CART_PARTS, PROPERTIES, GOLF_CART_TYPES, DAMAGE_TYPES } from '@/constants'
import { 
  Damage, 
  CartTypeOption, 
  DamageType,
  CartPart,
  Properties
} from '../types/base-types'

// Configuración de Quasar
const quasar = useQuasar()

// Configuración de Make Webhook
const MAKE_WEBHOOK_URL = 'https://hook.us1.make.com/kdaov65g7fjabrr78w4vnyhdpx92tdhf'

// Convertir CART_PARTS a CartPart[]
const cartParts = ref<CartPart[]>(CART_PARTS)
const propertyOptions = ref<Properties[]>(PROPERTIES)
const cartTypeOptions = ref<CartTypeOption[]>(GOLF_CART_TYPES)
const damageTypes = ref<DamageType[]>(DAMAGE_TYPES)

// Datos del formulario
const guestInfo = reactive({
  name: '',
  email: '',
  phone: '',
  date: ''
})

const selectedProperty = ref(null)
const selectedCartType = ref(null)
const damages = ref<Damage[]>([])
const guestObservations = ref('')
const termsAccepted = ref(false)
const signature = ref(null)

// Validación de formulario
const isFormValid = computed(() => {
  // Validar campos de información básica
  const basicInfoComplete = 
    guestInfo.name.trim() !== '' &&
    guestInfo.email.trim() !== '' &&
    guestInfo.phone.trim() !== '' &&
    guestInfo.date.trim() !== '' &&
    selectedProperty !== null &&
    damages.value.length > 0  // Al menos una falla registrada

  return basicInfoComplete
})

// Método para manejar la selección de Cart Type
const onCartTypeSelect = (value: string) => {
  const selectedType = cartTypeOptions.value.find(type => type.value === value)
  if (selectedType) {
    selectedCartType.value = selectedType
  }
}

// Definir columnas para la tabla de daños
const damageColumns = [
  { 
    name: 'part', 
    required: true, 
    label: 'Part', 
    align: 'left' as const, 
    field: 'part' 
  },
  { 
    name: 'type', 
    required: true, 
    label: 'Damage Type', 
    align: 'left' as const, 
    field: 'type' 
  },
  { 
    name: 'quantity', 
    required: true, 
    label: 'Quantity', 
    align: 'left' as const, 
    field: 'quantity' 
  },
  { 
    name: 'actions', 
    required: true, 
    label: 'Action', 
    align: 'center' as const, 
    field: (row: Damage) => row 
  }
]

// Función para añadir daño
function addDamage(damage: Damage) {
  // Verificar que no haya daños duplicados
  const isDuplicateDamage = damages.value.some(
    existingDamage => 
      existingDamage.part === damage.part && 
      existingDamage.type === damage.type
  )

  if (!isDuplicateDamage) {
    // Añadir un ID único si no existe
    const damageWithId = {
      ...damage,
      id: `${damage.part}-${damage.type}-${Date.now()}`
    }
    damages.value.push(damageWithId)
  } else {
    quasar.notify({
      type: 'warning',
      message: 'Este daño ya ha sido registrado.'
    })
  }
}

// Función para remover daño por índice
function removeDamage(index: number) {
  damages.value.splice(index, 1)
}

// Función para actualizar posición de daño
const updateDamagePosition = ({ index, x, y }: { index: number, x: number, y: number }) => {
  if (damages.value[index]) {
    damages.value[index].x = x
    damages.value[index].y = y
  }
}

// Método para enviar a Make
const sendToMake = async () => {
  try {
    const payload = {
      guestInfo: { ...guestInfo },
      property: selectedProperty.value,
      cartType: selectedCartType.value,
      damages: damages.value,
      observations: guestObservations.value,
      termsAccepted: termsAccepted.value,
      signature: signature.value
    }

    const response = await axios.post(MAKE_WEBHOOK_URL, payload)
    
    // Manejar respuesta de Make
    if (response.data.status === 'success') {
      // Mostrar mensaje de éxito
      const $q = useQuasar()
      $q.notify({
        type: 'positive',
        message: 'Formulario enviado exitosamente'
      })
    }
  } catch (error) {
    // Manejar errores
    const $q = useQuasar()
    $q.notify({
      type: 'negative',
      message: 'Error al enviar formulario'
    })
    console.error('Error enviando a Make:', error)
  }
}

// Modificar método generatePDF para usar sendToMake
const generatePDF = async (event: Event) => {
  event.preventDefault()
  
  // Validaciones previas
  if (!termsAccepted.value) {
    const $q = useQuasar()
    $q.notify({
      type: 'warning',
      message: 'Debe aceptar los términos y condiciones'
    })
    return
  }

  // Enviar a Make en lugar de generar PDF directamente
  await sendToMake()
}

// Referencia al contenedor del formulario
const formContainerRef = ref<HTMLElement>(document.createElement('div'))

// Referencia al componente PDFGenerator
const pdfGeneratorRef = ref<InstanceType<typeof PDFGenerator> | null>(null)

// Método para generar PDF
async function onPDFGenerated() {
  quasar.notify({
    type: 'positive',
    message: 'PDF generado exitosamente',
    position: 'top'
  })
}

function onPDFError(error: Error) {
  console.error('Error en generación de PDF:', error)
  quasar.notify({
    type: 'negative',
    message: 'Error al generar PDF: ' + error.message,
    position: 'top'
  })
}
</script>

<style scoped>
.page-title {
  font-size: 1.8rem;  /* Reducir tamaño de título */
  font-weight: 600;   /* Mantener un peso de fuente legible */
  margin-bottom: 15px; /* Ajustar espaciado */
  color: #333;        /* Color más suave */
}

.form-container {
  width: 100%;
}

@media (max-width: 600px) {
  .page-title {
    font-size: 1.5rem;  /* Aún más pequeño en móviles */
  }
}

/* Ajustes responsive */
@media (max-width: 600px) {
  .q-page-container {
    padding: 0 !important;
  }

  .q-page {
    padding: 8px !important;
  }

  .form-container {
    padding: 0 !important;
  }
}

/* Asegurar inputs responsivos */
.q-input, 
.q-select,
.q-table {
  width: 100%;
}

/* Eliminar scrollbar en pantallas grandes */
::-webkit-scrollbar {
  display: none;
}
</style>
