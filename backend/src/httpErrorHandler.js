function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  const errorMap = {
    FILE_REQUIRED: [400, 'FILE_REQUIRED'],
    INVALID_FILE_TYPE: [400, 'INVALID_FILE_TYPE'],
    EMPTY_FILE: [400, 'EMPTY_FILE'],
    LIMIT_FILE_SIZE: [413, 'FILE_TOO_LARGE'],
    LIMIT_UNEXPECTED_FILE: [400, 'FILE_REQUIRED'],
    DOCUMENT_NOT_FOUND: [404, 'DOCUMENT_NOT_FOUND'],
    FILE_NOT_FOUND: [404, 'FILE_NOT_FOUND'],
  };
  const [status, code] = errorMap[error.code] || [500, 'INTERNAL_ERROR'];
  const messages = {
    FILE_REQUIRED: 'O campo file é obrigatório.',
    INVALID_FILE_TYPE: 'O tipo do arquivo não é permitido.',
    EMPTY_FILE: 'O arquivo não pode estar vazio.',
    FILE_TOO_LARGE: 'O arquivo excede o tamanho máximo permitido.',
    DOCUMENT_NOT_FOUND: 'Documento não encontrado.',
    FILE_NOT_FOUND: 'Arquivo não encontrado.',
    INTERNAL_ERROR: 'Ocorreu um erro interno.',
  };

  if (status >= 500) console.error(error);
  return res.status(status).json({ error: { code, message: messages[code] } });
}

module.exports = errorHandler;
