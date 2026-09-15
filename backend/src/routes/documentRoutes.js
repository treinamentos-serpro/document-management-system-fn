const express = require('express');
const multer = require('multer');
const crypto = require('node:crypto');
const path = require('node:path');

function createDocumentRoutes({ config, controller }) {
  const router = express.Router();
  const storage = multer.diskStorage({
    destination: config.storageDir,
    filename: (req, file, callback) => {
      callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
    },
  });
  const upload = multer({
    storage,
    limits: { fileSize: config.maxFileSizeBytes, files: 1 },
    fileFilter: (req, file, callback) => {
      if (!config.allowedMimeTypes.includes(file.mimetype)) {
        const error = new Error('Invalid file type');
        error.code = 'INVALID_FILE_TYPE';
        return callback(error);
      }
      return callback(null, true);
    },
  });

  router.post('/upload', upload.single('file'), controller.upload);
  router.get('/documents', controller.list);
  router.get('/documents/:id/download', controller.download);
  return router;
}

module.exports = createDocumentRoutes;
