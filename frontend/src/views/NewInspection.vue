<template>
  <q-page class="q-pa-md">
    <q-form 
      @submit.prevent="submitForm"
      class="form-container"
    >
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
                  v-model="selectedCartType"
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
                  v-model="cartNumber" 
                  label="Cart Number" 
                  outlined 
                  readonly
                  style="width: 100%;"
                  input-class="custom-input-text"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Sección de diagrama con selección condicional -->
      <div class="row justify-center q-mt-md">
        <div class="col-12 text-center">
          <cart-diagram-annotations
            :cart-type="selectedCartType?.name"
            :diagram-path="selectedCartType?.diagramPath"
            :diagram-type="selectedProperty?.diagramType"
            @diagram-annotated="handleDiagramAnnotated"
          />
        </div>
      </div>

      <!-- Terms and Signature Section -->
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">Terms and Signature</div>
            <SignatureCanvas 
              v-model:terms-accepted="termsAccepted"
              @signature-change="handleSignatureChange"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- Botones de acción -->
      <div class="row q-gutter-md">
        <q-btn 
          label="Download PDF" 
          color="secondary" 
          @click="generatePDF"
          :disable="!canDownloadPDF"
        />
        <q-btn 
          label="Submit Inspection Form" 
          color="primary" 
          type="submit"
          :disable="!canSubmitInspection"
        />
      </div>
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import SignatureCanvas from '@/components/SignatureCanvas.vue'
import CartDiagramAnnotations from '@/components/CartDiagramAnnotations.vue'
import { useInspectionForm } from '@/composables/useInspectionForm'

const {
  // Estado
  guestInfo,
  selectedProperty,
  selectedCartType,
  cartNumber,
  annotatedDiagramImage,
  signature,
  termsAccepted,
  
  // Propiedades computadas
  properties,
  cartTypes,
  canDownloadPDF,
  canSubmitInspection,
  
  // Métodos
  onPropertySelect,
  onCartTypeSelect,
  handleDiagramAnnotated,
  handleSignatureChange,
  generatePDF,
  submitForm
} = useInspectionForm()
</script>

<style scoped>
.page-title, .custom-input-text {
  font-family: 'Arial', sans-serif;
  font-size: 12px;
  font-weight: bold;
  color: #333;
}

.q-table__title {
  font-family: 'Arial', sans-serif;
  font-size: 12px;
  font-weight: bold;
  color: #333;
}

.form-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 210mm; /* Ancho A4 */
  min-height: 297mm; /* Alto A4 */
  margin: 0 auto;
  padding: 5mm;
  box-sizing: border-box;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 3mm;
  text-align: center;
  width: 100%;
}

.company-logo {
  max-width: 100px;
  margin-bottom: 2mm;
  height: auto;
}

.q-card {
  width: 100%;
  margin-bottom: 2mm;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.q-card-section {
  padding: 3mm;
}

.row {
  width: 100%;
  justify-content: center;
  margin-bottom: 1mm;
}

.col-12 {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 1mm;
}

.damage-record-list {
  width: 100%;
  max-width: 180mm;
}

.q-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
}

.q-btn {
  margin-top: 3mm;
  padding: 2mm 4mm;
  font-size: 12px;
  border-radius: 4px;
}

/* Estilos para ocultar elementos durante la generación del PDF */
.printing-pdf .q-btn,
.printing-pdf .canvas-toolbar,
.printing-pdf .canvas-controls,
.printing-pdf .q-toolbar,
.printing-pdf .drawing-tools,
.printing-pdf .color-picker,
.printing-pdf .line-width-picker,
.printing-pdf .action-buttons,
.printing-pdf .clear-signature,
.printing-pdf .signature-controls,
.printing-pdf .q-drawer,
.printing-pdf .q-drawer__backdrop,
.printing-pdf .q-drawer__content,
.printing-pdf .q-drawer__scroller,
.printing-pdf .q-drawer__container,
.printing-pdf .q-drawer__inner {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
}

.printing-pdf .form-container {
  box-shadow: none !important;
}

.printing-pdf .signature-canvas,
.printing-pdf canvas {
  border: 1px solid #ddd !important;
  background: white !important;
  cursor: default !important;
}

/* Estilos específicos para la captura de PDF */
@media print {
  .q-btn,
  .canvas-toolbar,
  .canvas-controls,
  .q-toolbar,
  .drawing-tools,
  .color-picker,
  .line-width-picker,
  .action-buttons,
  .clear-signature,
  .signature-controls,
  .q-drawer,
  .q-drawer__backdrop,
  .q-drawer__content,
  .q-drawer__scroller,
  .q-drawer__container,
  .q-drawer__inner {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
  }

  .form-container {
    box-shadow: none !important;
  }

  .signature-canvas,
  canvas {
    border: 1px solid #ddd !important;
    background: white !important;
    cursor: default !important;
  }

  .page-title, .custom-input-text, .q-table__title {
    font-size: 10px;
  }

  .q-input {
    margin-bottom: 1mm;
  }

  .text-h6 {
    font-size: 12px;
    margin-bottom: 1mm;
  }
}
</style>