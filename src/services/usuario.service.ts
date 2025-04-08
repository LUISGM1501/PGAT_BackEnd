// services/usuario.service.ts
import { UsuarioModel, IUsuario } from '../models/Usuario.model';

export class UsuarioService {
  // Obtener todos los usuarios
  static async getAllUsuarios(): Promise<IUsuario[]> {
    return await UsuarioModel.findAll();
  }

  // Obtener un usuario por ID
  static async getUsuarioById(id: number): Promise<IUsuario> {
    const usuario = await UsuarioModel.findById(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    return usuario;
  }

  // Crear un nuevo usuario
  static async createUsuario(data: IUsuario): Promise<IUsuario> {
    // Validar que se reciban los campos obligatorios
    if (!data.nombre || !data.correo || !data.password || !data.tipo) {
      throw new Error('Faltan datos obligatorios: nombre, correo, password y tipo');
    }
    return await UsuarioModel.create(data);
  }

  // Actualizar un usuario existente (actualización parcial)
  static async updateUsuario(id: number, data: Partial<IUsuario>): Promise<IUsuario> {
    const usuarioActualizado = await UsuarioModel.update(id, data);
    if (!usuarioActualizado) {
      throw new Error('Usuario no encontrado');
    }
    return usuarioActualizado;
  }

  // Eliminar un usuario
  static async deleteUsuario(id: number): Promise<void> {
    const eliminado = await UsuarioModel.delete(id);
    if (!eliminado) {
      throw new Error('Usuario no encontrado');
    }
  }
}