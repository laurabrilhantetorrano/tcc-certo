import { BaseRepository } from './BaseRepository.js';
import { User } from '../models/User.js';

/**
 * Repositório de Usuários
 * Gerencia persistência, autenticação segura e busca de contas.
 */
export class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  /**
   * Busca um usuário pelo e-mail
   */
  async findByEmail(email, includePassword = false) {
    if (!email) return null;
    let query = this.model.findOne({ email: email.toLowerCase().trim() });
    if (includePassword) {
      query = query.select('+senha');
    }
    return await query.exec();
  }

  /**
   * Busca um usuário pelo username
   */
  async findByUsername(username, includePassword = false) {
    if (!username) return null;
    let query = this.model.findOne({ username: username.toLowerCase().trim() });
    if (includePassword) {
      query = query.select('+senha');
    }
    return await query.exec();
  }

  /**
   * Busca usuário por username OU email (para formulário de login flexível)
   */
  async findByIdentifier(identifier, includePassword = false) {
    if (!identifier) return null;
    const cleanId = identifier.toLowerCase().trim();
    let query = this.model.findOne({
      $or: [{ email: cleanId }, { username: cleanId }],
    });
    if (includePassword) {
      query = query.select('+senha');
    }
    return await query.exec();
  }

  /**
   * Verifica se já existe um usuário com o e-mail informado
   */
  async existsByEmail(email) {
    if (!email) return false;
    return await this.exists({ email: email.toLowerCase().trim() });
  }

  /**
   * Verifica se já existe um usuário com o username informado
   */
  async existsByUsername(username) {
    if (!username) return false;
    return await this.exists({ username: username.toLowerCase().trim() });
  }
}

export const userRepository = new UserRepository();
export default userRepository;
