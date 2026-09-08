const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 4000;

const UPLOAD_DIR = path.join(__dirname, 'uploads');
const DB_FILE = path.join(__dirname, 'data', 'files.json');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB per file

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(path.dirname(DB_FILE))) fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]');

function readDb() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (e) {
    return [];
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Multer setup ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const id = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${id}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE }
});

// --- Routes ---

// Upload one or more files
app.post('/api/upload', upload.array('files', 20), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files received' });
  }

  const db = readDb();
  const uploaded = req.files.map((f) => {
    const entry = {
      id: path.parse(f.filename).name,
      originalName: f.originalname,
      storedName: f.filename,
      size: f.size,
      mimetype: f.mimetype,
      uploadedAt: new Date().toISOString()
    };
    db.push(entry);
    return entry;
  });

  writeDb(db);
  res.status(201).json({ files: uploaded });
});

// List files (optional ?search=term)
app.get('/api/files', (req, res) => {
  const db = readDb();
  const search = (req.query.search || '').toLowerCase();
  const filtered = search
    ? db.filter((f) => f.originalName.toLowerCase().includes(search))
    : db;
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
  );
  res.json({ files: sorted });
});

// Stats
app.get('/api/stats', (req, res) => {
  const db = readDb();
  const totalSize = db.reduce((sum, f) => sum + f.size, 0);
  res.json({ count: db.length, totalSize });
});

// Download a file
app.get('/api/files/:id/download', (req, res) => {
  const db = readDb();
  const entry = db.find((f) => f.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'File not found' });

  const filePath = path.join(UPLOAD_DIR, entry.storedName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File missing on disk' });
  }
  res.download(filePath, entry.originalName);
});

// Delete a file
app.delete('/api/files/:id', (req, res) => {
  const db = readDb();
  const idx = db.findIndex((f) => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'File not found' });

  const entry = db[idx];
  const filePath = path.join(UPLOAD_DIR, entry.storedName);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  db.splice(idx, 1);
  writeDb(db);
  res.json({ ok: true });
});

// Multer error handler (e.g. file too large)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(500).json({ error: err.message });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`File Upload Manager running at http://localhost:${PORT}`);
});
