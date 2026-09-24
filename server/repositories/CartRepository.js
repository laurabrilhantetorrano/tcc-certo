import mongoose from 'mongoose';
import { BaseRepository } from './BaseRepository.js';
import { Cart } from '../models/Cart.js';

/**
 * Repositório de Carrinho de Compras
 */
export class CartRepository extends BaseRepository {
  constructor() {
    super(Cart);
  }

  /**
   * Obtém ou cria o carrinho ativo do usuário ou sessão
   */
  async getOrCreateCart({ userId = null, sessionId = null }) {
    const filter = { status: 'ativo' };
    if (userId) {
      filter.usuario = userId;
    } else if (sessionId) {
      filter.sessionId = sessionId;
    } else {
      throw new Error('É necessário fornecer userId ou sessionId para o carrinho.');
    }

    let cart = await this.model.findOne(filter).populate('itens.produto').exec();

    if (!cart) {
      cart = await this.model.create({
        usuario: userId || undefined,
        sessionId: sessionId || undefined,
        itens: [],
        status: 'ativo',
      });
    }

    return cart;
  }

  /**
   * Adiciona um item ao carrinho
   */
  async addItem({ userId, sessionId }, item) {
    const cart = await this.getOrCreateCart({ userId, sessionId });

    const produtoObjectId = new mongoose.Types.ObjectId(item.produto);
    const tamanho = item.tamanho || 'M';
    const quantidade = Number(item.quantidade) || 1;

    const existingIndex = cart.itens.findIndex(
      (i) => i.produto.toString() === produtoObjectId.toString() && i.tamanho === tamanho
    );

    if (existingIndex > -1) {
      cart.itens[existingIndex].quantidade += quantidade;
    } else {
      cart.itens.push({
        produto: produtoObjectId,
        nome: item.nome,
        img: item.img,
        tamanho,
        quantidade,
        precoUnitario: item.precoUnitario,
      });
    }

    await cart.save();
    return await this.model.findById(cart._id).populate('itens.produto').exec();
  }

  /**
   * Remove item do carrinho
   */
  async removeItem({ userId, sessionId }, produtoId, tamanho) {
    const cart = await this.getOrCreateCart({ userId, sessionId });

    cart.itens = cart.itens.filter((item) => {
      const matchProduto = item.produto.toString() === produtoId.toString();
      const matchTamanho = !tamanho || item.tamanho === tamanho;
      return !(matchProduto && matchTamanho);
    });

    await cart.save();
    return cart;
  }

  /**
   * Esvazia todos os itens do carrinho
   */
  async clearCart({ userId, sessionId }) {
    const cart = await this.getOrCreateCart({ userId, sessionId });
    cart.itens = [];
    await cart.save();
    return cart;
  }
}

export const cartRepository = new CartRepository();
export default cartRepository;
