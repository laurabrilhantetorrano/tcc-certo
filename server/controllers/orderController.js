import { orderRepository } from '../repositories/OrderRepository.js';
import { productRepository } from '../repositories/ProductRepository.js';

export const orderController = {
  /**
   * Cria um novo pedido
   * POST /api/pedidos
   */
  async create(req, res, next) {
    try {
      const { usuario, itens, enderecoEntrega, formaPagamento, valorFrete } = req.body;

      if (!usuario) {
        return res.status(400).json({
          status: 'erro',
          mensagem: 'O identificador do usuário é obrigatório para criar um pedido.',
        });
      }

      if (!Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({
          status: 'erro',
          mensagem: 'O pedido deve conter pelo menos um item.',
        });
      }

      // Validação de estoque para cada item
      for (const item of itens) {
        const prod = await productRepository.findById(item.produto);
        if (!prod) {
          return res.status(404).json({
            status: 'erro',
            mensagem: `Produto '${item.nome || item.produto}' não encontrado.`,
          });
        }
        if (prod.estoque < item.quantidade) {
          return res.status(400).json({
            status: 'erro',
            mensagem: `Estoque insuficiente para o produto '${prod.nome}'. Disponível: ${prod.estoque}`,
          });
        }
      }

      // Criação do pedido
      const novoPedido = await orderRepository.createOrder({
        usuario,
        itens,
        enderecoEntrega,
        formaPagamento,
        valorFrete: valorFrete || 0,
      });

      // Baixa atômica de estoque
      for (const item of itens) {
        await productRepository.decrementStock(item.produto, item.quantidade);
      }

      res.status(201).json({
        status: 'sucesso',
        mensagem: 'Pedido realizado com sucesso!',
        pedido: novoPedido,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lista os pedidos do usuário
   * GET /api/pedidos/usuario/:usuarioId
   */
  async getByUser(req, res, next) {
    try {
      const { usuarioId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const pedidos = await orderRepository.findByUserId(usuarioId, { page, limit });

      res.status(200).json({
        status: 'sucesso',
        ...pedidos,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Busca um pedido por ID
   * GET /api/pedidos/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const pedido = await orderRepository.findById(id, 'itens.produto usuario');

      if (!pedido) {
        return res.status(404).json({
          status: 'erro',
          mensagem: 'Pedido não encontrado.',
        });
      }

      res.status(200).json({
        status: 'sucesso',
        pedido,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default orderController;
