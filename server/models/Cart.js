import mongoose from 'mongoose';

/**
 * Subdocumento de item no carrinho
 */
const cartItemSchema = new mongoose.Schema(
  {
    produto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'O produto de referência é obrigatório.'],
    },
    nome: {
      type: String,
      required: true,
      trim: true,
    },
    img: {
      type: String,
      trim: true,
    },
    tamanho: {
      type: String,
      required: true,
      default: 'M',
    },
    quantidade: {
      type: Number,
      required: true,
      min: [1, 'A quantidade mínima é 1.'],
      default: 1,
    },
    precoUnitario: {
      type: Number,
      required: true,
      min: [0, 'O preço unitário não pode ser negativo.'],
    },
  },
  { _id: true }
);

/**
 * Schema do Carrinho de Compras
 */
const cartSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
      index: true,
      description: 'Referência ao usuário logado proprietário do carrinho',
    },
    sessionId: {
      type: String,
      sparse: true,
      index: true,
      description: 'Identificador temporário de sessão para usuários não autenticados',
    },
    itens: {
      type: [cartItemSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['ativo', 'abandonado', 'finalizado'],
      default: 'ativo',
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

// Virtual para calcular o total de itens
cartSchema.virtual('totalItens').get(function () {
  return (this.itens || []).reduce((acc, item) => acc + item.quantidade, 0);
});

// Virtual para calcular o subtotal monetário
cartSchema.virtual('subtotal').get(function () {
  return (this.itens || []).reduce(
    (acc, item) => acc + item.precoUnitario * item.quantidade,
    0
  );
});

// Índice para busca e expiração eventual de carrinhos de visitante antigos
cartSchema.index({ sessionId: 1 }, { name: 'idx_cart_session' });
cartSchema.index({ usuario: 1, status: 1 }, { name: 'idx_cart_user_status' });

export const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
