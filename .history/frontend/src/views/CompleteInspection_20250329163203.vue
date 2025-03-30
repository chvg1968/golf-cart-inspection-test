<template>
  <div class="complete-inspection-container">
    <div v-if="loading" class="loading">
      <p>Cargando información de la inspección...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>
    
    <form v-else @submit.prevent="submitInspection" class="inspection-form">
      <h1>Completar Inspección de Carrito de Golf</h1>
      
      <div class="initial-form-section">
        <h2>Información Inicial</h2>
        <div class="form-grid">
          <div class="form-field">
            <label>Propiedad:</label>
            <input 
              type="text" 
              :value="initialFormData.propertyId" 
              readonly 
            />
          </div>
          <div class="form-field">
            <label>Tipo de Carrito:</label>
            <input 
              type="text" 
              :value="initialFormData.cartType" 
              readonly 
            />
          </div>
          <div class="form-field">
            <label>Número de Carrito:</label>
            <input 
              type="text" 
              :value="initialFormData.cartNumber" 
              readonly 
            />
          </div>
        </div>
      </div>

      <div class="guest-observations-section">
        <h2>Observaciones del Invitado</h2>
        <textarea 
          v-model="completedFormData.observations"
          placeholder="Ingrese sus observaciones adicionales"
          rows="4"
        ></textarea>
      </div>

      <div class="signature-section">
        <h2>Firma</h2>
        <SignatureCanvas 
          @signature-captured="handleSignatureCapture"
        />
      </div>

      <div class="terms-section">
        <label class="terms-checkbox">
          <input 
            type="checkbox" 
            v-model="completedFormData.termsAccepted"
          />
          Acepto los términos y condiciones
        </label>
      </div>

      <div class="submit-section">
        <button 
          type="submit" 
          :disabled="!isFormValid"
        >
          Completar Inspección
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { completeInspection } from '@/api/email'
import SignatureCanvas from '@/components/SignatureCanvas.vue'
import { FormData } from '@/types/base'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref('')
const initialFormData = ref<Partial<FormData>>({})
const completedFormData = ref<Partial<FormData>>({
  observations: '',
  signature: '',
  termsAccepted: false
})

const token = route.params.token as string

const isFormValid = computed(() => {
  return completedFormData.value.signature && 
         completedFormData.value.termsAccepted
})

const handleSignatureCapture = (signature: string) => {
  completedFormData.value.signature = signature
}

const submitInspection = async () => {
  if (!isFormValid.value) {
    error.value = 'Por favor, complete todos los campos requeridos'
    return
  }

  try {
    const result = await completeInspection(token, completedFormData.value)
    
    if (result.success) {
      // Mostrar mensaje de éxito y redirigir
      alert('Inspección completada exitosamente')
      router.push('/inspection-completed')
    } else {
      error.value = result.message || 'Error al completar la inspección'
    }
  } catch (err) {
    error.value = 'Error al enviar la inspección'
    console.error(err)
  }
}

onMounted(async () => {
  try {
    const { data, error: fetchError } = await supabase
      .from('inspection_links')
      .select('*')
      .eq('token', token)
      .single()

    if (fetchError) throw fetchError

    if (data.status === 'completed') {
      error.value = 'Esta inspección ya ha sido completada'
      loading.value = false
      return
    }

    initialFormData.value = data.initial_form_data
    loading.value = false
  } catch (err) {
    error.value = 'No se pudo cargar la información de la inspección'
    loading.value = false
    console.error(err)
  }
})
</script>

<style scoped>
.complete-inspection-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.inspection-form {
  background-color: #f9f9f9;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-field input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f0f0f0;
}

textarea {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.terms-checkbox {
  display: flex;
  align-items: center;
  margin-top: 15px;
}

.terms-checkbox input {
  margin-right: 10px;
}

.submit-section {
  margin-top: 20px;
  text-align: center;
}

button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.loading, .error {
  text-align: center;
  margin-top: 50px;
}
</style>
