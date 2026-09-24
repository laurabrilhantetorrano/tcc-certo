import mongoose from 'mongoose';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Schema de Mensagens de Contato
 * Armazena as mensagens e dúvidas enviadas pelos clientes (página Contato).
 */
const contactSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'O nome é obrigatório.'],
      trim: true,
      minlength: [2, 'O nome deve ter no mínimo 2 caracteres.'],
      maxlength: [100, 'O nome pode ter no máximo 100 caracteres.'],
    },
    email: {
      type: String,
      required: [true, 'O e-mail é obrigatório.'],
      trim: true,
      lowercase: true,
      match: [EMAIL_REGEX, 'Por favor, insira um e-mail válido.'],
    },
    telefone: {
      type: String,
      trim: true,
      default: '',
    },
    assunto: {
      type: String,
      trim: true,
      default: 'Dúvida Geral',
      maxlength: [150, 'O assunto pode ter no máximo 150 caracteres.'],
    },
    mensagem: {
      type: String,
      required: [true, 'A mensagem é obrigatória.'],
      trim: true,
      minlength: [5, 'A mensagem deve ter no mínimo 5 caracteres.'],
      maxlength: [2000, 'A mensagem pode ter no máximo 2000 caracteres.'],
    },
    respondida: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Índice para busca de mensagens pendentes por data
contactSchema.index({ respondida: 1, createdAt: -1 }, { name: 'idx_contact_pending_date' });

export const Contact = mongoose.model('Contact', contactSchema);
export default Contact;
