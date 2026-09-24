import test, { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/database.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { productRepository } from '../repositories/ProductRepository.js';
import { userRepository } from '../repositories/UserRepository.js';

describe('Testes de Integração de Persistência com MongoDB', () => {
  let isMongoAvailable = false;

  before(async () => {
    try {
      // Tenta conexão curta com o MongoDB
      await connectDB();
      isMongoAvailable = mongoose.connection.readyState === 1;
    } catch {
      console.log('⚠️ MongoDB local não detectado para testes de integração ativa. Teste será pulado.');
      isMongoAvailable = false;
    }
  });

  after(async () => {
    if (isMongoAvailable) {
      // Limpeza de documentos de teste
      try {
        await Product.deleteMany({ nome: /^\[TESTE\]/ });
        await User.deleteMany({ username: /^teste_/ });
      } catch {
        // Ignora erros de limpeza
      }
      await disconnectDB();
    }
  });

  it('deve realizar ciclo completo de CRUD de Produto (Criar, Consultar, Atualizar, Deletar)', async (t) => {
    if (!isMongoAvailable) {
      t.skip('MongoDB não conectado.');
      return;
    }

    // 1. Criar
    const produtoCriado = await productRepository.create({
      nome: '[TESTE] Vestido Princesa',
      descricao: 'Vestido de festa infantil para testes de persistência',
      preco: 120.0,
      categoria: 'Coleção Nana & Mimi',
      img: '/img/teste.png',
      estoque: 5,
    });

    assert.ok(produtoCriado._id, 'Deve gerar um _id de documento');
    assert.equal(produtoCriado.nome, '[TESTE] Vestido Princesa');
    assert.equal(produtoCriado.precoFormatado, 'R$ 120,00');

    // 2. Consultar
    const produtoConsultado = await productRepository.findById(produtoCriado._id);
    assert.ok(produtoConsultado, 'Deve encontrar o produto pelo ID');
    assert.equal(produtoConsultado.nome, '[TESTE] Vestido Princesa');

    // 3. Atualizar
    const produtoAtualizado = await productRepository.updateById(produtoCriado._id, {
      preco: 130.0,
      precoFormatado: 'R$ 130,00',
    });
    assert.equal(produtoAtualizado.preco, 130.0);

    // 4. Deletar
    const produtoRemovido = await productRepository.deleteById(produtoCriado._id);
    assert.ok(produtoRemovido, 'Deve retornar o documento removido');

    const produtoAposDelecao = await productRepository.findById(produtoCriado._id);
    assert.equal(produtoAposDelecao, null, 'Produto não deve mais existir após deleção');
  });

  it('deve garantir unicidade de email no modelo User', async (t) => {
    if (!isMongoAvailable) {
      t.skip('MongoDB não conectado.');
      return;
    }

    const emailUnico = `teste_${Date.now()}@exemplo.com`;

    await userRepository.create({
      username: `user_${Date.now()}`,
      email: emailUnico,
      senha: 'SenhaValida123!',
    });

    // Tentativa de duplicar o mesmo e-mail
    await assert.rejects(
      async () => {
        await userRepository.create({
          username: `outro_user_${Date.now()}`,
          email: emailUnico,
          senha: 'OutraSenha123!',
        });
      },
      (err) => {
        return err.code === 11000 || err.name === 'MongoServerError';
      },
      'Deveria rejeitar criação com e-mail duplicado'
    );
  });
});
