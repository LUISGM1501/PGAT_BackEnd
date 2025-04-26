// src/controllers/auth/authController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UsuarioModel } from '../../models/Usuario.model';
import { PasswordService } from '../../services/password.service';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password, userType } = req.body;
    console.log(`[AUTH] Intento de login para: ${username}, tipo: ${userType}`);

    if (!username || !password || !userType) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    // Buscar usuario por correo
    const user = await UsuarioModel.findByEmail(username);
    console.log(`[AUTH] Usuario encontrado: ${user ? 'Sí' : 'No'}`);

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar tipo de usuario
    if (user.tipo !== userType) {
      console.log(`[AUTH] Tipo de usuario incorrecto. Esperado: ${userType}, Actual: ${user.tipo}`);
      return res.status(401).json({ message: 'Tipo de usuario incorrecto' });
    }

    // Verificar la contraseña usando el servicio
    const passwordMatches = await PasswordService.verifyPassword(password, user.password);
    console.log(`[AUTH] Resultado de verificación de contraseña: ${passwordMatches}`);

    if (!passwordMatches) {
      console.log(`[AUTH] Contraseña incorrecta para usuario: ${username}`);
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }
    
    // Rehash si es necesario
    await PasswordService.rehashPasswordIfNeeded(user.id as number, password, user.password);

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, tipo: user.tipo },
      process.env.JWT_SECRET as string || 'secreto_temporal',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );
    console.log(`[AUTH] Token generado exitosamente para usuario: ${username}`);
    
    // Actualizar último acceso
    await UsuarioModel.update(user.id as number, { ultimo_acceso: new Date() });

    // Omitir password en la respuesta
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: 'Login exitoso',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('[AUTH] Error en login:', error);
    return res.status(500).json({ message: 'Error interno al iniciar sesión' });
  }
};

export const logout = (req: Request, res: Response) => {
    // No hay token ni sesión que destruir, así que solo respondemos
    res.status(200).json({ message: 'Logout exitoso' });
};
