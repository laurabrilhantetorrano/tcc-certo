import mongoose from 'mongoose';

/**
 * Repositório Base para operações genéricas de persistência no MongoDB
 * Implementa CRUD, paginação, filtros e ordenação reutilizáveis.
 */
export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  /**
   * Cria um novo registro
   */
  async create(data) {
    const document = new this.model(data);
    return await document.save();
  }

  /**
   * Busca um registro por ID (ObjectId do MongoDB)
   */
  async findById(id, populate = null) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    let query = this.model.findById(id);
    if (populate) {
      query = query.populate(populate);
    }
    return await query.exec();
  }

  /**
   * Busca um único registro que corresponda a um filtro
   */
  async findOne(filter = {}, populate = null) {
    let query = this.model.findOne(filter);
    if (populate) {
      query = query.populate(populate);
    }
    return await query.exec();
  }

  /**
   * Busca múltiplos registros com suporte a filtros, paginação, ordenação e projeção
   * @param {Object} filter - Critérios de filtro do MongoDB
   * @param {Object} options - { page, limit, sort, populate, select }
   */
  async find(filter = {}, options = {}) {
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(options.limit, 10) || 20));
    const skip = (page - 1) * limit;

    let query = this.model.find(filter);

    if (options.select) {
      query = query.select(options.select);
    }

    if (options.sort) {
      query = query.sort(options.sort);
    } else {
      query = query.sort({ createdAt: -1 }); // Padrão: mais recentes primeiro
    }

    query = query.skip(skip).limit(limit);

    if (options.populate) {
      query = query.populate(options.populate);
    }

    const [data, total] = await Promise.all([
      query.exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      },
    };
  }

  /**
   * Atualiza um registro por ID
   */
  async updateById(id, data, options = { new: true, runValidators: true }) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await this.model.findByIdAndUpdate(id, data, options).exec();
  }

  /**
   * Remove um registro por ID
   */
  async deleteById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await this.model.findByIdAndDelete(id).exec();
  }

  /**
   * Conta a quantidade de documentos conforme filtro
   */
  async count(filter = {}) {
    return await this.model.countDocuments(filter).exec();
  }

  /**
   * Verifica se existe algum documento com o filtro informado
   */
  async exists(filter = {}) {
    return await this.model.exists(filter).exec();
  }
}

export default BaseRepository;
