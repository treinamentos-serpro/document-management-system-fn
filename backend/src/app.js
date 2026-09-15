// Seed do servidor backend do Document Management System.
//
// Este arquivo é apenas um ponto de partida mínimo. Ao longo do workshop você
// vai usar o Agent Mode do GitHub Copilot para construir as camadas:
//   - routes/       (definição das rotas)
//   - controllers/  (entrada HTTP e validação)
//   - services/     (regras de negócio)
//   - repositories/ (persistência: arquivos locais + metadados em memória)
//
// Restrição do projeto: uploads são gravados no filesystem local da aplicação
// usando multer com diskStorage. Não utilize provedores externos.

const express = require('express');
const { loadConfig } = require('./config');
const MetadataRepository = require('./repositories/metadataRepository');
const FileRepository = require('./repositories/fileRepository');
const DocumentService = require('./services/documentService');
const DocumentController = require('./controllers/documentController');
const createDocumentRoutes = require('./routes/documentRoutes');
const errorHandler = require('./httpErrorHandler');

const app = express();
const config = loadConfig();
const metadataRepository = new MetadataRepository();
const fileRepository = new FileRepository(config.storageDir);
const documentService = new DocumentService({ metadataRepository, fileRepository, ownerId: config.ownerId });
const documentController = new DocumentController(documentService);

app.use(express.json());

// Endpoint de verificação de saúde. As demais rotas (/upload, /documents,
// /documents/:id/download) serão implementadas durante o Passo 2.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(createDocumentRoutes({ config, controller: documentController }));
app.use(errorHandler);

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`DMS backend ouvindo na porta ${config.port}`);
  });
}

module.exports = app;
