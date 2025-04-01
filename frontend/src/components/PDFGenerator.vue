<template>
  <div class="pdf-generator" style="display: none;">
    <!-- Componente invisible para generación de PDF -->
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineExpose, withDefaults, defineProps } from 'vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

import type { 
  GuestInfo, 
  Properties, 
  CartTypeOption,
  PDFData
} from '@/types/base-types'

const emit = defineEmits<{
  (e: 'pdf-generated', blob: Blob): void
  (e: 'pdf-error', error: Error): void
}>()

const props = withDefaults(defineProps<{
  selectedProperty: Properties | null
  selectedCartType: CartTypeOption
  guestInfo: GuestInfo
  cartNumber: string
  annotatedDiagramImage: string | null
}>(), {
  selectedProperty: null,
  annotatedDiagramImage: null
})

// Usar props para demostrar que están siendo utilizadas
const logProps = () => {
  console.log('Propiedades:', {
    selectedProperty: props.selectedProperty,
    selectedCartType: props.selectedCartType,
    guestInfo: props.guestInfo,
    cartNumber: props.cartNumber,
    annotatedDiagramImage: props.annotatedDiagramImage
  })
}

// Método para generar PDF con datos opcionales
async function generatePDF(data: PDFData): Promise<Blob> {
  try {
    console.log('Iniciando generación de PDF con datos:', data)

    // Añadir un retraso para asegurar que las marcas estén listas
    await new Promise(resolve => setTimeout(resolve, 500))

    const form = document.querySelector('.form-container') as HTMLElement
    
    if (!form) {
      throw new Error('Formulario no encontrado')
    }

    // Clonar formulario
    const clonedForm = form.cloneNode(true) as HTMLElement
    
    // Añadir estilos de fuente al clon
    const styleElement = document.createElement('style')
    styleElement.textContent = `
      body, html, * {
        font-family: Arial, sans-serif !important;
        line-height: 1.5 !important;
        color: #333 !important;
      }
      .text-h6, .page-title {
        font-size: 24px !important;
        font-weight: bold !important;
        text-transform: uppercase !important;
      }
      input, select, textarea, div, span, 
      .q-table, .q-table__container, 
      .q-table__top, .q-table__bottom, 
      .q-table thead, .q-table tbody, 
      .q-table tr, .q-table th, .q-table td {
        font-size: 24px !important;
        font-weight: bold !important;
      }
      label {
        font-size: 16px !important;
        font-weight: normal !important;
      }
      .q-checkbox__label {
        font-size: 16px !important;
        font-weight: normal !important;
      }
    `
    clonedForm.appendChild(styleElement)
    
    // Elementos a ocultar y procesar
    const elementsToHide = clonedForm.querySelectorAll('.pdf-buttons, .q-btn')
    elementsToHide.forEach(el => el.remove())

    // Generar PDF
    const canvas = await html2canvas(clonedForm)
    const imgData = canvas.toDataURL('image/png')
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

    // Convertir PDF a Blob
    const pdfBlob = new Blob([pdf.output('arraybuffer')], { type: 'application/pdf' })
    
    // Emitir evento de PDF generado
    emit('pdf-generated', pdfBlob)
    
    return pdfBlob
  } catch (error) {
    console.error('Error generando PDF:', error)
    emit('pdf-error', error instanceof Error ? error : new Error('Error desconocido'))
    throw error
  }
}

// Exponer método de generación de PDF
defineExpose({ generatePDF, logProps })
</script>