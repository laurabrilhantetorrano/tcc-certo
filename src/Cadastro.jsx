import React, { useState } from "react"; // 1. Importamos o useState
import { Link } from "react-router-dom";
import "./Cadastro.css";
import logo from "./assets/logo.jpg"; 

export default function Cadastro() {
  const [email, setEmail] = useState("");
  const [erroEmail, setErroEmail] = useState("");

  const lidarComCadastro = (e) => {
    e.preventDefault(); // Impede a página de recarregar

    // 3. A validação: verifica se o e-mail contém '@' e se tem pontos válidos
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.includes("@") || !emailValido.test(email)) {
      setErroEmail("Por favor, insira um e-mail válido (ex: nome@email.com).");
      return; // Para a execução aqui e não deixa cadastrar
    }

    setErroEmail("");
    alert("Cadastro realizado com sucesso!");
  };

  return (
    <div className="cadastro-page-container">
      <Link to="/" className="btn-voltar-home-cad">
        ← Voltar para o Início
      </Link>

      <section className="cadastro-section">
        <div className="boas-vindas-cad">
          <img src={logo} alt="Logo" />
          <h2>Bem-vindo! Por favor, insira seus dados para criar sua conta.</h2>
        </div>
      
        <form onSubmit={lidarComCadastro} className="grupo-input-cad">
          <h1>Cadastre-se</h1>
          
          <label htmlFor="username">Usuário:</label>
          <input type="text" id="username" name="username" required />

          <label htmlFor="email">Email:</label>
          <input 
            type="text"
            id="email" 
            name="email" 
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (erroEmail) setErroEmail(""); 
            }}
            required 
          />
          
          {/* Se houver erro, renderiza a mensagem na tela */}
          {erroEmail && <span className="erro-mensagem">{erroEmail}</span>}
          
          <label htmlFor="senha">Senha:</label>
          <input type="password" id="senha" name="senha" required />

          <button type="submit" className="btn-enviar-cad">
            Cadastrar
          </button>
          
          <p>
            Já tem uma conta? <Link to="/login">Faça login</Link>
          </p>
        </form>
      </section>
    </div>
  );
}