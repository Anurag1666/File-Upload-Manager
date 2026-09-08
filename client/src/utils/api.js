const API = '/api';

export async function fetchStats() {
  const res = await fetch(`${API}/stats`);
  return res.json();
}

export async function fetchFiles(search = '') {
  const url = search ? `${API}/files?search=${encodeURIComponent(search)}` : `${API}/files`;
  const res = await fetch(url);
  const data = await res.json();
  return data.files;
}

export async function deleteFile(id) {
  const res = await fetch(`${API}/files/${id}`, { method: 'DELETE' });
  return res.ok;
}

export function downloadFile(id) {
  window.location.href = `${API}/files/${id}/download`;
}

// Uses XHR (not fetch) so we get upload progress events.
export function uploadFiles(files, { onProgress, onDone, onError }) {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));

  const xhr = new XMLHttpRequest();
  xhr.open('POST', `${API}/upload`);

  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      onProgress(Math.round((e.loaded / e.total) * 100));
    }
  });

  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      onDone(JSON.parse(xhr.responseText));
    } else {
      let msg = 'Upload failed';
      try { msg = JSON.parse(xhr.responseText).error || msg; } catch (e) {}
      onError(msg);
    }
  };

  xhr.onerror = () => onError('Could not reach the server');

  xhr.send(formData);
}
