import { useState } from 'react';
import { downloadDocument } from '../services/documentApi';

function formatSize(size) {
  if (size < 1024) return `${size} B`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function DocumentList({ documents }) {
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState('');

  async function handleDownload(document) {
    setError('');
    setDownloadingId(document.id);
    try {
      const blob = await downloadDocument(document.id);
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement('a');
      anchor.href = url;
      anchor.download = document.originalName;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError.message);
    } finally {
      setDownloadingId(null);
    }
  }

  if (!documents.length) {
    return <section className="empty-state"><span className="empty-icon">+</span><h2>Nenhum documento ainda</h2><p>Seu próximo arquivo aparece aqui assim que for enviado.</p></section>;
  }

  return (
    <section className="document-section">
      <div className="section-heading">
        <div><p className="eyebrow">Biblioteca</p><h2>Seus documentos</h2></div>
        <span className="document-count">{documents.length} {documents.length === 1 ? 'arquivo' : 'arquivos'}</span>
      </div>
      {error && <p className="error-message" role="alert">{error}</p>}
      <div className="document-list">
        {documents.map((document) => (
          <article className="document-row" key={document.id}>
            <div className="document-icon">{document.mimeType === 'application/pdf' ? 'PDF' : 'DOC'}</div>
            <div className="document-details"><strong>{document.originalName}</strong><span>{formatSize(document.size)} · {formatDate(document.uploadedAt)}</span></div>
            <button className="download-button" type="button" onClick={() => handleDownload(document)} disabled={downloadingId === document.id}>
              {downloadingId === document.id ? 'Baixando...' : 'Baixar'}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
