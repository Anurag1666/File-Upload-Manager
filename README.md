# The Depository — File Upload Manager

Full-stack file upload manager: drag-and-drop uploads, search, download, and delete — all running on your own machine.

## Stack

- **Backend:** Node.js + Express + Multer (handles multipart uploads, stores files on disk in `/uploads`, metadata in `data/files.json`)
- **Frontend:** React (built with Vite), compiled to static files and served by Express

## Features

- Drag-and-drop or click-to-browse upload, multiple files at once
- Live per-file progress bar during upload
- Search/filter files by name
- Download any stored file
- Delete files (removes both the disk file and its metadata)
- Live stats: total files held, total size
- Responsive layout (works on mobile)

## Project structure

```
file-upload-manager/
├── server.js              # Express API (upload / list / download / delete / stats)
├── package.json            # backend dependencies
├── data/
│   └── files.json          # metadata store (auto-created)
├── uploads/                 # uploaded files live here (auto-created)
├── public/                  # React production build — served as static files
└── client/                  # React source (Vite)
    ├── index.html
    ├── vite.config.js
    ├── package.json         # frontend dependencies
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── components/
        │   ├── Sidebar.jsx
        │   ├── Dropzone.jsx
        │   ├── UploadQueue.jsx
        │   ├── FileList.jsx
        │   └── Toast.jsx
        └── utils/
            ├── api.js
            └── format.js
```

## Setup (production — one server, one port)

Requires Node.js 18+.

```bash
# 1. Install and build the React frontend
cd client
npm install
npm run build      # outputs into ../public

# 2. Install and run the backend (serves the built frontend + the API)
cd ..
npm install
npm start
```

Open **http://localhost:4000** — the React app and the API are both served from here.

## Setup (development — hot reload)

Run backend and frontend separately. The Vite dev server proxies `/api` calls to Express automatically (see `client/vite.config.js`).

```bash
# terminal 1 — backend
npm install
npm start                 # http://localhost:4000

# terminal 2 — frontend with hot reload
cd client
npm install
npm run dev                # http://localhost:5173
```

Work on the UI at `http://localhost:5173`; it talks to the same backend. When you're done, run `npm run build` inside `client/` to refresh the `public/` folder Express serves in production.

## API reference

| Method | Route                     | Description                          |
|--------|----------------------------|---------------------------------------|
| POST   | `/api/upload`              | Upload files (field name: `files`, up to 20 at once, 50MB each) |
| GET    | `/api/files`                | List files (optional `?search=term`) |
| GET    | `/api/files/:id/download`   | Download a file by id                |
| DELETE | `/api/files/:id`            | Delete a file by id                  |
| GET    | `/api/stats`                | File count + total size              |

## Notes / things you may want to change

- Metadata is stored in a flat JSON file for simplicity — swap in SQLite/Postgres/Mongo if you need concurrent-write safety or scale.
- There's no authentication — add a login layer before exposing this beyond localhost.
- Max file size (50MB) and max files per upload (20) are set in `server.js` and easy to adjust.
- If you change ports, update the proxy target in `client/vite.config.js`.
