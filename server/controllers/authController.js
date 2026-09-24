import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/UserRepository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_chave_segura_nana_mimi_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const authController = {
  /**
   * Realiza o cadastro de um novo usuário
   * POST /api/auth/cadastro
   */
  async register(req, res, next) {
    try {
      const { username, email, senha, nomeCompleto, telefone } = req.body;

      if (!username || !email || !senha) {
        return res.status(400).json({
          status: 'erro',
          mensagem: 'Usuário, e-mail e senha são obrigatórios.',
        });
      }

      // Validação de formato de e-mail (idêntica ao frontend)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: 'erro',
          mensagem: 'Por favor, insira um e-mail válido (ex: nome@email.com).',
        });
      }

      if (senha.length < 6) {
        return res.status(400).json({
          status: 'erro',
          mensagem: 'A senha deve ter no mínimo 6 caracteres.',
        });
      }

      // Verifica se o email já existe
      const emailExiste = await userRepository.existsByEmail(email);
      if (emailExiste) {
        return res.status(409).json({
          status: 'erro',
          mensagem: 'Este e-mail já está cadastrado no sistema.',
        });
      }

      // Verifica se o username já existe
      const usernameExiste = await userRepository.existsByUsername(username);
      if (usernameExiste) {
        return res.status(409).json({
          status: 'erro',
          mensagem: 'Este nome de usuário já está em uso.',
        });
      }

      const novoUsuario = await userRepository.create({
        username,
        email,
        senha,
        nomeCompleto: nomeCompleto || '',
        telefone: telefone || '',
      });

      // Gera o token JWT
      const token = jwt.sign(
        { id: novoUsuario._id, email: novoUsuario.email, role: novoUsuario.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.status(201).json({
        status: 'sucesso',
        mensagem: 'Cadastro realizado com sucesso!',
        token,
        usuario: novoUsuario,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Realiza o login do usuário por email ou username
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { username, senha } = req.body;

      if (!username || !senha) {
        return res.status(400).json({
          status: 'erro',
          mensagem: 'Por favor, informe seu usuário/e-mail e sua senha.',
        });
      }

      const usuario = await userRepository.findByIdentifier(username, true);

      if (!usuario) {
        return res.status(401).json({
          status: 'erro',
          mensagem: 'Credenciais inválidas. Verifique seu usuário e senha.',
        });
      }

      if (!usuario.ativo) {
        return res.status(403).json({
          status: 'erro',
          mensagem: 'Esta conta foi desativada.',
        });
      }

      const senhaCorreta = await usuario.compararSenha(senha);
      if (!senhaCorreta) {
        return res.status(401).json({
          status: 'erro',
          mensagem: 'Credenciais inválidas. Verifique seu usuário e senha.',
        });
      }

      const token = jwt.sign(
        { id: usuario._id, email: usuario.email, role: usuario.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Remove a senha do objeto antes de enviar
      const usuarioJson = usuario.toJSON();

      res.status(200).json({
        status: 'sucesso',
        mensagem: 'Login realizado com sucesso!',
        token,
        usuario: usuarioJson,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retorna os dados do usuário autenticado
   * GET /api/auth/me
   */
  async getProfile(req, res, next) {
    try {
      const usuario = await userRepository.findById(req.userId);
      if (!usuario) {
        return res.status(404).json({
          status: 'erro',
          mensagem: 'Usuário não encontrado.',
        });
      }

      res.status(200).json({
        status: 'sucesso',
        usuario,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default authController;
