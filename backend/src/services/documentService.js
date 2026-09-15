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
      this.fileRepository.remove(file.filename).catch(() => {});
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
    this.fileRepository.remove(storedName).catch(() => {});
    throw error;
  }

  listDocuments() {
    return this.metadataRepository.findAllByOwner(this.ownerId).map((document) => this.toPublicDocument(document));
  }

  getDownload(id) {
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
