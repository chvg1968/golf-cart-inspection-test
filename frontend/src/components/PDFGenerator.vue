<template>
    <div class="pdf-generator" style="display: none;">
      <!-- Componente invisible para generación de PDF -->
    </div>
  </template>
  
  <script setup lang="ts">
  import { defineExpose, onMounted, ref } from 'vue'
  import { useQuasar } from 'quasar'
  import html2canvas from 'html2canvas'
  import jsPDF from 'jspdf'

  import type { 
    GuestInfo, 
    Properties, 
    CartTypeOption, 
    Damage 
  } from '@/types/base-types'

  // Definir un tipo para los datos del PDF
  interface PDFData {
    guestInfo?: GuestInfo
    selectedProperty?: Properties | null
    selectedCartType?: CartTypeOption | null
    cartNumber?: string
    damages?: Damage[]
    annotatedDiagramImage?: string
    cartDiagramDrawing?: string
  }

  const $q = useQuasar()
  const isMounted = ref(false)

  // Método para generar PDF
  const generatePDF = async (data: PDFData): Promise<Blob> => {
    if (!isMounted.value) {
      throw new Error('Componente no está montado')
    }

    try {
      console.log('Iniciando generación de PDF con datos:', data)
      
      const form = document.querySelector('.form-container') as HTMLElement
      if (!form) {
        throw new Error('Formulario no encontrado')
      }

      // Clonar formulario
      const clonedForm = form.cloneNode(true) as HTMLElement
      
      // Añadir estilos
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
        }
        input, select, textarea, div, span {
          font-size: 24px !important;
          font-weight: bold !important;
        }
        label {
          font-size: 16px !important;
          font-weight: normal !important;
        }
      `
      clonedForm.appendChild(styleElement)

      // Ocultar elementos innecesarios
      const elementsToHide = ['.q-field__append', '.q-icon']
      elementsToHide.forEach(selector => {
        const elements = clonedForm.querySelectorAll(selector)
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            element.style.display = 'none'
          }
        })
      })

      // Contenedor temporal
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.width = '210mm'
      tempDiv.style.minHeight = '297mm'
      tempDiv.style.padding = '10mm'
      tempDiv.style.boxSizing = 'border-box'
      tempDiv.appendChild(clonedForm)
      document.body.appendChild(tempDiv)

      // Capturar canvas
      const canvas = await html2canvas(clonedForm, {
        scale: 1,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })

      // Remover contenedor temporal
      document.body.removeChild(tempDiv)

      // Crear PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      // Calcular dimensiones
      const imgRatio = canvas.width / canvas.height
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      let imgWidth = pageWidth - 20
      let imgHeight = imgWidth / imgRatio

      if (imgHeight > pageHeight - 20) {
        imgHeight = pageHeight - 20
        imgWidth = imgHeight * imgRatio
      }

      // Calcular posición centrada
      const xPosition = (pageWidth - imgWidth) / 2
      const yPosition = (pageHeight - imgHeight) / 2

      // Agregar imagen al PDF
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.5),
        'JPEG',
        xPosition,
        yPosition,
        imgWidth,
        imgHeight
      )

      // Generar Blob
      const blob = pdf.output('blob')
      console.log('PDF generado exitosamente')
      return blob

    } catch (error) {
      console.error('Error en generación de PDF:', error)
      throw error
    }
  }

  // Exponer métodos
  const methods = {
    generatePDF
  }

  // Exponer métodos usando defineExpose
  defineExpose(methods)

  // Log cuando el componente se monta
  onMounted(() => {
    isMounted.value = true
    console.log('PDFGenerator montado, métodos disponibles:', Object.keys(methods))
  })
  </script>