<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6">Guest Information</div>
      <div class="column q-col-gutter-md">
        <div class="col-12">
          <q-input 
            v-model="localGuestInfo.name" 
            label="Guest Name" 
            outlined 
            required
            class="full-width custom-input"
            @update:model-value="emitUpdate"
          />
        </div>
        <div class="col-12">
          <q-input 
            v-model="localGuestInfo.email" 
            label="Guest Email" 
            type="email" 
            outlined 
            required
            class="full-width custom-input"
            :rules="[val => val && val.includes('@') || 'Invalid email']"
            @update:model-value="emitUpdate"
          />
        </div>
        <div class="col-12">
          <q-input 
            v-model="localGuestInfo.phone" 
            label="Guest Phone" 
            outlined 
            required
            class="full-width custom-input"
            :rules="[
              val => val && val.length >= 10 || 'Please enter a valid phone number'
            ]"
            @update:model-value="emitUpdate"
          />
        </div>
        <div class="col-12">
          <q-input 
            v-model="localGuestInfo.date" 
            label="Inspection Date" 
            type="date" 
            outlined 
            required
            class="full-width custom-input"
            @update:model-value="emitUpdate"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { GuestInfo } from '@/types/base-types'

const props = defineProps<{
  guestInfo: GuestInfo
}>()

const emit = defineEmits<{
  (e: 'update:guestInfo', value: GuestInfo): void
}>()

const localGuestInfo = ref<GuestInfo>({ ...props.guestInfo })

watch(() => props.guestInfo, (newValue) => {
  localGuestInfo.value = { ...newValue }
})

const emitUpdate = () => {
  emit('update:guestInfo', localGuestInfo.value)
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