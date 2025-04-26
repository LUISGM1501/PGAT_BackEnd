// src/controllers/auth/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UsuarioModel } from '../../models/Usuario.model';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password, userType } = req.body;
    console.log(req.body);

    if (!username || !password || !userType) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    console.log('Intento de login:', { username, userType });

    // Buscar usuario por correo
    const user = await UsuarioModel.findByEmail(username);
    
    console.log('Usuario encontrado:', user ? 'Sí' : 'No');

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar si el tipo de usuario coincide
    if (user.tipo !== userType) {
      return res.status(401).json({ message: 'Tipo de usuario incorrecto' });
    }

    // PARA DESARROLLO: Acepta cualquier contraseña para facilitar pruebas
    // En producción, descomenta la siguiente sección
    /*
    // Verificar la contraseña con bcrypt
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }
    */
    
    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, tipo: user.tipo },
      process.env.JWT_SECRET as string || 'secreto_temporal',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    // Omitir password en la respuesta
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: 'Login exitoso',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error interno al iniciar sesión' });
  }
};

export const logout = (req: Request, res: Response) => {
    // No hay token ni sesión que destruir, así que solo respondemos
    res.status(200).json({ message: 'Logout exitoso' });
};
