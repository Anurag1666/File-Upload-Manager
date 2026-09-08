import { useRef, useState } from 'react';

export default function Dropzone({ onFilesSelected }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFilesSelected(files);
  };

  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) onFilesSelected(files);
    e.target.value = '';
  };

  return (
    <section
      className={`dropzone${dragOver ? ' dragover' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
      onDrop={handleDrop}
    >
      <input type="file" ref={inputRef} multiple hidden onChange={handleChange} />
      <div className="dropzone-inner">
        <span className="dropzone-icon">⇪</span>
        <p className="dropzone-title">
          Drop files here, or{' '}
          <button
            type="button"
            className="link-btn"
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
          >
            choose from your device
          </button>
        </p>
        <p className="dropzone-hint">Up to 20 files per drop, 50MB each</p>
      </div>
    </section>
  );
}
