import { useCallback, useEffect, useRef, useState } from 'react';
import Sidebar from './components/Sidebar';
import Dropzone from './components/Dropzone';
import UploadQueue from './components/UploadQueue';
import FileList from './components/FileList';
import Toast from './components/Toast';
import { fetchFiles, fetchStats, deleteFile, downloadFile, uploadFiles } from './utils/api';

export default function App() {
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState({ count: 0, totalSize: 0 });
  const [search, setSearch] = useState('');
  const [uploadItems, setUploadItems] = useState([]);
  const [toast, setToast] = useState({ message: '', error: false });
  const toastTimer = useRef(null);
  const searchDebounce = useRef(null);

  const showToast = useCallback((message, error = false) => {
    setToast({ message, error });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast({ message: '', error: false }), 3200);
  }, []);

  const refresh = useCallback(async (term = search) => {
    const [fileData, statData] = await Promise.all([fetchFiles(term), fetchStats()]);
    setFiles(fileData);
    setStats(statData);
  }, [search]);

  useEffect(() => {
    refresh('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      refresh(search);
    }, 200);
    return () => clearTimeout(searchDebounce.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleFilesSelected = (selectedFiles) => {
    const key = `${Date.now()}-${Math.random()}`;
    const names = selectedFiles.map((f) => f.name).join(', ');
    const label = names.length > 60 ? names.slice(0, 60) + '…' : names;

    setUploadItems((prev) => [...prev, { key, label, progress: 0, status: 'uploading' }]);

    uploadFiles(selectedFiles, {
      onProgress: (progress) => {
        setUploadItems((prev) => prev.map((it) => (it.key === key ? { ...it, progress } : it)));
      },
      onDone: () => {
        setUploadItems((prev) => prev.map((it) => (it.key === key ? { ...it, status: 'done', progress: 100 } : it)));
        showToast(selectedFiles.length > 1 ? `${selectedFiles.length} files kept` : `"${selectedFiles[0].name}" kept`);
        refresh();
        setTimeout(() => {
          setUploadItems((prev) => prev.filter((it) => it.key !== key));
        }, 2500);
      },
      onError: (msg) => {
        setUploadItems((prev) => prev.map((it) => (it.key === key ? { ...it, status: 'error' } : it)));
        showToast(msg, true);
        setTimeout(() => {
          setUploadItems((prev) => prev.filter((it) => it.key !== key));
        }, 2500);
      }
    });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from the depository? This cannot be undone.`)) return;
    const ok = await deleteFile(id);
    if (ok) {
      showToast(`"${name}" removed`);
      refresh();
    } else {
      showToast('Could not delete that file', true);
    }
  };

  return (
    <div className="app">
      <Sidebar stats={stats} search={search} onSearchChange={setSearch} />

      <main className="main">
        <Dropzone onFilesSelected={handleFilesSelected} />
        <UploadQueue items={uploadItems} />
        <FileList files={files} onDownload={downloadFile} onDelete={handleDelete} />
      </main>

      <Toast message={toast.message} error={toast.error} />
    </div>
  );
}
