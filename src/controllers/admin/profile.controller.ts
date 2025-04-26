// src/controllers/admin/profile.controller.ts
import { Request, Response } from 'express';
import { UsuarioModel } from '../../models/Usuario.model';
import { PasswordService } from '../../services/password.service';

/**
 * Obtiene el perfil del usuario actual
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // Obtener el ID del usuario desde el token JWT
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }
    
    // Obtener información del usuario
    const user = await UsuarioModel.findById(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }
    
    // Eliminar datos sensibles
    const { password, ...userWithoutPassword } = user;
    
    res.status(200).json({
      success: true,
      data: {
        name: user.nombre,
        email: user.correo,
        // Otros campos que quieras incluir
      },
      message: 'Perfil obtenido correctamente'
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el perfil'
    });
  }
};

/**
 * Actualiza el perfil del usuario actual
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // Obtener el ID del usuario desde el token JWT
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }
    
    const { name, email, phone } = req.body;
    
    // Validar correo institucional
    if (email) {
      const emailRegex = /@(estudiantec\.cr|itcr\.ac\.cr)$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Debe utilizar un correo institucional válido'
        });
        return;
      }
    }
    
    // Preparar datos para actualizar
    const updateData: any = {};
    if (name) updateData.nombre = name;
    if (email) updateData.correo = email;
    
    // Actualizar usuario
    const updatedUser = await UsuarioModel.update(userId, updateData);
    
    if (!updatedUser) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el perfil'
      });
      return;
    }
    
    // Eliminar datos sensibles
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.status(200).json({
      success: true,
      data: {
        name: updatedUser.nombre,
        email: updatedUser.correo,
        // Otros campos actualizados
      },
      message: 'Perfil actualizado correctamente'
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el perfil'
    });
  }
};

/**
 * Cambia la contraseña del usuario actual
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    // Obtener el ID del usuario desde el token JWT
    const userId = req.user?.id;
    console.log(`[PROFILE] Solicitud de cambio de contraseña para usuario ID: ${userId}`);
    
    if (!userId) {
      console.log('Usuario no autenticado');
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }
    
    const { currentPassword, newPassword } = req.body;
    console.log('Contraseñas recibidas:', { currentPassword, newPassword });
    
    // Validar campos
    if (!currentPassword || !newPassword) {
      console.log('Faltan contraseñas para validar');
      res.status(400).json({
        success: false,
        message: 'Debe proporcionar la contraseña actual y la nueva'
      });
      return;
    }
    
    // Obtener usuario
    const user = await UsuarioModel.findById(userId);
    console.log('Usuario encontrado:', user);
    
    if (!user) {
      console.log(`[PROFILE] Usuario no encontrado: ${userId}`);
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }
    
    // Verificar contraseña actual
    const passwordMatch = await PasswordService.verifyPassword(currentPassword, user.password);
    console.log(`[PROFILE] Verificación de contraseña actual: ${passwordMatch}`);
    
    if (!passwordMatch) {
      console.log('La contraseña actual es incorrecta');
      res.status(400).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
      return;
    }
    
    // Validar nueva contraseña
    if (newPassword.length < 3) {
      console.log('La nueva contraseña es demasiado corta');
      res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 3 caracteres'
      });
      return;
    }
    
    // Generar y guardar el nuevo hash
    const hashedPassword = await PasswordService.hashPassword(newPassword);
    
    // Actualizar la contraseña
    await UsuarioModel.update(userId, { password: hashedPassword });
    console.log(`[PROFILE] Contraseña actualizada exitosamente para usuario ID: ${userId}`);
    
    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.error('[PROFILE] Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al cambiar la contraseña'
    });
  }
};