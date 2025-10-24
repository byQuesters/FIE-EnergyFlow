import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Configurar CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Manejar preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ 
        message: 'Email, código y nueva contraseña son requeridos' 
      });
    }

    // Validar longitud de contraseña
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        message: 'La contraseña debe tener al menos 8 caracteres' 
      });
    }

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado' 
      });
    }

    // Verificar que exista un código
    if (!user.resetCode || !user.resetExpires) {
      return res.status(400).json({ 
        message: 'No hay solicitud de recuperación activa para este email' 
      });
    }

    // Verificar que el código no haya expirado
    if (new Date() > new Date(user.resetExpires)) {
      // Limpiar código expirado
      await prisma.user.update({
        where: { email },
        data: {
          resetCode: null,
          resetExpires: null,
        },
      });
      
      return res.status(400).json({ 
        message: 'El código de verificación ha expirado. Solicita uno nuevo.' 
      });
    }

    // Verificar que el código sea correcto
    if (user.resetCode !== code) {
      return res.status(400).json({ 
        message: 'Código de verificación incorrecto' 
      });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña y limpiar el código
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetExpires: null,
      },
    });

    console.log('✅ Contraseña restablecida para:', email);

    return res.status(200).json({ 
      message: 'Contraseña restablecida exitosamente',
      success: true
    });
  } catch (error) {
    console.error('Error en reset-password:', error);
    return res.status(500).json({ 
      message: 'Error del servidor. Por favor intenta más tarde.' 
    });
  }
}
