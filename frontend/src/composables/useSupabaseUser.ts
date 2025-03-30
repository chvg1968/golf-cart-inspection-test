import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

export function useSupabaseUser() {
  const user = ref<User | null>(null) // Definimos que puede ser User o null

  const getUser = async () => {
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
  }

  onMounted(() => {
    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })

    return () => {
      authListener.subscription?.unsubscribe()
    }
  })

  return user
}