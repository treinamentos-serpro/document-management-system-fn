const fs = require('node:fs');
const path = require('node:path');

class FileRepository {
  constructor(storageDir) {
    this.storageDir = storageDir;
    fs.mkdirSync(storageDir, { recursive: true });
  }

  getPath(storedName) {
    if (!storedName || storedName !== path.basename(storedName)) {
      throw new Error('Invalid stored file name');
    }
    return path.join(this.storageDir, storedName);
  }

  exists(storedName) {
    try {
      return fs.existsSync(this.getPath(storedName));
    } catch {
      return false;
    }
  }

  createReadStream(storedName) {
    return fs.createReadStream(this.getPath(storedName));
  }

  remove(storedName) {
    return fs.promises.rm(this.getPath(storedName), { force: true });
  }
}

module.exports = FileRepository;
