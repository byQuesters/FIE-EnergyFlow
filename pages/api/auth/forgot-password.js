import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Configurar el transportador de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'tu-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'tu-contraseña-de-app',
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'El email es requerido' });
    }

    // Verificar que el email sea @ucol.mx
    if (!email.endsWith('@ucol.mx')) {
      return res.status(400).json({ 
        message: 'El email debe ser oficial de la Universidad de Colima (@ucol.mx)' 
      });
    }

    // Buscar el usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return res.status(200).json({ 
        message: 'Si el email existe, recibirás un código de recuperación' 
      });
    }

    // Generar código de 6 dígitos
    const resetCode = crypto.randomInt(100000, 999999).toString();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // Expira en 15 minutos

    // Guardar el código en la base de datos
    await prisma.user.update({
      where: { email },
      data: {
        resetCode,
        resetExpires,
      },
    });

    // Enviar email con el código
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@energyflow.com',
      to: email,
      subject: 'Código de recuperación - Energy Flow',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #6b8e4a 0%, #93ab6b 100%); padding: 40px 20px; text-align: center;">
                      <div style="font-size: 48px; margin-bottom: 10px;">⚡</div>
                      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Energy Flow</h1>
                      <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px;">Sistema de Monitoreo Energético FIE</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Recuperación de Contraseña</h2>
                      <p style="color: #4b5563; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                        Hemos recibido una solicitud para restablecer tu contraseña. Usa el siguiente código de verificación:
                      </p>
                      
                      <!-- Code Box -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 30px 0;">
                            <div style="background-color: #f3f4f6; border-radius: 12px; padding: 30px; display: inline-block;">
                              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Tu código de verificación</p>
                              <div style="font-size: 42px; font-weight: bold; color: #93ab6b; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                ${resetCode}
                              </div>
                            </div>
                          </td>
                        </tr>
                      </table>
                      
                      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
                        <p style="color: #92400e; margin: 0; font-size: 14px;">
                          ⚠️ <strong>Importante:</strong> Este código expira en 15 minutos.
                        </p>
                      </div>
                      
                      <p style="color: #6b7280; margin: 24px 0 0 0; font-size: 14px; line-height: 1.6;">
                        Si no solicitaste restablecer tu contraseña, puedes ignorar este mensaje de forma segura.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                        © ${new Date().getFullYear()} Energy Flow - Facultad de Ingeniería Eléctrica<br>
                        Universidad de Colima
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
        Energy Flow - Recuperación de Contraseña
        
        Tu código de verificación es: ${resetCode}
        
        Este código expira en 15 minutos.
        
        Si no solicitaste restablecer tu contraseña, ignora este mensaje.
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Email de recuperación enviado a:', email);
      
      return res.status(200).json({ 
        message: 'Código de recuperación enviado a tu email',
        success: true
      });
    } catch (emailError) {
      console.error('❌ Error enviando email:', emailError);
      
      // Limpiar el código si falla el envío
      await prisma.user.update({
        where: { email },
        data: {
          resetCode: null,
          resetExpires: null,
        },
      });
      
      return res.status(500).json({ 
        message: 'Error al enviar el email. Por favor intenta de nuevo.' 
      });
    }
  } catch (error) {
    console.error('Error en forgot-password:', error);
    return res.status(500).json({ 
      message: 'Error del servidor. Por favor intenta más tarde.' 
    });
  }
}
