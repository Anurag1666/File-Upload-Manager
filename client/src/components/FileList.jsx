import { formatBytes, formatDate, iconFor } from '../utils/format';

export default function FileList({ files, onDownload, onDelete }) {
  return (
    <section className="ledger">
      <div className="ledger-head">
        <h2>Ledger</h2>
        <span className="ledger-count">{files.length ? `${files.length} shown` : ''}</span>
      </div>

      {files.length === 0 ? (
        <div className="empty-state">
          <p>Nothing kept here yet.</p>
          <p className="empty-sub">Drop a file above to begin.</p>
        </div>
      ) : (
        <div className="file-list">
          {files.map((f) => (
            <div className="file-row" key={f.id}>
              {f.type === 'image' ? (
                <img className="file-thumb" src={f.url} alt="" loading="lazy" />
              ) : (
                <span className="file-icon">{iconFor(f.type)}</span>
              )}
              <div className="file-main">
                <span className="file-name" title={f.originalName}>{f.originalName}</span>
                <span className="file-meta">{f.type}</span>
              </div>
              <span className="file-size">{formatBytes(f.size)}</span>
              <span className="file-date">{formatDate(f.uploadedAt)}</span>
              <div className="file-actions">
                <button className="icon-btn" title="Download" onClick={() => onDownload(f)}>⭳</button>
                <button className="icon-btn danger" title="Delete" onClick={() => onDelete(f.id, f.originalName)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}