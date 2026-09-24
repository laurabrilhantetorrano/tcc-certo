import React from "react";
import { Link } from "react-router-dom";
import "./Login.css";
// Importando o logo igual você fez no Inicio.jsx
import logo from "./assets/logo.jpg"; 

export default function Login() {
  return (
    <div className="login-page-container">
      {/* Botão flutuante para voltar para a Home */}
      <Link to="/" className="btn-voltar-home">
        ← Voltar para o Início
      </Link>

      <section className="login-section">
        <div className="boas-vindas">
          <img src={logo} alt="Logo" />
          <h2>
            Bem-vindo de volta! Por favor, insira seus dados para acessar sua conta.
          </h2>
        </div>

        <div className="grupo-input">
          <h1>Login</h1>
          
          <label htmlFor="username">Usuário ou Email:</label>
          <input type="text" id="username" name="username" required />

          <label htmlFor="password">Senha:</label>
          <input type="password" id="senha" name="senha" required />

          <button type="submit" className="btn-enviar-login">
            Entrar
          </button>
          
          <p>
            Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
          </p>
        </div>
      </section>
    </div>
  );
}