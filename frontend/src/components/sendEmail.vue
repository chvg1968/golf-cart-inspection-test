<script setup>
import { ref } from 'vue'
import { useSupabaseClient } from '@supabase/vue-supabase'
import { useToast } from 'vue-toastification' // Ejemplo de librería de notificaciones

const supabaseClient = useSupabaseClient()
const toast = useToast()

async function submitInspection(formData) {
  try {
    const projectRef = import.meta.env.VITE_SUPABASE_URL.split('//')[1].split('.')[0]
    const response = await fetch(`https://${projectRef}.supabase.co/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseClient.auth.getSession()?.access_token}`
      },
      body: JSON.stringify({ 
        formData,
        initialUserEmail: supabaseClient.auth.getUser()?.email 
      })
    })

    const result = await response.json()
    if (result.success) {
      toast.success('Inspección enviada exitosamente')
    } else {
      toast.error('Error al enviar la inspección')
    }
  } catch (error) {
    toast.error('Error de conexión')
    console.error(error)
  }
}
</script>