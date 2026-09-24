import mongoose from 'mongoose';

/**
 * Subdocumento de item no pedido
 */
const orderItemSchema = new mongoose.Schema(
  {
    produto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'O produto de referência é obrigatório.'],
    },
    nome: {
      type: String,
      required: [true, 'O nome do produto é obrigatório.'],
      trim: true,
    },
    precoUnitario: {
      type: Number,
      required: true,
      min: [0, 'O preço unitário não pode ser negativo.'],
    },
    quantidade: {
      type: Number,
      required: true,
      min: [1, 'A quantidade mínima é 1.'],
      default: 1,
    },
    tamanho: {
      type: String,
      required: true,
      default: 'M',
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'O subtotal não pode ser negativo.'],
    },
  },
  { _id: true }
);

/**
 * Schema de Pedido (Order)
 * Representa os pedidos finalizados a partir do carrinho de compras.
 */
const orderSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'O usuário proprietário do pedido é obrigatório.'],
      index: true,
    },
    itens: {
      type: [orderItemSchema],
      required: [true, 'O pedido deve conter ao menos um item.'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'O pedido não pode ser criado com carrinho vazio.',
      },
    },
    valorSubtotal: {
      type: Number,
      required: true,
      min: [0, 'O subtotal não pode ser negativo.'],
    },
    valorFrete: {
      type: Number,
      default: 0,
      min: [0, 'O frete não pode ser negativo.'],
    },
    valorTotal: {
      type: Number,
      required: true,
      min: [0, 'O valor total não pode ser negativo.'],
    },
    status: {
      type: String,
      enum: {
        values: ['pendente', 'pago', 'enviado', 'entregue', 'cancelado'],
        message: '{VALUE} não é um status de pedido válido.',
      },
      default: 'pendente',
      index: true,
    },
    enderecoEntrega: {
      rua: { type: String, trim: true },
      numero: { type: String, trim: true },
      complemento: { type: String, trim: true },
      bairro: { type: String, trim: true },
      cidade: { type: String, trim: true },
      estado: { type: String, trim: true },
      cep: { type: String, trim: true },
    },
    formaPagamento: {
      type: String,
      enum: ['pix', 'cartao_credito', 'boleto'],
      default: 'pix',
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

// ==========================================
// ÍNDICES PARA OTIMIZAÇÃO DE CONSULTAS
// ==========================================
// 1. Histórico de pedidos do usuário em ordem cronológica decrescente
orderSchema.index({ usuario: 1, createdAt: -1 }, { name: 'idx_order_user_date' });

// 2. Consulta de pedidos por status operacional
orderSchema.index({ status: 1, createdAt: -1 }, { name: 'idx_order_status_date' });

export const Order = mongoose.model('Order', orderSchema);
export default Order;
