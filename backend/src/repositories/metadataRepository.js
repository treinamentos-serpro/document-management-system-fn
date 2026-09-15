class MetadataRepository {
  constructor() {
    this.documents = new Map();
  }

  create(document) {
    this.documents.set(document.id, document);
    return document;
  }

  findById(id) {
    return this.documents.get(id) || null;
  }

  findAllByOwner(owner) {
    return [...this.documents.values()]
      .filter((document) => document.owner === owner)
      .sort((left, right) => {
        const dateDifference = new Date(right.uploadedAt) - new Date(left.uploadedAt);
        return dateDifference || left.id.localeCompare(right.id);
      });
  }
}

module.exports = MetadataRepository;
