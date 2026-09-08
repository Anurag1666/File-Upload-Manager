const express = require('express');
const multer = require('multer');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const { put, list, del } = require('@vercel/blob');

const app = express();

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB per file
const PREFIX = 'uploads/'; // folder inside the Blob store

app.use(cors());
app.use(express.json());

// --- Multer setup (memory storage — we forward the buffer straight to Blob) ---
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE }
});

// --- Helpers ---

// We store each file at: uploads/<id>/<originalName>
// That keeps the id and the human-readable name both recoverable from the pathname.
function parsePathname(pathname) {
  const rest = pathname.slice(PREFIX.length); // "<id>/<originalName>"
  const slashIdx = rest.indexOf('/');
  const id = rest.slice(0, slashIdx);
  const originalName = decodeURIComponent(rest.slice(slashIdx + 1));
  return { id, originalName };
}

function guessType(name = '') {
  const ext = path.extname(name).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'].includes(ext)) return 'image';
  if (['.mp4', '.webm', '.mov', '.avi', '.mkv'].includes(ext)) return 'video';
  if (['.mp3', '.wav', '.ogg', '.m4a', '.flac'].includes(ext)) return 'audio';
  if (ext === '.pdf') return 'pdf';
  return 'other';
}

function toClient(blob) {
  const { id, originalName } = parsePathname(blob.pathname);
  return {
    id,
    originalName,
    size: blob.size,
    uploadedAt: blob.uploadedAt,
    type: guessType(originalName),
    url: blob.url,               // inline view (used for image thumbnails / preview)
    downloadUrl: blob.downloadUrl // forces a download with the original filename
  };
}

async function fetchAllBlobs() {
  let blobs = [];
  let cursor;
  do {
    const result = await list({ prefix: PREFIX, cursor, limit: 1000 });
    blobs = blobs.concat(result.blobs);
    cursor = result.cursor;
  } while (cursor);
  return blobs;
}

// --- Routes ---
// NOTE: this file lives at /api/index.js, and vercel.json rewrites every
// /api/* request here, so all routes below keep the /api prefix explicitly.

// Upload one or more files
app.post('/api/upload', upload.array('files', 20), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files received' });
  }

  try {
    const uploaded = await Promise.all(
      req.files.map(async (f) => {
        const id = crypto.randomBytes(8).toString('hex');
        const pathname = `${PREFIX}${id}/${encodeURIComponent(f.originalname)}`;
        const blob = await put(pathname, f.buffer, {
          access: 'public',
          contentType: f.mimetype,
          addRandomSuffix: false
        });
        return toClient({ ...blob, size: f.size, uploadedAt: new Date().toISOString() });
      })
    );
    res.status(201).json({ files: uploaded });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// List files (optional ?search=term, ?type=image|video|audio|pdf|other)
app.get('/api/files', async (req, res) => {
  try {
    const search = (req.query.search || '').toLowerCase();
    const type = req.query.type || '';

    const blobs = await fetchAllBlobs();
    let files = blobs.map(toClient);

    if (search) {
      files = files.filter((f) => f.originalName.toLowerCase().includes(search));
    }
    if (type) {
      files = files.filter((f) => f.type === type);
    }

    files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    res.json({ files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not list files' });
  }
});

// Stats
app.get('/api/stats', async (req, res) => {
  try {
    const blobs = await fetchAllBlobs();
    const totalSize = blobs.reduce((sum, b) => sum + b.size, 0);
    res.json({ count: blobs.length, totalSize });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load stats' });
  }
});

// Delete a single file
app.delete('/api/files/:id', async (req, res) => {
  try {
    const blobs = await fetchAllBlobs();
    const target = blobs.find((b) => parsePathname(b.pathname).id === req.params.id);
    if (!target) return res.status(404).json({ error: 'File not found' });

    await del(target.url);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Bulk delete — expects { ids: [...] } in the body
app.delete('/api/files', async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  if (!ids.length) return res.status(400).json({ error: 'No ids provided' });

  try {
    const blobs = await fetchAllBlobs();
    const idSet = new Set(ids);
    const targets = blobs.filter((b) => idSet.has(parsePathname(b.pathname).id));

    await Promise.all(targets.map((b) => del(b.url)));
    res.json({ ok: true, deleted: targets.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Bulk delete failed' });
  }
});

// Multer error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(500).json({ error: err.message });
  }
  next();
});

// Local dev: run a normal server. On Vercel, this file is used as a serverless function instead.
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`File Upload Manager running at http://localhost:${PORT}`));
}

module.exports = app;