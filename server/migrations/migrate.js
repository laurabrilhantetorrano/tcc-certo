import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/database.js';
import * as migration001 from './scripts/001_initial_schema.js';
import * as migration002 from './scripts/002_add_product_slugs_and_formatting.js';

dotenv.config();

// Schema para controle de migrações executadas
const migrationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  appliedAt: { type: Date, default: Date.now },
});

const MigrationRecord = mongoose.model('_migrations', migrationSchema);

const allMigrations = [migration001, migration002];

async function runMigrations() {
  console.log('==================================================');
  console.log('🚀 Executando Migrações no MongoDB...');
  console.log('==================================================');

  try {
    await connectDB();

    for (const mig of allMigrations) {
      const alreadyApplied = await MigrationRecord.findOne({ name: mig.name });

      if (alreadyApplied) {
        console.log(`⏩ [${mig.name}] Já executada em ${alreadyApplied.appliedAt.toISOString()}`);
        continue;
      }

      console.log(`⚙️ Executando migração: [${mig.name}]...`);
      await mig.up();

      await MigrationRecord.create({ name: mig.name });
      console.log(`✅ [${mig.name}] Concluída e registrada com sucesso.`);
    }

    console.log('\n==================================================');
    console.log('🎉 Todas as migrações foram aplicadas com sucesso!');
    console.log('==================================================');
  } catch (error) {
    console.error('❌ Erro na execução das migrações:', error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

runMigrations();
