const crypto = require('node:crypto');

class DocumentService {
  constructor({ metadataRepository, fileRepository, ownerId }) {
    this.metadataRepository = metadataRepository;
    this.fileRepository = fileRepository;
    this.ownerId = ownerId;
  }

  createDocument(file) {
    if (!file || !file.filename) {
      const error = new Error('File is required');
      error.code = 'FILE_REQUIRED';
      throw error;
    }

    if (!file.size) {
      this.removeFileAfterFailure(file.filename);
      const error = new Error('File cannot be empty');
      error.code = 'EMPTY_FILE';
      throw error;
    }

    const document = {
      id: crypto.randomUUID(),
      originalName: file.originalname,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner: this.ownerId,
      mimeType: file.mimetype,
      storedName: file.filename,
    };

    try {
      this.metadataRepository.create(document);
      return this.toPublicDocument(document);
    } catch (error) {
      return this.cleanupFailedCreation(file.filename, error);
    }
  }

  cleanupFailedCreation(storedName, error) {
    this.removeFileAfterFailure(storedName);
    throw error;
  }

  removeFileAfterFailure(storedName) {
    this.fileRepository.remove(storedName).catch((cleanupError) => {
      console.error('Falha ao remover arquivo após erro no upload.', cleanupError);
    });
  }

  listDocuments() {
    return this.metadataRepository.findAllByOwner(this.ownerId).map((document) => this.toPublicDocument(document));
  }

  getDownload(id) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      const error = new Error('Invalid document id');
      error.code = 'INVALID_DOCUMENT_ID';
      throw error;
    }

    const document = this.metadataRepository.findById(id);
    if (!document || document.owner !== this.ownerId) {
      const error = new Error('Document not found');
      error.code = 'DOCUMENT_NOT_FOUND';
      throw error;
    }

    if (!this.fileRepository.exists(document.storedName)) {
      const error = new Error('File not found');
      error.code = 'FILE_NOT_FOUND';
      throw error;
    }

    return document;
  }

  createReadStream(document) {
    return this.fileRepository.createReadStream(document.storedName);
  }

  toPublicDocument(document) {
    const { storedName, ...publicDocument } = document;
    return publicDocument;
  }
}

module.exports = DocumentService;
