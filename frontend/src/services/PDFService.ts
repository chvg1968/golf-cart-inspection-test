import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib'

export interface InspectionFormData {
  guestName: string
  guestEmail: string
  propertyId: string
  cartType: string
  cartNumber: string
  damages?: Array<{ type: string; location: string }>
  observations?: string
  signature?: string
  termsAccepted?: boolean
}

export interface PDFGenerationOptions {
  formData: InspectionFormData
  includeObservations?: boolean
  includeSignature?: boolean
}

const API_KEY = import.meta.env.VITE_API_TEMPLATE_KEY
const API_URL = import.meta.env.VITE_API_TEMPLATE_URL || 'https://api.apitemplate.io/v1/create'

// Depuración exhaustiva de variables de entorno
console.log('🔍 Entorno de variables:', {
  NODE_ENV: import.meta.env.MODE,
  API_KEY_RAW: JSON.stringify(import.meta.env.VITE_API_TEMPLATE_KEY),
  API_KEY_PARSED: JSON.stringify(API_KEY),
  API_URL_RAW: import.meta.env.VITE_API_TEMPLATE_URL,
  API_URL_PARSED: API_URL
})

// Validar que la API key no tenga espacios o caracteres no deseados
const sanitizedApiKey = API_KEY ? API_KEY.trim() : ''

if (!sanitizedApiKey) {
  console.error('⚠️ No se encontró la clave de API de apitemplate. Por favor, configúrala en .env')
  throw new Error('Clave de API de apitemplate no configurada')
}

// Añadir log de depuración de API KEY
console.log('🔑 API Key (sanitizada):', sanitizedApiKey)
console.log('🌐 API URL:', API_URL)

class APITemplateError extends Error {
  constructor(message: string, details?: any) {
    super(message)
    this.name = 'APITemplateError'
    this.details = details
  }
  details?: any
}

export class PDFService {
  private static async createBasePage(doc: PDFDocument, font: PDFFont): Promise<{ page: PDFPage, height: number }> {
    const page = doc.addPage()
    const { height } = page.getSize()
    
    // Encabezado
    page.drawText('Informe de Inspección de Carrito de Golf', {
      x: 50,
      y: height - 50,
      size: 16,
      font,
      color: rgb(0, 0, 0)
    })

    return { page, height }
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

  private static async addDamagesSection(
    page: PDFPage,
    damages: Array<{ type: string; location: string }> | undefined,
    font: PDFFont,
    startY: number
  ): Promise<number> {
    if (!damages || damages.length === 0) return startY

    page.drawText('Puntos Marcados en Diagrama:', {
      x: 50,
      y: startY - 20,
      size: 14,
      font,
      color: rgb(0, 0, 0)
    })

    page.drawText(`Se han registrado ${damages.length} punto(s) de daño/observación en el diagrama.`, {
      x: 70,
      y: startY - 40,
      size: 12,
      font,
      color: rgb(0, 0, 0)
    })

    return startY - 60
  }

  private static async addObservationsSection(
    page: PDFPage,
    observations: string | undefined,
    font: PDFFont,
    startY: number
  ): Promise<number> {
    if (!observations) return startY

    page.drawText('Observaciones:', {
      x: 50,
      y: startY - 60,
      size: 14,
      font,
      color: rgb(0, 0, 0)
    })

    page.drawText(observations, {
      x: 70,
      y: startY - 80,
      size: 12,
      font,
      color: rgb(0, 0, 0)
    })

    return startY - 100
  }

  private static async addSignatureSection(
    page: PDFPage,
    signature: string | undefined,
    font: PDFFont,
    startY: number
  ): Promise<number> {
    if (!signature) return startY

    page.drawText('Firma:', {
      x: 50,
      y: startY - 120,
      size: 14,
      font,
      color: rgb(0, 0, 0)
    })

    page.drawText('Firma digital incluida', {
      x: 70,
      y: startY - 140,
      size: 12,
      font,
      color: rgb(0.5, 0.5, 0.5)
    })

    return startY - 160
  }

  private static validateApiResponse(responseData: any): void {
    if (!responseData) {
      throw new APITemplateError('Respuesta de API vacía', { 
        hint: 'Verifica tu API key en apitemplate.io' 
      })
    }

    if (responseData.status !== 'success') {
      const errorMessage = responseData.message || 
        responseData.error || 
        'Error desconocido al generar PDF'
      
      console.error('❌ Error de API Template:', {
        status: responseData.status,
        message: errorMessage,
        details: responseData
      })

      throw new APITemplateError(errorMessage, {
        status: responseData.status,
        originalResponse: responseData
      })
    }
  }

  static async generateFromHTML(options: PDFGenerationOptions): Promise<Blob> {
    try {
      // Validación exhaustiva de datos de entrada
      if (!options.formData) {
        throw new APITemplateError('Datos de formulario no proporcionados')
      }

      // Generar URL con datos prellenados
      const baseUrl = 'https://golfcartinspectiontest.netlify.app/inspection'
      const queryParams = new URLSearchParams({
        guestName: options.formData.guestName || '',
        guestEmail: options.formData.guestEmail || '',
        propertyId: options.formData.propertyId || '',
        cartType: options.formData.cartType || '',
        cartNumber: options.formData.cartNumber || '',
        damages: JSON.stringify(options.formData.damages || []),
        observations: options.formData.observations || ''
      })

      const inspectionUrl = `${baseUrl}?${queryParams.toString()}`

      // Solicitud para generar PDF desde URL
      const requestBody = {
        url: inspectionUrl,
        filename: `inspeccion-carrito-${options.formData.cartNumber || 'sin-numero'}.pdf`,
        settings: {
          paper_size: 'A4',
          orientation: '1',
          margin_top: '20',
          margin_right: '20',
          margin_bottom: '20',
          margin_left: '20',
          print_background: '1'
        },
        export_type: 'json', // Obtener URL del PDF
        expiration: 60, // Disponible por 1 hora
        cloud_storage: 1, // Almacenar en CDN
        image_resample_res: '150', // Optimizar tamaño
        meta: `golf-cart-${options.formData.cartNumber || 'unknown'}`
      }

      console.group('🔍 Generación de PDF desde URL')
      console.log('URL de Inspección:', inspectionUrl)
      console.log('Parámetros de Solicitud:', JSON.stringify(requestBody, null, 2))
      console.groupEnd()

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': sanitizedApiKey
        },
        body: JSON.stringify(requestBody)
      })

