# File Upload Manager

A full-stack file upload manager with drag-and-drop uploads, search, download, and delete functionality — running locally on your machine.

## Tech Stack

* **Backend:** Node.js, Express, and Multer
  Handles multipart file uploads, stores uploaded files on disk in `/uploads`, and stores file metadata in `data/files.json`.

* **Frontend:** React with Vite
  The production build is compiled into static files and served by Express.

## Features

* Drag-and-drop or click-to-browse file uploads
* Multiple file uploads at once
* Live per-file upload progress
* Search and filter files by name
* Download stored files
* Delete files and their associated metadata
* Live statistics for total files and storage usage
* Responsive UI for desktop and mobile

## Project Structure

```text
file-upload-manager/
├── server.js              # Express API and server
├── package.json           # Backend dependencies and scripts
├── data/
│   └── files.json         # File metadata store
├── uploads/               # Uploaded files
├── public/                # React production build
└── client/                # React/Vite source
    ├── index.html
    ├── vite.config.js
    ├── package.json
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

## Setup

### Prerequisites

* Node.js 18 or later
* npm

### Production

Install and build the React frontend:

```bash
cd client
npm install
npm run build
```

Install and start the backend:

```bash
cd ..
npm install
npm start
```

Open **http://localhost:4000** in your browser.

The Express server serves both the React frontend and the API.

### Development

Run the backend:

```bash
npm install
npm start
```

In a second terminal, run the frontend:

```bash
cd client
npm install
npm run dev
```

The development frontend runs at **http://localhost:5173** and proxies API requests to the Express backend.

After making frontend changes, run:

```bash
npm run build
```

inside the `client` directory to update the production build.

## API Reference

| Method | Route                     | Description                                                                     |
| ------ | ------------------------- | ------------------------------------------------------------------------------- |
| POST   | `/api/upload`             | Upload files. Supports up to 20 files per request, with a 50 MB limit per file. |
| GET    | `/api/files`              | List uploaded files. Supports optional `?search=term`.                          |
| GET    | `/api/files/:id/download` | Download a file by ID.                                                          |
| DELETE | `/api/files/:id`          | Delete a file by ID.                                                            |
| GET    | `/api/stats`              | Get total file count and storage size.                                          |

## Limitations & Future Improvements

* File metadata is stored in a JSON file for simplicity. For production-scale or concurrent usage, a database such as SQLite, PostgreSQL, or MongoDB could be used.
* Authentication is not currently implemented. A login and authorization layer should be added before exposing the application beyond a trusted local environment.
* The maximum file size is 50 MB and the maximum number of files per upload is 20. These limits can be configured in `server.js`.
* If the backend port is changed, update the proxy target in `client/vite.config.js`.

## License

This project was created as a full-stack development assignment.
efore exposing this beyond localhost.
- Max file size (50MB) and max files per upload (20) are set in `server.js` and easy to adjust.
- If you change ports, update the proxy target in `client/vite.config.js`.
