// Modificar el template
<template>
  <div class="complete-inspection-container">
    <div v-if="loading">Cargando...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    
    <!-- Vista del formulario -->
    <q-form 
      v-else-if="viewState === 'form'" 
      @submit.prevent="submitForm"
    >
      <!-- Contenido del formulario -->
    </q-form>

    <!-- Vista de completado -->
    <div v-else class="completion-message">
      <q-icon name="check_circle" size="xl" color="positive" />
      <div class="text-h5 q-mt-md">Inspección completada</div>
      <p class="q-mt-md">Gracias por completar la inspección.</p>
      <q-btn
        label="Volver al inicio"
        to="/"
        color="primary"
        class="q-mt-md"
      />
    </div>
  </div>
</template>

<script>

// En el script setup
const viewState = ref<'form' | 'completed'>('form')

// Modificar la lógica de envío
async function submitForm() {
  try {
    const { error } = await supabase
      .from('inspection_links')
      .update({
        status: 'completed',
        guest_observations: guestObservations.value,
        signature: signature.value,
        completed_at: new Date().toISOString()
      })
      .eq('id', route.params.id)

    if (error) throw error

    // Cambiar a vista de completado
    viewState.value = 'completed'
  } catch (error) {
    console.error('Error enviando formulario:', error)
    quasar.notify({
      type: 'negative',
      message: 'Error enviando formulario'
    })
  }
}
</script>