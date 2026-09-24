import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useCarrinho } from './CarrinhoContext'; // Importa o carrinho real
import './Carrinho.css';

export default function Carrinho() {
  const { carrinho, removerDoCarrinho } = useCarrinho();

  // Função simples para somar os preços dos produtos
  const calcularTotal = () => {
    return carrinho.reduce((acc, item) => {
      const precoLimpo = item.preco
        .replace("R$", "")
        .replace(".", "")
        .replace(",", ".")
        .trim();
      return acc + parseFloat(precoLimpo) * item.quantidade;
    }, 0);
  };

  const total = calcularTotal();

  return (
    <div className="carrinho-container">
      <div className="carrinho-header-pagina">
        <h1>Meu Carrinho</h1>
      </div>

      {carrinho.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p className="carrinho-vazio">Seu carrinho está vazio.</p>
          <Link to="/" style={{ color: '#000', fontWeight: 'bold' }}>Comprar</Link>
        </div>
      ) : (
        <div className="carrinho-conteudo">
          <div className="carrinho-lista">
            {carrinho.map((item) => (
              <div key={item.id} className="carrinho-item-pagina">
                <img src={item.img} alt={item.nome} />
                <div className="info-item">
                  <h3>{item.nome}</h3>
                  <p className="preco-item">{item.preco}</p>
                  <span>Qtd: {item.quantidade}</span>
                </div>
                <button className="btn-remover" onClick={() => removerDoCarrinho(item.id)}>
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="carrinho-resumo">
            <h2>Resumo do Pedido</h2>
            <div className="linha-resumo">
              <span>Subtotal</span>
              <span>R$ {total.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="linha-resumo">
              <span>Frete</span>
              <span>Grátis</span>
            </div>
            <div className="linha-resumo total">
              <strong>Total</strong>
              <strong>R$ {total.toFixed(2).replace(".", ",")}</strong>
            </div>
            <button className="btn-finalizar">Finalizar Compra</button>
          </div>
        </div>
      )}
    </div>
  );
}