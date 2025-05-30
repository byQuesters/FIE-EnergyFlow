import prisma from "@/lib/db"
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const body = await req.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email y contraseña son requeridos'
      }, { status: 400 })
    }

    if (!email.endsWith('@ucol.mx')) {
      return NextResponse.json({
        success: false,
        message: 'Solo se permiten correos institucionales'
      }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ 
      where: { email } 
    })

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'El usuario ya existe'
      }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null
      }
    })

    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      success: true,
      message: 'Registro exitoso',
      user: userWithoutPassword
    }, { status: 201 })

  } catch (error) {
    console.error('Error en registro:', error)
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}
