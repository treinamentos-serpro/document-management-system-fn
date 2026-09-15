class DocumentController {
  constructor(documentService) {
    this.documentService = documentService;
    this.upload = this.upload.bind(this);
    this.list = this.list.bind(this);
    this.download = this.download.bind(this);
  }

  upload(req, res, next) {
    try {
      const document = this.documentService.createDocument(req.file);
      res.status(201).json(document);
    } catch (error) {
      next(error);
    }
  }

  list(req, res, next) {
    try {
      res.json({ documents: this.documentService.listDocuments() });
    } catch (error) {
      next(error);
    }
  }

  download(req, res, next) {
    try {
      const document = this.documentService.getDownload(req.params.id);
      res.setHeader('Content-Type', document.mimeType);
      res.setHeader('Content-Length', document.size);
      res.setHeader('Content-Disposition', `attachment; filename="${this.sanitizeFilename(document.originalName)}"`);
      const stream = this.documentService.createReadStream(document);
      stream.on('error', next);
      stream.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  sanitizeFilename(filename) {
    return filename.replace(/[\\"\r\n]/g, '_');
  }
}

module.exports = DocumentController;
