import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Função utilitária para mascarar credenciais da URI nos logs
 * Garante que senhas de conexão nunca sejam expostas.
 */
function maskMongoUri(uri) {
  try {
    return uri.replace(/\/\/(.*?)@/, '//***:***@');
  } catch {
    return 'mongodb://[uri_mascarada]';
  }
}

let isConnecting = false;

/**
 * Conecta ao banco de dados MongoDB com tratamento de erros e reconexão.
 * Reutiliza conexão existente para evitar criação excessiva de pools.
 */
export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    // 1 = connected
    return mongoose.connection;
  }

  if (isConnecting) {
    // Evita chamadas concorrentes de conexão simultânea
    return new Promise((resolve, reject) => {
      mongoose.connection.once('connected', () => resolve(mongoose.connection));
      mongoose.connection.once('error', (err) => reject(err));
    });
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nana_e_mimi';
  const maskedUri = maskMongoUri(mongoUri);

  try {
    isConnecting = true;

    // Configurações recomendadas para resiliência no MongoDB
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout de seleção de servidor rápido
      connectTimeoutMS: 10000,
      maxPoolSize: 10, // Gerenciamento do pool de conexões
      minPoolSize: 2,
    };

    mongoose.connection.on('connected', () => {
      console.log(`[MongoDB] Conectado com sucesso em: ${maskedUri}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Erro na conexão:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Conexão perdida. Tentando reconectar...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[MongoDB] Reconectado com sucesso.');
    });

    await mongoose.connect(mongoUri, options);
    isConnecting = false;
    return mongoose.connection;
  } catch (error) {
    isConnecting = false;
    console.error(`[MongoDB] Falha crítica ao conectar com ${maskedUri}:`, error.message);
    throw error;
  }
}

/**
 * Encerra a conexão com o MongoDB de forma graciosa.
 */
export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    // 0 = disconnected
    await mongoose.disconnect();
    console.log('[MongoDB] Conexão encerrada com sucesso.');
  }
}

/**
 * Retorna o status atual da conexão
 */
export function getConnectionStatus() {
  const states = {
    0: 'Desconectado',
    1: 'Conectado',
    2: 'Conectando',
    3: 'Desconectando',
  };
  return states[mongoose.connection.readyState] || 'Desconhecido';
}

// Fechamento gracioso em caso de término do processo Node.js
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});
