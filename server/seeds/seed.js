import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/database.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Contact } from '../models/Contact.js';
import { initialProducts } from './data/initialProducts.js';

dotenv.config();

/**
 * Script de inicialização (Seed) do banco de dados MongoDB
 * Execução idempotente: atualiza registros existentes sem duplicar.
 */
async function runSeed() {
  console.log('==================================================');
  console.log('🌱 Iniciando processo de SEED no MongoDB...');
  console.log('==================================================');

  try {
    await connectDB();

    // 1. SEED DE PRODUTOS
    console.log('\n📦 Processando produtos do catálogo...');
    let produtosCriados = 0;
    let produtosAtualizados = 0;

    for (const prodData of initialProducts) {
      const existing = await Product.findOne({ legacyId: prodData.legacyId });
      if (existing) {
        await Product.updateOne({ legacyId: prodData.legacyId }, { $set: prodData });
        produtosAtualizados++;
      } else {
        await Product.create(prodData);
        produtosCriados++;
      }
    }
    console.log(`✅ Produtos: ${produtosCriados} criados, ${produtosAtualizados} atualizados.`);

    // 2. SEED DE USUÁRIO ADMINISTRADOR (Exemplo/Teste)
    console.log('\n👤 Processando usuários de teste...');
    const adminEmail = 'admin@nanaemimi.com.br';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      await User.create({
        username: 'admin_nana',
        email: adminEmail,
        senha: 'AdminPassword123!',
        nomeCompleto: 'Administrador Nana & Mimi',
        telefone: '(19) 99572-9704',
        role: 'admin',
      });
      console.log(`✅ Usuário administrador criado: ${adminEmail} (senha: AdminPassword123!)`);
    } else {
      console.log(`ℹ️ Usuário administrador já existe: ${adminEmail}`);
    }

    // 3. SEED DE USUÁRIO CLIENTE (Exemplo/Teste)
    const clienteEmail = 'cliente@exemplo.com.br';
    const clienteExists = await User.findOne({ email: clienteEmail });

    if (!clienteExists) {
      await User.create({
        username: 'cliente_teste',
        email: clienteEmail,
        senha: 'ClientePassword123!',
        nomeCompleto: 'Maria Silva',
        telefone: '(19) 98888-7777',
        role: 'cliente',
      });
      console.log(`✅ Usuário cliente criado: ${clienteEmail} (senha: ClientePassword123!)`);
    } else {
      console.log(`ℹ️ Usuário cliente já existe: ${clienteEmail}`);
    }

    // 4. SEED DE MENSAGEM DE CONTATO (Exemplo)
    const contactCount = await Contact.countDocuments();
    if (contactCount === 0) {
      await Contact.create({
        nome: 'Camila Santos',
        email: 'camila.santos@email.com',
        telefone: '(19) 97777-6666',
        assunto: 'Dúvida sobre tamanhos de pijama infantil',
        mensagem: 'Olá! Gostaria de saber se o pijama de sereia tamanho 6 veste bem uma criança de 5 anos.',
        respondida: false,
      });
      console.log('✅ Mensagem de contato inicial inserida.');
    }

    console.log('\n==================================================');
    console.log('🎉 Seed concluído com sucesso!');
    console.log('==================================================');
  } catch (error) {
    console.error('❌ Erro durante a execução do seed:', error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

runSeed();
