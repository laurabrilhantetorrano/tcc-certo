import { productRepository } from '../repositories/ProductRepository.js';

export const productController = {
  /**
   * Lista produtos com filtros, busca e paginação
   * GET /api/produtos
   */
  async getAll(req, res, next) {
    try {
      const {
        categoria,
        busca,
        precoMin,
        precoMax,
        ativo,
        page = 1,
        limit = 20,
        sort = 'recentes',
      } = req.query;

      const result = await productRepository.findWithFilters(
        { categoria, busca, precoMin, precoMax, ativo },
        { page, limit, sort }
      );

      res.status(200).json({
        status: 'sucesso',
        total: result.pagination.total,
        page: result.pagination.page,
        totalPages: result.pagination.totalPages,
        produtos: result.data,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtém um produto pelo ID (ObjectId ou legacyId 1-8)
   * GET /api/produtos/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const produto = await productRepository.findByIdOrLegacyId(id);

      if (!produto) {
        return res.status(404).json({
          status: 'erro',
          mensagem: 'Produto não encontrado.',
        });
      }

      res.status(200).json({
        status: 'sucesso',
        produto,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cria um novo produto
   * POST /api/produtos
   */
  async create(req, res, next) {
    try {
      const { nome, descricao, preco, precoAntigo, categoria, img, tamanhos, estoque } = req.body;

      const novoProduto = await productRepository.create({
        nome,
        descricao,
        preco: Number(preco),
        precoAntigo: precoAntigo ? Number(precoAntigo) : null,
        categoria,
        img,
        tamanhos: tamanhos || ['P', 'M', 'G'],
        estoque: estoque != null ? Number(estoque) : 10,
      });

      res.status(201).json({
        status: 'sucesso',
        mensagem: 'Produto cadastrado com sucesso.',
        produto: novoProduto,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Atualiza um produto existente
   * PUT /api/produtos/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const produto = await productRepository.findByIdOrLegacyId(id);

      if (!produto) {
        return res.status(404).json({
          status: 'erro',
          mensagem: 'Produto não encontrado para atualização.',
        });
      }

      const atualizado = await productRepository.updateById(produto._id, req.body);

      res.status(200).json({
        status: 'sucesso',
        mensagem: 'Produto atualizado com sucesso.',
        produto: atualizado,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remove um produto pelo ID
   * DELETE /api/produtos/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const produto = await productRepository.findByIdOrLegacyId(id);

      if (!produto) {
        return res.status(404).json({
          status: 'erro',
          mensagem: 'Produto não encontrado.',
        });
      }

      await productRepository.deleteById(produto._id);

      res.status(200).json({
        status: 'sucesso',
        mensagem: 'Produto removido com sucesso.',
      });
    } catch (error) {
      next(error);
    }
  },
};

export default productController;
