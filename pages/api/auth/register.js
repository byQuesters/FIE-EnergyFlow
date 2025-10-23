import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { email, password, name } = req.body;

    // Validar datos requeridos
    if (!email || !password || !name) {
      return res.status(400).json({ 
        message: 'Email, contraseña y nombre son requeridos' 
      });
    }

    // Validar formato de email - debe ser @ucol.mx
    const emailRegex = /^[^\s@]+@ucol\.mx$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'El email debe ser de la Universidad de Colima (@ucol.mx)' 
      });
    }

    // Validar longitud de contraseña - mínimo 8 caracteres
    if (password.length < 8) {
      return res.status(400).json({ 
        message: 'La contraseña debe tener al menos 8 caracteres' 
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ 
        message: 'Este email ya está registrado' 
      });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        id: `user_${Date.now()}`,
        email,
        password: hashedPassword,
        name,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      }
    });

    return res.status(201).json({
      message: 'Usuario creado exitosamente',
      user
    });

  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
}
