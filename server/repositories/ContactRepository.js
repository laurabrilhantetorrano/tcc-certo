import { BaseRepository } from './BaseRepository.js';
import { Contact } from '../models/Contact.js';

/**
 * Repositório de Mensagens de Contato
 */
export class ContactRepository extends BaseRepository {
  constructor() {
    super(Contact);
  }

  /**
   * Busca mensagens ainda não respondidas
   */
  async findPending(options = {}) {
    return await this.find({ respondida: false }, { ...options, sort: { createdAt: 1 } });
  }

  /**
   * Marca uma mensagem como respondida
   */
  async markAsAnswered(id) {
    return await this.updateById(id, { respondida: true });
  }
}

export const contactRepository = new ContactRepository();
export default contactRepository;
