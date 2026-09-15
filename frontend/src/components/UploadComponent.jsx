import { useState } from 'react';
import { uploadDocument } from '../services/documentApi';

export default function UploadComponent({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file) {
      setError('Selecione um arquivo para continuar.');
      return;
    }

    setError('');
    setIsUploading(true);
    try {
      const document = await uploadDocument(file);
      setFile(null);
      event.target.reset();
      onUploaded(document);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className="upload-panel" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">Novo documento</p>
        <h2>Adicione um arquivo ao seu espaço</h2>
        <p className="muted">PDF, documentos de texto e planilhas de até 10 MB.</p>
      </div>
      <label className="file-picker">
        <span>{file ? file.name : 'Escolher arquivo'}</span>
        <input type="file" onChange={(event) => setFile(event.target.files[0] || null)} />
      </label>
      <button type="submit" disabled={isUploading}>
        {isUploading ? 'Enviando...' : 'Enviar documento'}
      </button>
      {error && <p className="error-message" role="alert">{error}</p>}
    </form>
  );
}
