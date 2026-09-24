import mongoose from 'mongoose';

/**
 * Schema do Produto
 * Representa os itens de vestuário e produtos da loja Nana & Mimi.
 */
const productSchema = new mongoose.Schema(
  {
    legacyId: {
      type: Number,
      unique: true,
      sparse: true,
      index: true,
      description: 'Identificador numérico legado para compatibilidade com links existentes (/produto/:id)',
    },
    nome: {
      type: String,
      required: [true, 'O nome do produto é obrigatório.'],
      trim: true,
      minlength: [2, 'O nome deve ter no mínimo 2 caracteres.'],
      maxlength: [120, 'O nome pode ter no máximo 120 caracteres.'],
    },
    descricao: {
      type: String,
      required: [true, 'A descrição do produto é obrigatória.'],
      trim: true,
      maxlength: [1000, 'A descrição pode ter no máximo 1000 caracteres.'],
    },
    preco: {
      type: Number,
      required: [true, 'O preço do produto é obrigatório.'],
      min: [0, 'O preço não pode ser negativo.'],
    },
    precoAntigo: {
      type: Number,
      min: [0, 'O preço antigo não pode ser negativo.'],
      default: null,
    },
    precoFormatado: {
      type: String,
      trim: true,
      description: 'Representação formatada em moeda brasileira (ex: R$ 105,00)',
    },
    precoAntigoFormatado: {
      type: String,
      trim: true,
      default: null,
    },
    categoria: {
      type: String,
      required: [true, 'A categoria é obrigatória.'],
      trim: true,
      enum: {
        values: [
          'Coleção Nana & Mimi',
          'Conforto & Estilo',
          'Bebê',
          'Infantil',
          'Moda Feminina',
          'Pijamas',
          'Geral',
        ],
        message: '{VALUE} não é uma categoria válida.',
      },
      default: 'Geral',
    },
    img: {
      type: String,
      required: [true, 'A URL ou caminho da imagem é obrigatório.'],
      trim: true,
    },
    tamanhos: {
      type: [String],
      default: ['P', 'M', 'G'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'O produto deve ter ao menos um tamanho disponível.',
      },
    },
    estoque: {
      type: Number,
      default: 10,
      min: [0, 'O estoque não pode ser negativo.'],
    },
    ativo: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true, // Gera automaticamente createdAt e updatedAt
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.legacyId || ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Pre-save hook para garantir que os preços formatados acompanhem os valores numéricos se ausentes
productSchema.pre('save', function (next) {
  if (this.preco != null && !this.precoFormatado) {
    this.precoFormatado = `R$ ${this.preco.toFixed(2).replace('.', ',')}`;
  }
  if (this.precoAntigo != null && !this.precoAntigoFormatado) {
    this.precoAntigoFormatado = `R$ ${this.precoAntigo.toFixed(2).replace('.', ',')}`;
  }
  next();
});

// ==========================================
// ÍNDICES PARA OTIMIZAÇÃO DE CONSULTAS
// ==========================================
// 1. Índice Textual: para busca rápida no campo de pesquisa da navbar ("Buscar produto...")
productSchema.index(
  { nome: 'text', descricao: 'text' },
  { name: 'idx_produto_busca_textual', default_language: 'portuguese' }
);

// 2. Índice Composto (categoria + ativo): para carregar eficientemente as fileiras da Home
productSchema.index(
  { categoria: 1, ativo: 1 },
  { name: 'idx_produto_categoria_ativo' }
);

// 3. Índice em preco: para filtros de faixa de preço e ordenação ascendente/descendente
productSchema.index({ preco: 1 }, { name: 'idx_produto_preco' });

export const Product = mongoose.model('Product', productSchema);
export default Product;
