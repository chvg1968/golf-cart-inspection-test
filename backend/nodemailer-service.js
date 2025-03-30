import nodemailer from 'nodemailer'

// Configuración de transporte de prueba
const transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
})

export async function sendInspectionLinkEmail(to, link, guestName, propertyName) {
  try {
    const mailOptions = {
      from: 'noreply@golfcartinspection.com',
      to: to,
      subject: `Formulario de Inspección de Carrito de Golf - ${propertyName || 'Propiedad'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Invitación a Completar Inspección de Carrito de Golf</h2>
          <p>Estimado/a ${guestName},</p>
          <p>Ha sido invitado a completar un formulario de inspección de carrito de golf.</p>
          <p>Por favor, haga clic en el siguiente enlace para continuar:</p>
          <p style="text-align: center;">
            <a href="${link}" style="
              display: inline-block; 
              background-color: #4CAF50; 
              color: white; 
              padding: 10px 20px; 
              text-decoration: none; 
              border-radius: 5px;">
              Completar Formulario de Inspección
            </a>
          </p>
          <p>Este enlace es válido por 24 horas.</p>
          <p>Si no ha solicitado esta inspección, por favor ignore este correo.</p>
          <p>Saludos cordiales,<br>Equipo de Inspección de Carrito de Golf</p>
        </div>
      `
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Correo enviado. ID:', info.messageId)
    return info
  } catch (error) {
    console.error('Error enviando correo:', error)
    throw error
  }
}
