import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { Cart } from '../models/Cart.js';
import { Contact } from '../models/Contact.js';

describe('Validação dos Schemas e Modelos do MongoDB (Mongoose)', () => {
  describe('Modelo: Product', () => {
    it('deve falhar na validação se campos obrigatórios estiverem ausentes', async () => {
      const prodInvalido = new Product({});
      const erro = prodInvalido.validateSync();

      assert.ok(erro, 'Deveria retornar erro de validação');
      assert.ok(erro.errors.nome, 'O campo "nome" deve ser obrigatório');
      assert.ok(erro.errors.preco, 'O campo "preco" deve ser obrigatório');
      assert.ok(erro.errors.descricao, 'O campo "descricao" deve ser obrigatório');
      assert.ok(erro.errors.img, 'O campo "img" deve ser obrigatório');
    });

    it('deve rejeitar produto com preço negativo', async () => {
      const prodPrecoNegativo = new Product({
        nome: 'Vestido Florido',
        descricao: 'Vestido infantil de algodão',
        preco: -10.5,
        categoria: 'Coleção Nana & Mimi',
        img: '/img/teste.png',
      });
      const erro = prodPrecoNegativo.validateSync();

      assert.ok(erro, 'Deveria retornar erro de validação');
      assert.ok(erro.errors.preco, 'Preço negativo deve ser rejeitado');
    });

    it('deve aplicar valores padrão corretamente (estoque, ativo, tamanhos)', () => {
      const prod = new Product({
        nome: 'Camisa Polo',
        descricao: 'Camisa infantil estilosa',
        preco: 49.9,
        categoria: 'Conforto & Estilo',
        img: '/img/polo.png',
      });

      assert.equal(prod.ativo, true);
      assert.equal(prod.estoque, 10);
      assert.deepEqual(prod.tamanhos, ['P', 'M', 'G']);
    });
  });

  describe('Modelo: User (Segurança e Validação)', () => {
    it('deve rejeitar e-mail com formato inválido', () => {
      const usuarioInvalido = new User({
        username: 'ana_clara',
        email: 'email_invalido_sem_arroba',
        senha: 'SenhaForte123!',
      });
      const erro = usuarioInvalido.validateSync();

      assert.ok(erro, 'Deveria retornar erro de validação');
      assert.ok(erro.errors.email, 'E-mail sem @ deve ser rejeitado');
    });

    it('deve aceitar e-mail válido compatível com a regex do frontend', () => {
      const usuario = new User({
        username: 'ellen_lopes',
        email: 'ellen.lopes@email.com',
        senha: 'SenhaForte123!',
      });
      const erro = usuario.validateSync();

      assert.equal(erro, undefined, 'E-mail válido não deve gerar erro');
      assert.equal(usuario.email, 'ellen.lopes@email.com');
    });

    it('deve exigir tamanho mínimo de 6 caracteres para a senha', () => {
      const usuarioSenhaCurta = new User({
        username: 'victor_g',
        email: 'victor@email.com',
        senha: '123',
      });
      const erro = usuarioSenhaCurta.validateSync();

      assert.ok(erro, 'Deveria retornar erro de validação');
      assert.ok(erro.errors.senha, 'Senha menor que 6 caracteres deve ser rejeitada');
    });

    it('nunca deve expor o campo "senha" ao serializar para toJSON()', () => {
      const usuario = new User({
        username: 'cliente_seguro',
        email: 'seguro@email.com',
        senha: 'SenhaSuperSecreta123!',
      });

      const json = usuario.toJSON();
      assert.equal(json.senha, undefined, 'A senha nunca deve estar presente no toJSON()');
      assert.ok(json.id, 'Deve conter a propriedade id');
    });
  });

  describe('Modelo: Order', () => {
    it('deve rejeitar pedido com carrinho vazio', () => {
      const pedidoVazio = new Order({
        usuario: '507f1f77bcf86cd799439011',
        itens: [],
        valorSubtotal: 0,
        valorTotal: 0,
      });
      const erro = pedidoVazio.validateSync();

      assert.ok(erro, 'Deveria retornar erro de validação');
      assert.ok(erro.errors.itens, 'Pedido vazio deve ser rejeitado');
    });

    it('deve validar valores mínimos para subtotal e total', () => {
      const pedido = new Order({
        usuario: '507f1f77bcf86cd799439011',
        itens: [
          {
            produto: '507f1f77bcf86cd799439012',
            nome: 'Camisa Social',
            precoUnitario: 59.9,
            quantidade: 1,
            subtotal: 59.9,
          },
        ],
        valorSubtotal: 59.9,
        valorFrete: 0,
        valorTotal: 59.9,
        status: 'pendente',
      });
      const erro = pedido.validateSync();

      assert.equal(erro, undefined, 'Pedido válido deve passar sem erros');
      assert.equal(pedido.status, 'pendente');
    });
  });

  describe('Modelo: Cart (Virtuals e Cálculos)', () => {
    it('deve calcular corretamente totalItens e subtotal com múltiplos itens', () => {
      const cart = new Cart({
        sessionId: 'sessao_12345',
        itens: [
          {
            produto: '507f1f77bcf86cd799439011',
            nome: 'Body + Corpete',
            precoUnitario: 105.0,
            quantidade: 2,
            tamanho: 'P',
          },
          {
            produto: '507f1f77bcf86cd799439012',
            nome: 'Camisa Social',
            precoUnitario: 59.9,
            quantidade: 1,
            tamanho: 'M',
          },
        ],
      });

      assert.equal(cart.totalItens, 3, 'Total de itens deve ser a soma das quantidades (2+1)');
      assert.equal(cart.subtotal, 105.0 * 2 + 59.9, 'Subtotal deve ser calculado corretamente');
    });
  });

  describe('Modelo: Contact', () => {
    it('deve validar obrigatoriedade de nome, email e mensagem', () => {
      const contatoIncompleto = new Contact({});
      const erro = contatoIncompleto.validateSync();

      assert.ok(erro, 'Deveria retornar erro');
      assert.ok(erro.errors.nome, 'Nome é obrigatório');
      assert.ok(erro.errors.email, 'E-mail é obrigatório');
      assert.ok(erro.errors.mensagem, 'Mensagem é obrigatória');
    });
  });
});
