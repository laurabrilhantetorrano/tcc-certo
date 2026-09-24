/**
 * Middleware centralizado de tratamento de erros
 * Trata erros do Mongoose, MongoDB e erros gerais sem expor detalhes internos em produção.
 */
export function errorHandler(err, req, res, next) {
  // Log detalhado no console do servidor para fins de depuração
  console.error(`[Erro na rota ${req.method} ${req.originalUrl}]:`, err);

  const isProduction = process.env.NODE_ENV === 'production';

  // 1. Erro de Validação do Mongoose (Campos obrigatórios, tipos, limites)
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      campo: e.path,
      mensagem: e.message,
    }));
    return res.status(400).json({
      status: 'erro',
      tipo: 'Validacao',
      mensagem: 'Dados inválidos fornecidos.',
      erros: errors,
    });
  }

  // 2. Erro de Cast do Mongoose (ex: ObjectId com formato inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'erro',
      tipo: 'IdentificadorInvalido',
      mensagem: `Valor inválido para o campo '${err.path}': ${err.value}`,
    });
  }

  // 3. Erro de Chave Única do MongoDB (código 11000 - email ou username duplicado)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyPattern || err.keyValue || {});
    const fieldName = fields[0] || 'campo';
    return res.status(409).json({
      status: 'erro',
      tipo: 'Duplicidade',
      mensagem: `Já existe um registro com este(a) ${fieldName}.`,
      campo: fieldName,
    });
  }

  // 4. Erros com status code customizado já atribuído
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      status: 'erro',
      mensagem: err.message,
    });
  }

  // 5. Erro interno genérico (500)
  return res.status(500).json({
    status: 'erro',
    mensagem: 'Ocorreu um erro interno no servidor. Por favor, tente novamente mais tarde.',
    ...(isProduction ? {} : { detalhe: err.message, stack: err.stack }),
  });
}

export default errorHandler;
