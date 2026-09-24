import mongoose from 'mongoose';
import { Product } from '../../models/Product.js';
import { User } from '../../models/User.js';
import { Order } from '../../models/Order.js';
import { Cart } from '../../models/Cart.js';
import { Contact } from '../../models/Contact.js';

export const name = '001_initial_schema';

/**
 * Criação e sincronização dos índices iniciais em todas as collections
 */
export async function up() {
  console.log(`[Migração ${name}] Sincronizando índices das coleções...`);

  await Promise.all([
    Product.syncIndexes(),
    User.syncIndexes(),
    Order.syncIndexes(),
    Cart.syncIndexes(),
    Contact.syncIndexes(),
  ]);

  console.log(`[Migração ${name}] Índices sincronizados com sucesso.`);
}

export async function down() {
  console.log(`[Migração ${name}] Revertendo migração inicial (sem alteração destrutiva)...`);
}
