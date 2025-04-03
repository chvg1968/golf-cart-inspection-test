<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6">Property and Cart Type</div>
      <div class="column q-col-gutter-md">
        <div class="col-12">
          <q-select 
            :model-value="selectedProperty"
            :options="properties"
            option-label="name"
            option-value="id"
            label="Property *"
            outlined
            dense
            :rules="[val => !!val || 'Property is required']"
            @update:model-value="onPropertySelect"
          />
        </div>
        <div class="col-12">
          <q-select 
            :model-value="selectedCartType"
            :options="cartTypes"
            option-label="name"
            option-value="name"
            label="Cart Type *"
            outlined
            dense
            :rules="[val => !!val || 'Cart Type is required']"
            @update:model-value="onCartTypeSelect"
          />
        </div>
        <div class="col-12">
          <q-input 
            :model-value="cartNumber" 
            label="Cart Number" 
            outlined 
            readonly
            class="full-width custom-input"
            @update:model-value="(val: string | number | null) => $emit('update:cartNumber', val?.toString() || '')"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Properties, CartTypeOption } from '@/types/base-types'
import { InspectionService } from '@/services/InspectionService'

defineProps<{
  selectedProperty: Properties | null
  selectedCartType: CartTypeOption | null
  cartNumber: string
}>()

const emit = defineEmits<{
  (e: 'update:selectedProperty', value: Properties): void
  (e: 'update:selectedCartType', value: CartTypeOption): void
  (e: 'update:cartNumber', value: string): void
}>()

const properties = ref<Properties[]>(InspectionService.getProperties())
const cartTypes = ref<CartTypeOption[]>(InspectionService.getCartTypes())

const onPropertySelect = (property: Properties) => {
  emit('update:selectedProperty', property)
  const cartType = InspectionService.getCartTypeForProperty(property)
  emit('update:selectedCartType', cartType)
  emit('update:cartNumber', property.cartNumber || '')
}

const onCartTypeSelect = (cartType: CartTypeOption) => {
  emit('update:selectedCartType', cartType)
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