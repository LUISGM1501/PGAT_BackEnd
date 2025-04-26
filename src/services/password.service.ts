// src/services/password.service.ts
import bcrypt from 'bcrypt';

export class PasswordService {
  private static readonly SALT_ROUNDS = 10;
  private static readonly DEV_MODE = true; // Cambiar a false en producción

  static async hashPassword(plainPassword: string): Promise<string> {
    console.log(`[PASSWORD-SERVICE] Generando hash para contraseña`);
    const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
    const hash = await bcrypt.hash(plainPassword, salt);
    console.log(`[PASSWORD-SERVICE] Hash generado exitosamente`);
    return hash;
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    console.log(`[PASSWORD-SERVICE] Verificando contraseña`);
    console.log(`[PASSWORD-SERVICE] Contraseña ingresada: ${plainPassword}`);
    console.log(`[PASSWORD-SERVICE] Hash almacenado: ${hashedPassword}`);

    // Intentar verificación con bcrypt primero
    try {
      if (hashedPassword.startsWith('$2b$') || hashedPassword.startsWith('$2a$')) {
        const bcryptMatch = await bcrypt.compare(plainPassword, hashedPassword);
        console.log(`[PASSWORD-SERVICE] Resultado verificación bcrypt: ${bcryptMatch}`);
        if (bcryptMatch) return true;
      } else {
        console.log(`[PASSWORD-SERVICE] Hash no es formato bcrypt, no se puede comparar con bcrypt`);
      }
    } catch (error) {
      console.error(`[PASSWORD-SERVICE] Error en verificación bcrypt:`, error);
    }

    // Verificación alternativa en modo desarrollo
    if (this.DEV_MODE) {
      // Verificar si las contraseñas coinciden en texto plano
      const plainMatch = plainPassword === hashedPassword;
      console.log(`[PASSWORD-SERVICE] Verificación texto plano (solo DEV): ${plainMatch}`);
      return plainMatch;
    }

    return false;
  }

  static async rehashPasswordIfNeeded(userId: number, plainPassword: string, hashedPassword: string): Promise<boolean> {
    // Si la contraseña está en texto plano o no es un hash bcrypt válido
    if (plainPassword === hashedPassword || (!hashedPassword.startsWith('$2b$') && !hashedPassword.startsWith('$2a$'))) {
      console.log(`[PASSWORD-SERVICE] Rehashing contraseña para usuario ID ${userId}`);
      
      try {
        const { UsuarioModel } = require('../models/Usuario.model');
        const newHash = await this.hashPassword(plainPassword);
        
        await UsuarioModel.update(userId, { password: newHash });
        console.log(`[PASSWORD-SERVICE] Contraseña rehashed exitosamente`);
        return true;
      } catch (error) {
        console.error(`[PASSWORD-SERVICE] Error en rehash:`, error);
        return false;
      }
    }
    return false;
  }
}