const apiPrefix = '/api';

async function parseResponse(response) {
  if (response.ok) return response;

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const error = new Error(payload?.error?.message || 'Não foi possível concluir a operação.');
  error.code = payload?.error?.code;
  error.status = response.status;
  throw error;
}

export async function listDocuments() {
  const response = await fetch(`${apiPrefix}/documents`);
  await parseResponse(response);
  return response.json();
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${apiPrefix}/upload`, { method: 'POST', body: formData });
  await parseResponse(response);
  return response.json();
}

export async function downloadDocument(id) {
  const response = await fetch(`${apiPrefix}/documents/${encodeURIComponent(id)}/download`);
  await parseResponse(response);
  return response.blob();
}
