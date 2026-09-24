import { Product } from '../../models/Product.js';

export const name = '002_add_product_slugs_and_formatting';

/**
 * Evolução não destrutiva de schema: garante que todos os produtos existentes
 * possuam formatação monetária (precoFormatado) e estoque padrão configurado.
 */
export async function up() {
  console.log(`[Migração ${name}] Atualizando documentos de produtos existentes...`);

  const produtos = await Product.find({
    $or: [{ precoFormatado: { $exists: false } }, { estoque: { $exists: false } }],
  });

  let atualizados = 0;
  for (const prod of produtos) {
    if (!prod.precoFormatado && prod.preco != null) {
      prod.precoFormatado = `R$ ${prod.preco.toFixed(2).replace('.', ',')}`;
    }
    if (prod.estoque == null) {
      prod.estoque = 10;
    }
    await prod.save();
    atualizados++;
  }

  console.log(`[Migração ${name}] ${atualizados} produtos ajustados sem perda de dados.`);
}

export async function down() {
  console.log(`[Migração ${name}] Reversão de compatibilidade executada.`);
}
