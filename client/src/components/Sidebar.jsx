import { formatBytes } from '../utils/format';

export default function Sidebar({ stats, search, onSearchChange }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">◈</span>
        <h1>File Upload Manager</h1>
      </div>
      <p className="tagline">A quiet place to keep your files</p>

      <div className="stats">
        <div className="stat">
          <span className="stat-value">{stats.count}</span>
          <span className="stat-label">items held</span>
        </div>
        <div className="stat">
          <span className="stat-value">{formatBytes(stats.totalSize)}</span>
          <span className="stat-label">total weight</span>
        </div>
      </div>

      <div className="search-block">
        <label htmlFor="searchInput">Find a file</label>
        <input
          id="searchInput"
          type="text"
          placeholder="Search by name…"
          autoComplete="off"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="sidebar-footer">
        <p>Files stay on this server, in <code>/uploads</code>. Nothing leaves this machine.</p>
      </div>
    </aside>
  );
}