      // Manejo detallado de errores HTTP
      if (!response.ok) {
        const errorText = await response.text()
        console.group('❌ Error de Respuesta HTTP')
        console.error('Status:', response.status)
        console.error('StatusText:', response.statusText)
        console.error('Error Body:', errorText)
        console.groupEnd()

        throw new APITemplateError(`Error HTTP: ${response.status}`, {
          status: response.status,
          errorBody: errorText
        })
      }

      // Parsear respuesta
      const responseData = await response.json()

      console.group('📄 Respuesta de API')
      console.log('Datos completos:', JSON.stringify(responseData, null, 2))
      console.groupEnd()

      // Validar respuesta de la API
      this.validateApiResponse(responseData)

      // Descargar PDF desde la URL generada
      const pdfResponse = await fetch(responseData.download_url)
      const pdfData = await pdfResponse.arrayBuffer()
      
      return new Blob([pdfData], { type: 'application/pdf' })
    } catch (error) {
      console.error('❌ Error completo en generación de PDF:', error)
      
      if (error instanceof APITemplateError) {
        console.group('🚨 Detalles de Error de API Template')
        console.error('Mensaje:', error.message)
        console.error('Detalles:', error.details)
        console.groupEnd()
        
        // Sugerencias de solución
        if (error.details?.status === 400) {
          console.warn('🔑 Posibles soluciones:')
          console.warn('1. Verifica la URL generada')
          console.warn('2. Comprueba los parámetros de la solicitud')
          console.warn('3. Contacta al soporte de apitemplate.io')
        }
      }
      
      // Propagar error con mensaje amigable
      throw error instanceof Error ? error : new Error('Error inesperado al generar PDF')
    }
  }

  static async generate(options: PDFGenerationOptions): Promise<Blob> {
    try {
      const pdfDoc = await PDFDocument.create()
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const { page, height } = await this.createBasePage(pdfDoc, helveticaFont)
      
      let currentY = height - 100
      currentY = await this.addFormDataToPage(page, options.formData, helveticaFont, currentY)
      currentY = await this.addDamagesSection(page, options.formData.damages, helveticaFont, currentY)
      
      if (options.includeObservations) {
        currentY = await this.addObservationsSection(page, options.formData.observations, helveticaFont, currentY)
      }
      
      if (options.includeSignature) {
        currentY = await this.addSignatureSection(page, options.formData.signature, helveticaFont, currentY)
      }

      const pdfBytes = await pdfDoc.save()
      return new Blob([pdfBytes], { type: 'application/pdf' })
    } catch (error) {
      console.error('Error generando PDF:', error)
      throw error instanceof Error ? error : new Error('Error al generar el PDF')
    }
  }

  static async validateInspectionForm(formData: InspectionFormData, stage: 'initial' | 'final'): Promise<void> {
    const errors: string[] = []

    // Validaciones para la etapa inicial
    if (stage === 'initial') {
      if (!formData.guestName) errors.push('Nombre del invitado es requerido')
      if (!formData.guestEmail) errors.push('Email del invitado es requerido')
      if (!formData.propertyId) errors.push('Debe seleccionar una propiedad')
      if (!formData.cartType) errors.push('Debe seleccionar un tipo de carrito')
      if (!formData.damages || formData.damages.length === 0) {
        errors.push('Debe registrar al menos una marca o daño en el diagrama')
      }
    }

    // Validaciones para la etapa final (cliente)
    if (stage === 'final') {
      if (!formData.observations) errors.push('Debe agregar observaciones')
      if (!formData.signature) errors.push('Debe firmar el documento')
      if (!formData.termsAccepted) errors.push('Debe aceptar los términos')
    }

    if (errors.length > 0) {
      throw new Error(errors.join('. '))
    }
  }

  static async generatePrefillLink(formData: InspectionFormData): Promise<string> {
    await this.validateInspectionForm(formData, 'initial')

    const baseUrl = 'https://golfcartinspectiontest.netlify.app/new-inspection'
    const urlParams = new URLSearchParams({
      guestName: formData.guestName,
      guestEmail: formData.guestEmail,
      propertyId: formData.propertyId,
      cartType: formData.cartType,
      cartNumber: formData.cartNumber || ''
    })

    return `${baseUrl}?${urlParams.toString()}`
  }

  static async generatePrefilledPDF(formData: InspectionFormData): Promise<Blob> {
    await this.validateInspectionForm(formData, 'initial')

    const prefilledLink = await this.generatePrefillLink(formData)

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Inspección de Carrito de Golf</h1>
        <div class="info-section">
          <p><strong>Nombre:</strong> ${formData.guestName}</p>
          <p><strong>Email:</strong> ${formData.guestEmail}</p>
          <p><strong>Propiedad:</strong> ${formData.propertyId}</p>
          <p><strong>Tipo de Carrito:</strong> ${formData.cartType}</p>
        </div>
        <div class="link-section">
          <h2>Completar Inspección</h2>
          <p>Por favor, complete la inspección usando el siguiente enlace:</p>
          <a href="${prefilledLink}">${prefilledLink}</a>
        </div>
      </div>
    `

    const requestBody = {
      body: htmlTemplate,
      settings: {
        paper_size: 'A4',
        orientation: '1'
      }
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': sanitizedApiKey
      },
      body: JSON.stringify(requestBody)
    })

    const responseData = await response.json()

    if (responseData.status !== 'success') {
      throw new Error(`Error en la generación del PDF: ${responseData.message}`)
    }

    const pdfResponse = await fetch(responseData.download_url)
    const pdfData = await pdfResponse.arrayBuffer()
    
    return new Blob([pdfData], { type: 'application/pdf' })
  }

  static async generateFinalPDF(formData: InspectionFormData): Promise<Blob> {
    await this.validateInspectionForm(formData, 'final')

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Informe Final de Inspección de Carrito de Golf</h1>
        <div class="info-section">
          <p><strong>Nombre:</strong> ${formData.guestName}</p>
          <p><strong>Email:</strong> ${formData.guestEmail}</p>
          <p><strong>Propiedad:</strong> ${formData.propertyId}</p>
          <p><strong>Tipo de Carrito:</strong> ${formData.cartType}</p>
        </div>
        <div class="observations-section">
          <h2>Observaciones</h2>
          <p>${formData.observations || 'Sin observaciones'}</p>
        </div>
        <div class="signature-section">
          <h2>Firma</h2>
          <img src="${formData.signature}" alt="Firma" style="max-width: 300px;"/>
        </div>
        <div class="terms-section">
          <h2>Términos</h2>
          <p>Términos aceptados: ${formData.termsAccepted ? 'Sí' : 'No'}</p>
        </div>
      </div>
    `

    const requestBody = {
      body: htmlTemplate,
      settings: {
        paper_size: 'A4',
        orientation: '1'
      }
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': sanitizedApiKey
      },
      body: JSON.stringify(requestBody)
    })

    const responseData = await response.json()

    if (responseData.status !== 'success') {
      throw new Error(`Error en la generación del PDF final: ${responseData.message}`)
    }

    const pdfResponse = await fetch(responseData.download_url)
    const pdfData = await pdfResponse.arrayBuffer()
    
    return new Blob([pdfData], { type: 'application/pdf' })
  }

  static async downloadPDF(pdfBlob: Blob, filename: string = 'inspeccion_carrito_golf.pdf'): Promise<void> {
    try {
      // Estrategia de descarga específica para plataformas
      if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
        // Manejo especial para iOS Safari
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(pdfBlob)
        link.download = filename
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(link.href)
      } else {
        // Navegadores modernos
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(pdfBlob)
        link.download = filename
        link.click()
        window.URL.revokeObjectURL(link.href)
      }
    } catch (error) {
      console.error('Error de descarga de PDF:', error)
      throw new Error('No se pudo descargar el PDF. Por favor, intente de nuevo.')
    }
  }
}