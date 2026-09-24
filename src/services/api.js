/**
 * Serviço de Integração do Frontend com a API Backend e MongoDB
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Busca todos os produtos com filtros opcionais
 */
export async function getProdutos(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/produtos${query ? `?${query}` : ''}`);
  if (!response.ok) {
    throw new Error('Falha ao buscar produtos da API.');
  }
  return await response.json();
}

/**
 * Busca um produto pelo ID ou legacyId
 */
export async function getProdutoPorId(id) {
  const response = await fetch(`${API_BASE_URL}/produtos/${id}`);
  if (!response.ok) {
    throw new Error(`Falha ao buscar produto ${id}.`);
  }
  return await response.json();
}

/**
 * Cadastra um novo usuário no MongoDB
 */
export async function cadastrarUsuario(dados) {
  const response = await fetch(`${API_BASE_URL}/auth/cadastro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.mensagem || 'Falha ao cadastrar usuário.');
  }
  return data;
}

/**
 * Realiza login e autenticação
 */
export async function autenticarUsuario(dados) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.mensagem || 'Falha ao autenticar.');
  }
  return data;
}

/**
 * Envia mensagem do formulário de contato
 */
export async function enviarMensagemContato(dados) {
  const response = await fetch(`${API_BASE_URL}/contato`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.mensagem || 'Falha ao enviar mensagem de contato.');
  }
  return data;
}
