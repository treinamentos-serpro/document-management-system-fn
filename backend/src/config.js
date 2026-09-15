const path = require('node:path');

const defaultMimeTypes = [
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

function parseMimeTypes(value) {
  if (!value) return defaultMimeTypes;
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function loadConfig() {
  return {
    port: Number(process.env.PORT || 3000),
    storageDir: path.resolve(process.env.STORAGE_DIR || path.join(__dirname, '..', 'storage')),
    maxFileSizeBytes: Number(process.env.MAX_FILE_SIZE_BYTES || 10 * 1024 * 1024),
    allowedMimeTypes: parseMimeTypes(process.env.ALLOWED_MIME_TYPES),
    ownerId: process.env.OWNER_ID || 'anonymous',
  };
}

module.exports = { loadConfig };
