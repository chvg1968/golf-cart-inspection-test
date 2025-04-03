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
        <guest-information-form
          v-model:guest-info="guestInfo"
        />
      </div>

      <!-- Property and Cart Type Section -->
      <div class="col-12">
        <property-cart-form
          v-model:selected-property="selectedProperty"
          v-model:selected-cart-type="selectedCartType"
          v-model:cart-number="cartNumber"
        />
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
        <terms-signature-form
          v-model:terms-accepted="termsAccepted"
          @signature-change="handleSignatureChange"
        />
      </div>

      <!-- Botones de acción -->
      <div class="row q-gutter-md">
        <q-btn 
          label="Download PDF" 
          color="secondary" 
          @click="(evt) => generatePDF(evt.target as HTMLElement, guestInfo)"
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
import CartDiagramAnnotations from '@/components/CartDiagramAnnotations.vue'
import GuestInformationForm from '@/components/GuestInformationForm.vue'
import PropertyCartForm from '@/components/PropertyCartForm.vue'
import TermsSignatureForm from '@/components/TermsSignatureForm.vue'
import { useInspectionForm } from '@/composables/useInspectionForm'

const {
  guestInfo,
  selectedProperty,
  selectedCartType,
  cartNumber,
  termsAccepted,
  canDownloadPDF,
  canSubmitInspection,
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

.full-width {
  width: 100%;
}

.custom-input {
  font-family: 'Arial', sans-serif;
  font-size: 12px;
  color: #333;
}

.form-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 210mm;
  min-height: 297mm;
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

.q-btn {
  margin-top: 3mm;
  padding: 2mm 4mm;
  font-size: 12px;
  border-radius: 4px;
}

/* Estilos para PDF y impresión */
.printing-pdf,
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
  .q-drawer__inner,
  .row.q-gutter-md {
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

  .page-title,
  .custom-input-text,
  .q-table__title {
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