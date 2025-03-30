import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib'
import { InspectionFormData, PDFGenerationOptions } from './types.ts'

export class PDFGenerator {
  private static async createBasePage(doc: PDFDocument, font: PDFFont): Promise<{ page: PDFPage, width: number, height: number, font: PDFFont }> {
    const page = doc.addPage()
    const { width, height } = page.getSize()
    
    // Encabezado
    page.drawText('Informe de Inspección de Carrito de Golf', {
      x: 50,
      y: height - 50,
      size: 16,
      font,
      color: rgb(0, 0, 0)
    })

    return { page, width, height, font }
  }

  private static async addFormDataToPage(
    page: PDFPage, 
    formData: InspectionFormData, 
    font: PDFFont,
    startY: number
  ): Promise<number> {
    const drawText = (text: string, y: number) => {
      page.drawText(text, { 
        x: 50, 
        y, 
        size: 12, 
        font,
        color: rgb(0, 0, 0)
      })
    }

    drawText(`Nombre: ${formData.guestName}`, startY)
    drawText(`Email: ${formData.guestEmail}`, startY - 20)
    drawText(`Propiedad: ${formData.propertyId}`, startY - 40)
    drawText(`Tipo de Carrito: ${formData.cartType}`, startY - 60)
    drawText(`Número de Carrito: ${formData.cartNumber}`, startY - 80)

    return startY - 100
  }

  static async generate(options: PDFGenerationOptions): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create()
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

    const { page, height, font } = await this.createBasePage(pdfDoc, helveticaFont)
    
    // Añadir datos del formulario
    let currentY = height - 100
    currentY = await this.addFormDataToPage(page, options.formData, helveticaFont, currentY)

    // Añadir sección de daños si está presente
    if (options.formData.damages && options.formData.damages.length > 0) {
      page.drawText('Daños Registrados:', {
        x: 50,
        y: currentY - 20,
        size: 14,
        font: helveticaFont,
        color: rgb(0, 0, 0)
      })

      currentY -= 40
      options.formData.damages.forEach((damage, index) => {
        page.drawText(`Daño ${index + 1}: ${damage.type} en ${damage.location}`, {
          x: 70,
          y: currentY - (index * 20),
          size: 12,
          font: helveticaFont,
          color: rgb(0.5, 0.5, 0.5)
        })
      })
    }

    // Añadir observaciones si están presentes y permitidas
    if (options.includeObservations && options.formData.observations) {
      page.drawText('Observaciones:', {
        x: 50,
        y: currentY - 60,
        size: 14,
        font: helveticaFont,
        color: rgb(0, 0, 0)
      })

      page.drawText(options.formData.observations, {
        x: 70,
        y: currentY - 80,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0)
      })
    }

    // Añadir firma si está permitido
    if (options.includeSignature && options.formData.signature) {
      page.drawText('Firma:', {
        x: 50,
        y: currentY - 120,
        size: 14,
        font: helveticaFont,
        color: rgb(0, 0, 0)
      })

      // TODO: Implementar renderizado de firma
      page.drawText('Firma digital incluida', {
        x: 70,
        y: currentY - 140,
        size: 12,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5)
      })
    }

    // Finalizar y serializar PDF
    const pdfBytes = await pdfDoc.save()
    return pdfBytes
  }
}
