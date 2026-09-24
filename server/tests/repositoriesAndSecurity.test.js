import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { productRepository } from '../repositories/ProductRepository.js';
import { userRepository } from '../repositories/UserRepository.js';
import { sanitizeNoSql } from '../middlewares/sanitize.js';
import { errorHandler } from '../middlewares/errorHandler.js';

describe('Testes de Repositórios, Segurança e Tratamento de Erros', () => {
  describe('ProductRepository - Consultas e Resiliência', () => {
    it('deve retornar null para IDs inválidos sem gerar exceções', async () => {
      const resultadoIdInvalido = await productRepository.findByIdOrLegacyId('id_invalido_xyz');
      assert.equal(resultadoIdInvalido, null);

      const resultadoNull = await productRepository.findByIdOrLegacyId(null);
      assert.equal(resultadoNull, null);
    });
  });

  describe('UserRepository - Tratamento de Entradas', () => {
    it('deve retornar false para existsByEmail com valor nulo ou vazio', async () => {
      const existeNull = await userRepository.existsByEmail(null);
      assert.equal(existeNull, false);

      const existeVazio = await userRepository.existsByEmail('');
      assert.equal(existeVazio, false);
    });
  });

  describe('Segurança: Middleware sanitizeNoSql (Prevenção de NoSQL Injection)', () => {
    it('deve remover operadores NoSQL ($gt, $ne, $where) de bodies e queries', () => {
      const req = {
        body: {
          username: { $gt: '' }, // Tentativa clássica de bypass NoSQL
          email: 'usuario@valido.com',
          senha: '123456Senha!',
          nested: {
            $ne: null,
            valido: 'ok',
          },
        },
        query: {
          $where: 'sleep(1000)',
          categoria: 'Infantil',
        },
        params: {},
      };

      let nextChamado = false;
      sanitizeNoSql(req, {}, () => {
        nextChamado = true;
      });

      assert.equal(nextChamado, true, 'Deve chamar next()');
      assert.equal(req.body.username.$gt, undefined, 'Operador $gt deve ser removido');
      assert.equal(req.body.email, 'usuario@valido.com', 'Dados normais devem ser preservados');
      assert.equal(req.body.nested.$ne, undefined, 'Operador $ne aninhado deve ser removido');
      assert.equal(req.body.nested.valido, 'ok');
      assert.equal(req.query.$where, undefined, 'Operador $where na query deve ser removido');
      assert.equal(req.query.categoria, 'Infantil');
    });
  });

  describe('Tratamento de Erros: Middleware errorHandler', () => {
    it('deve formatar erro de chave única (MongoDB 11000) com status 409 e mensagem amigável', () => {
      const err = {
        code: 11000,
        keyPattern: { email: 1 },
      };

      let statusCode = 0;
      let jsonResponse = null;

      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (data) => {
              jsonResponse = data;
            },
          };
        },
      };

      errorHandler(err, { method: 'POST', originalUrl: '/api/auth/cadastro' }, res, () => {});

      assert.equal(statusCode, 409, 'Status code para duplicidade deve ser 409');
      assert.equal(jsonResponse.status, 'erro');
      assert.equal(jsonResponse.tipo, 'Duplicidade');
      assert.equal(jsonResponse.campo, 'email');
    });

    it('deve formatar erro CastError de ID inválido com status 400', () => {
      const err = {
        name: 'CastError',
        path: '_id',
        value: '123_invalido',
      };

      let statusCode = 0;
      let jsonResponse = null;

      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (data) => {
              jsonResponse = data;
            },
          };
        },
      };

      errorHandler(err, { method: 'GET', originalUrl: '/api/produtos/123_invalido' }, res, () => {});

      assert.equal(statusCode, 400, 'Status code para CastError deve ser 400');
      assert.equal(jsonResponse.status, 'erro');
      assert.equal(jsonResponse.tipo, 'IdentificadorInvalido');
    });
  });
});
