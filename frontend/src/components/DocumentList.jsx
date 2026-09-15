import DownloadButton from './DownloadButton';

function formatSize(size) {
  if (size < 1024) return `${size} B`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function DocumentList({ documents }) {
  if (!documents.length) {
    return <section className="empty-state"><span className="empty-icon">+</span><h2>Nenhum documento ainda</h2><p>Seu próximo arquivo aparece aqui assim que for enviado.</p></section>;
  }

  return (
    <section className="document-section">
      <div className="section-heading">
        <div><p className="eyebrow">Biblioteca</p><h2>Seus documentos</h2></div>
        <span className="document-count">{documents.length} {documents.length === 1 ? 'arquivo' : 'arquivos'}</span>
      </div>
      <div className="document-list">
        {documents.map((document) => (
          <article className="document-row" key={document.id}>
            <div className="document-icon">{document.mimeType === 'application/pdf' ? 'PDF' : 'DOC'}</div>
            <div className="document-details"><strong>{document.originalName}</strong><span>{formatSize(document.size)} · {formatDate(document.uploadedAt)}</span></div>
            <DownloadButton document={document} />
          </article>
        ))}
      </div>
    </section>
  );
}
