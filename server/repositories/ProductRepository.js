import mongoose from 'mongoose';
import { BaseRepository } from './BaseRepository.js';
import { Product } from '../models/Product.js';

/**
 * Repositório de Produtos
 * Encapsula todas as operações de persistência e consulta do catálogo.
 */
export class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  /**
   * Busca um produto por legacyId (ex: 1, 2, 3...) ou por _id do MongoDB
   */
  async findByIdOrLegacyId(identifier) {
    if (!identifier) return null;

    // Se for numérico, busca pelo legacyId
    const numericId = Number(identifier);
    if (!isNaN(numericId) && Number.isInteger(numericId)) {
      const prod = await this.model.findOne({ legacyId: numericId }).exec();
      if (prod) return prod;
    }

    // Se for um ObjectId válido do MongoDB
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      return await this.model.findById(identifier).exec();
    }

    return null;
  }

  /**
   * Busca produtos com múltiplos filtros (categoria, busca textual/regex, faixa de preço, etc.)
   */
  async findWithFilters(filters = {}, options = {}) {
    const mongoFilter = {};

    // Filtro por status ativo (padrão true se não especificado)
    if (typeof filters.ativo === 'boolean') {
      mongoFilter.ativo = filters.ativo;
    } else if (filters.ativo !== 'all') {
      mongoFilter.ativo = true;
    }

    // Filtro por categoria
    if (filters.categoria && filters.categoria.trim() !== '') {
      mongoFilter.categoria = filters.categoria.trim();
    }

    // Filtro por faixa de preço
    if (filters.precoMin != null || filters.precoMax != null) {
      mongoFilter.preco = {};
      if (filters.precoMin != null) {
        mongoFilter.preco.$gte = Number(filters.precoMin);
      }
      if (filters.precoMax != null) {
        mongoFilter.preco.$lte = Number(filters.precoMax);
      }
    }

    // Busca textual inteligente (compatível com a barra de pesquisa da loja)
    if (filters.busca && typeof filters.busca === 'string' && filters.busca.trim() !== '') {
      const termo = filters.busca.trim();
      mongoFilter.$or = [
        { nome: { $regex: termo, $options: 'i' } },
        { descricao: { $regex: termo, $options: 'i' } },
        { categoria: { $regex: termo, $options: 'i' } },
      ];
    }

    // Opções de ordenação
    let sortOption = { createdAt: -1 };
    if (options.sort) {
      if (options.sort === 'preco_asc') sortOption = { preco: 1 };
      else if (options.sort === 'preco_desc') sortOption = { preco: -1 };
      else if (options.sort === 'nome_asc') sortOption = { nome: 1 };
      else if (options.sort === 'nome_desc') sortOption = { nome: -1 };
      else if (options.sort === 'antigos') sortOption = { createdAt: 1 };
    }

    return await this.find(mongoFilter, {
      ...options,
      sort: sortOption,
    });
  }

  /**
   * Atualiza o estoque de um produto de forma atômica
   */
  async decrementStock(productId, quantity) {
    return await this.model.findOneAndUpdate(
      {
        _id: productId,
        estoque: { $gte: quantity }, // Garante que não fique negativo (concorrência)
      },
      {
        $inc: { estoque: -quantity },
      },
      { new: true }
    );
  }

  /**
   * Devolve itens ao estoque em caso de cancelamento
   */
  async incrementStock(productId, quantity) {
    return await this.model.findByIdAndUpdate(
      productId,
      { $inc: { estoque: quantity } },
      { new: true }
    );
  }
}

export const productRepository = new ProductRepository();
export default productRepository;
