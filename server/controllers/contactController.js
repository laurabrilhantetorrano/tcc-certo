import { contactRepository } from '../repositories/ContactRepository.js';

export const contactController = {
  /**
   * Envia uma nova mensagem de contato
   * POST /api/contato
   */
  async submit(req, res, next) {
    try {
      const { nome, email, telefone, assunto, mensagem } = req.body;

      if (!nome || !email || !mensagem) {
        return res.status(400).json({
          status: 'erro',
          mensagem: 'Nome, e-mail e mensagem são obrigatórios.',
        });
      }

      const novoContato = await contactRepository.create({
        nome,
        email,
        telefone: telefone || '',
        assunto: assunto || 'Dúvida Geral',
        mensagem,
      });

      res.status(201).json({
        status: 'sucesso',
        mensagem: 'Mensagem de contato enviada com sucesso! Em breve retornaremos.',
        contato: novoContato,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lista mensagens de contato recebidas
   * GET /api/contato
   */
  async list(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await contactRepository.find({}, { page, limit });

      res.status(200).json({
        status: 'sucesso',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default contactController;
