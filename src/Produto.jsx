import React from "react";
import { useParams, Link } from "react-router-dom";
import "./Produto.css";
import { ArrowLeft } from "lucide-react";
import { useCarrinho } from "./CarrinhoContext";

import produto1 from "./assets/produto1.png";
import produto2 from "./assets/produto2.png";
import produto3 from "./assets/produto3.png";
import produto4 from "./assets/produto4.png";
import produto5 from "./assets/produto5.jpeg";
import produto6 from "./assets/produto6.jpeg";
import produto7 from "./assets/produto7.jpeg";
import produto8 from "./assets/produto8.jpeg";

const listaProdutos = [
  {
    id: 1,
    img: produto1,
    nome: "Body + Corpete Bege",
    preco: "R$ 105,00",
    desc: "Lindo body com corpete bege, perfeito para ocasiões especiais. Tecido confortável de alta durabilidade."
  },

  {
    id: 2,
    img: produto2,
    nome: "Camisa Social",
    preco: "R$ 59,90",
    desc: "Camisa social elegante de algodão. Ideal para o dia a dia no trabalho ou eventos formais."
  },

  {
    id: 3,
    img: produto3,
    nome: "Calça Jogger",
    preco: "R$ 89,90",
    desc: "Calça jogger super estilosa com ajuste na cintura. Conforto e moda andam juntos aqui."
  },

  {
    id: 4,
    img: produto4,
    nome: "Moletom Cinza",
    preco: "R$ 85,00",
    desc: "Moletom cinza flanelado perfeito para os dias mais frios. Caimento perfeito e muito quentinho."
  },

  {
    id: 5,
    img: produto5,
    nome: "Blusa feminina",
    preco: "R$ 42,00",
    desc: "Blusa menta estilosa com saia para um visual casual."
  },

  {
    id: 6,
    img: produto6,
    nome: "Conjunto Verão",
    preco: "R$ 135,00",
    desc: "Conjunto de camisa bata e shorts fresquinho para o verão."
  },

  {
    id: 7,
    img: produto7,
    nome: "Pijama Infantil Sereia",
    preco: "R$ 65,00",
    desc: "Pijama de sereia divertido e super confortável."
  },

  {
    id: 8,
    img: produto8,
    nome: "Pijama Infantil Sweet Dreams",
    preco: "R$ 69,00",
    desc: "Pijama verde-menta macio para noites tranquilas."
  }
];

export default function Produto() {
  const { adicionarAoCarrinho } = useCarrinho();
  const { id } = useParams();

  // Encontra o produto pelo ID da URL
  const produto = listaProdutos.find(
    (item) => item.id === parseInt(id)
  );

  // Se não encontrar o produto
  if (!produto) {
    return <h2>Produto não encontrado!</h2>;
  }

  return (
    <div className="produto-detalhes-container">

      <Link
        to="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          textDecoration: "none",
          color: "#000",
          marginBottom: "20px",
          fontWeight: "bold"
        }}
      >
        <ArrowLeft size={20} />
        Voltar
      </Link>

      <div className="produto-wrapper">

        <div className="produto-imagem">
          <img
            src={produto.img}
            alt={produto.nome}
          />
        </div>

        <div className="produto-info">

          <h1>{produto.nome}</h1>

          <p className="produto-preco">
            {produto.preco}
          </p>

          <p className="produto-descricao">
            {produto.desc}
          </p>

          <div className="opcoes-compra">

            <label htmlFor="tamanho">
              Tamanho:
            </label>

            <select id="tamanho">
              <option>P</option>
              <option>M</option>
              <option>G</option>
            </select>

          </div>

          <button
            onClick={() => adicionarAoCarrinho(produto)}
          >
            Comprar
          </button>

        </div>

      </div>
    </div>
  );
}