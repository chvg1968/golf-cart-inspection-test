import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export interface PDFGenerationOptions {
  scale?: number
  quality?: number
  format?: 'a4' | 'letter'
  margin?: number
}

export class PDFService {
  static async generateFromHTML(
    element: HTMLElement,
    options: PDFGenerationOptions = {}
  ): Promise<Blob> {
    try {
      const {
        scale = 1,
        quality = 0.95,
        format = 'a4',
        margin = 10
      } = options

      // Crear PDF
      const pdf = new jsPDF('p', 'mm', format)
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      // Capturar el elemento como canvas
      const canvas = await html2canvas(element, {
        scale,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Asegurar que los estilos se apliquen en el clon
          const clonedElement = clonedDoc.querySelector('.form-container')
          if (clonedElement) {
            const element = clonedElement as HTMLElement
            element.style.width = '210mm'
            element.style.height = 'auto'
            element.style.position = 'relative'
            element.style.left = '0'
            element.style.top = '0'
            element.style.boxSizing = 'border-box'
            element.style.padding = '5mm'
          }
        }
      })

      // Calcular dimensiones
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const imgRatio = imgWidth / imgHeight

      // Calcular dimensiones para que quepa en la página
      let finalWidth = pageWidth - (margin * 2)
      let finalHeight = finalWidth / imgRatio

      // Si la altura es mayor que la página, ajustar
      if (finalHeight > pageHeight - (margin * 2)) {
        finalHeight = pageHeight - (margin * 2)
        finalWidth = finalHeight * imgRatio
      }

      // Asegurar que las dimensiones sean positivas
      finalWidth = Math.max(0, finalWidth)
      finalHeight = Math.max(0, finalHeight)

      // Calcular posición centrada
      const xPosition = Math.max(0, (pageWidth - finalWidth) / 2)
      const yPosition = Math.max(0, (pageHeight - finalHeight) / 2)

      // Agregar imagen al PDF
      pdf.addImage(
        canvas.toDataURL('image/jpeg', quality),
        'JPEG',
        xPosition,
        yPosition,
        finalWidth,
        finalHeight
      )

      // Generar y retornar Blob
      return pdf.output('blob')
    } catch (error) {
      console.error('Error generando PDF:', error)
      throw new Error('Error al generar el PDF')
    }
  }
} 