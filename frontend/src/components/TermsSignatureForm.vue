<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6">Terms and Signature</div>
      <SignatureCanvas 
        v-model:terms-accepted="localTermsAccepted"
        @signature-change="handleSignatureChange"
      />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import SignatureCanvas from '@/components/SignatureCanvas.vue'

const props = defineProps<{
  termsAccepted: boolean
}>()

const emit = defineEmits<{
  (e: 'update:termsAccepted', value: boolean): void
  (e: 'signature-change', value: string): void
}>()

const localTermsAccepted = ref<boolean>(props.termsAccepted)

watch(() => props.termsAccepted, (newValue) => {
  localTermsAccepted.value = newValue
})

const handleSignatureChange = (signature: string) => {
  emit('signature-change', signature)
}
</script>

<style scoped>
.custom-input {
  font-family: 'Arial', sans-serif;
  font-size: 12px;
  color: #333;
}

.full-width {
  width: 100%;
}
</style>