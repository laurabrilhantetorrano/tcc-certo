import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Regex para validação de formato de e-mail
 * Exatamente a mesma lógica de validação utilizada no componente frontend Cadastro.jsx
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Schema do Usuário
 * Representa os clientes e administradores da loja Nana & Mimi.
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'O nome de usuário é obrigatório.'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'O nome de usuário deve ter no mínimo 3 caracteres.'],
      maxlength: [30, 'O nome de usuário pode ter no máximo 30 caracteres.'],
    },
    email: {
      type: String,
      required: [true, 'O e-mail é obrigatório.'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [EMAIL_REGEX, 'Por favor, insira um e-mail válido (ex: nome@email.com).'],
    },
    senha: {
      type: String,
      required: [true, 'A senha é obrigatória.'],
      minlength: [6, 'A senha deve ter no mínimo 6 caracteres.'],
      select: false, // Por padrão não retorna a senha em consultas find()
    },
    nomeCompleto: {
      type: String,
      trim: true,
      default: '',
    },
    telefone: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: {
        values: ['cliente', 'admin'],
        message: '{VALUE} não é uma role permitida.',
      },
      default: 'cliente',
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.senha; // Garante que a senha nunca seja exposta em respostas JSON
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Hash de senha seguro com bcrypt antes de salvar
userSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * Método de instância para verificar se a senha informada confere com o hash
 */
userSchema.methods.compararSenha = async function (senhaCandidata) {
  return bcrypt.compare(senhaCandidata, this.senha);
};

// ==========================================
// ÍNDICES PARA OTIMIZAÇÃO E UNICIDADE
// ==========================================
// 1. Índice único em email para busca de login e integridade
userSchema.index({ email: 1 }, { unique: true, name: 'idx_user_email_unique' });

// 2. Índice único em username para unicidade e login
userSchema.index({ username: 1 }, { unique: true, name: 'idx_user_username_unique' });

export const User = mongoose.model('User', userSchema);
export default User;
