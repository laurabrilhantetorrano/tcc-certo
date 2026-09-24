import mongoose from 'mongoose';
import { BaseRepository } from './BaseRepository.js';
import { Order } from '../models/Order.js';

/**
 * Repositório de Pedidos
 * Gerencia persistência de pedidos realizados, histórico de compras e status.
 */
export class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  /**
   * Cria um novo pedido calculando subtotais e totais com precisão
   */
  async createOrder({ usuario, itens, enderecoEntrega, formaPagamento = 'pix', valorFrete = 0 }) {
    if (!Array.isArray(itens) || itens.length === 0) {
      throw new Error('O pedido deve conter ao menos um item.');
    }

    // Calcula subtotal a partir dos itens
    const itensProcessados = itens.map((item) => {
      const preco = Number(item.precoUnitario);
      const qtd = Number(item.quantidade) || 1;
      return {
        produto: new mongoose.Types.ObjectId(item.produto),
        nome: item.nome,
        precoUnitario: preco,
        quantidade: qtd,
        tamanho: item.tamanho || 'M',
        subtotal: Number((preco * qtd).toFixed(2)),
      };
    });

    const valorSubtotal = itensProcessados.reduce((acc, curr) => acc + curr.subtotal, 0);
    const frete = Number(valorFrete) || 0;
    const valorTotal = Number((valorSubtotal + frete).toFixed(2));

    const order = new this.model({
      usuario: new mongoose.Types.ObjectId(usuario),
      itens: itensProcessados,
      valorSubtotal,
      valorFrete: frete,
      valorTotal,
      enderecoEntrega,
      formaPagamento,
      status: 'pendente',
    });

    return await order.save();
  }

  /**
   * Lista todos os pedidos de um usuário com paginação
   */
  async findByUserId(userId, options = {}) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    }

    return await this.find(
      { usuario: new mongoose.Types.ObjectId(userId) },
      {
        ...options,
        sort: { createdAt: -1 },
        populate: 'itens.produto',
      }
    );
  }

  /**
   * Atualiza o status de um pedido
   */
  async updateStatus(orderId, status) {
    return await this.updateById(orderId, { status });
  }

  /**
   * Obtém os pedidos mais recentes do sistema
   */
  async findRecentOrders(limit = 10) {
    return await this.model
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('usuario', 'username email nomeCompleto')
      .exec();
  }
}

export const orderRepository = new OrderRepository();
export default orderRepository;
