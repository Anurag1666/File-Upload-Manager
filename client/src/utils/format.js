export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
}

export function iconFor(mimetype = '', name = '') {
  if (mimetype.startsWith('image/')) return '◧';
  if (mimetype.startsWith('video/')) return '▶';
  if (mimetype.startsWith('audio/')) return '♫';
  if (mimetype === 'application/pdf') return '▤';
  if (mimetype.includes('zip') || mimetype.includes('compressed')) return '▦';
  if (mimetype.startsWith('text/') || name.endsWith('.md') || name.endsWith('.txt')) return '▥';
  return '▧';
}
