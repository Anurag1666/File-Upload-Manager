export default function UploadQueue({ items }) {
  if (!items.length) return null;

  return (
    <div className="upload-queue">
      {items.map((item) => (
        <div key={item.key} className={`upload-item${item.status === 'done' ? ' done' : ''}${item.status === 'error' ? ' error' : ''}`}>
          <div className="upload-item-name">
            <span>{item.label}</span>
            <span>
              {item.status === 'done' ? 'Done' : item.status === 'error' ? 'Failed' : `${item.progress}%`}
            </span>
          </div>
          <div className="upload-bar-track">
            <div className="upload-bar-fill" style={{ width: `${item.progress}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
