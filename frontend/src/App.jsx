import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList';
import UploadComponent from './components/UploadComponent';
import { listDocuments } from './services/documentApi';
import './app.css';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listDocuments()
      .then((payload) => setDocuments(payload.documents))
      .catch((loadError) => setError(loadError.message))
      .finally(() => setIsLoading(false));
  }, []);

  function handleUploaded(document) {
    setDocuments((currentDocuments) => [document, ...currentDocuments]);
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="brand-mark">DMS<span>.</span></div>
        <p className="eyebrow">Arquivo pessoal</p>
        <h1>Seus documentos,<br /><em>em um só lugar.</em></h1>
        <p className="hero-copy">Guarde arquivos importantes com simplicidade e encontre tudo quando precisar.</p>
      </header>
      <div className="content-grid">
        <UploadComponent onUploaded={handleUploaded} />
        {isLoading ? <p className="loading-message">Carregando sua biblioteca...</p> : error ? <p className="error-message" role="alert">{error}</p> : <DocumentList documents={documents} />}
      </div>
    </main>
  );
}
