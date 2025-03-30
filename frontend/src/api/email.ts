import { supabase } from '@/lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import { FormData } from '@/types/base-types'
import { sendInvitationEmail } from '@/api/sendInvitationEmail'
import html2pdf from 'html2pdf.js'

export const generateUniqueLink = async (formData: FormData) => {
  try {
    // Generar token único
    const token = uuidv4()

    // Guardar estado inicial del formulario
    const { error } = await supabase
      .from('inspection_links')
      .insert({
        token,
        initial_form_data: formData,
        status: 'pending',
        created_at: new Date().toISOString()
      })

    if (error) throw error

    // Generar enlace completo
    const baseUrl = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:5173'
    const uniqueLink = `${baseUrl}/complete-inspection/${token}`

    return {
      success: true,
      token,
      link: uniqueLink
    }
  } catch (error) {
    console.error('Error generando enlace único:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

export const submitInspection = async (formData: FormData) => {
  try {
    // Validar datos del formulario
    if (!formData.guestName || !formData.guestEmail) {
      throw new Error('Información de invitado incompleta')
    }

    // Generar enlace único
    const linkResult = await generateUniqueLink(formData)
    
    if (!linkResult.success) {
      throw new Error(linkResult.error)
    }

    // Enviar correo con enlace
    const emailResult = await sendInvitationEmail({
      email: formData.guestEmail,
      formData
    })

    if (!emailResult.success) {
      throw new Error(emailResult.message)
    }

    return { 
      success: true, 
      message: 'Invitación enviada exitosamente',
      data: linkResult
    }
  } catch (error) {
    console.error('Error en submitInspection:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

export const generateCompletedInspectionPDF = async (token: string, completedFormData: Partial<FormData>) => {
  try {
    // Buscar enlace original
    const { data, error: fetchError } = await supabase
      .from('inspection_links')
      .select('*')
      .eq('token', token)
      .single()

    if (fetchError) throw fetchError

    // Crear elemento temporal para generar PDF
    const pdfContainer = document.createElement('div')
    pdfContainer.innerHTML = `
      <div class="pdf-content">
        <h1>Informe de Inspección de Carrito de Golf</h1>
        
        <h2>Información Inicial</h2>
        <div class="section">
          <p><strong>Propiedad:</strong> ${data.initial_form_data.propertyId}</p>
          <p><strong>Tipo de Carrito:</strong> ${data.initial_form_data.cartType}</p>
          <p><strong>Número de Carrito:</strong> ${data.initial_form_data.cartNumber}</p>
        </div>

        <h2>Información del Invitado</h2>
        <div class="section">
          <p><strong>Nombre:</strong> ${completedFormData.guestName || data.initial_form_data.guestName}</p>
          <p><strong>Correo:</strong> ${completedFormData.guestEmail || data.initial_form_data.guestEmail}</p>
        </div>

        <h2>Observaciones</h2>
        <div class="section">
          <p>${completedFormData.observations || 'Sin observaciones adicionales'}</p>
        </div>

        <h2>Firma</h2>
        <div class="section signature">
          ${completedFormData.signature ? `<img src="${completedFormData.signature}" alt="Firma" />` : 'Sin firma'}
        </div>

        <div class="footer">
          <p>Fecha de completación: ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `

    // Opciones de generación de PDF
    const pdfOptions = {
      margin: [10, 10, 10, 10],
      filename: `inspeccion_carrito_${token}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true 
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' as const
      }
    }

    // Generar PDF
    const pdfBlob = await new Promise<Blob>((resolve, reject) => {
      const worker = html2pdf().from(pdfContainer).set(pdfOptions)
      
      // Usar método save para generar el PDF
      worker.save()
      
      // Capturar el PDF generado como blob
      const reader = new FileReader()
      reader.onloadend = () => {
        const blob = new Blob([reader.result as ArrayBuffer], { type: 'application/pdf' })
        resolve(blob)
      }
      reader.onerror = reject
    })

    // Subir PDF a Supabase Storage
    const pdfFileName = `inspection_${token}.pdf`
    const { error: uploadError } = await supabase.storage
      .from('inspection-pdfs')
      .upload(pdfFileName, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) throw uploadError

    // Obtener URL pública del PDF
    const { data: publicUrlData } = supabase.storage
      .from('inspection-pdfs')
      .getPublicUrl(pdfFileName)

    return {
      success: true,
      pdfUrl: publicUrlData.publicUrl,
      message: 'PDF generado y guardado exitosamente'
    }
  } catch (error) {
    console.error('Error generando PDF de inspección:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

export const completeInspection = async (token: string, completedFormData: Partial<FormData>) => {
  try {
    // Buscar enlace original
    const { data, error: fetchError } = await supabase
      .from('inspection_links')
      .select('*')
      .eq('token', token)
      .single()

    if (fetchError) throw fetchError

    // Verificar estado de la inspección
    if (data.status === 'completed') {
      throw new Error('Esta inspección ya ha sido completada')
    }

    // Generar PDF
    const pdfResult = await generateCompletedInspectionPDF(token, completedFormData)
    
    if (!pdfResult.success) {
      throw new Error(pdfResult.message)
    }

    // Actualizar estado del formulario
    const { error: updateError } = await supabase
      .from('inspection_links')
      .update({
        completed_form_data: completedFormData,
        status: 'completed',
        completed_at: new Date().toISOString(),
        pdf_url: pdfResult.pdfUrl
      })
      .eq('token', token)

    if (updateError) throw updateError

    return {
      success: true,
      message: 'Inspección completada exitosamente',
      pdfUrl: pdfResult.pdfUrl
    }
  } catch (error) {
    console.error('Error completando inspección:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}
