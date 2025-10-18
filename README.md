# File Upload Application

A Node.js Express application with file upload functionality using FilePond and EJS templating.

## Features

- 📁 File upload with drag & drop support
- 🎨 Beautiful UI with FilePond integration
- 📂 Custom folder organization
- 🖼️ Image preview support
- ✅ File type validation
- 📊 Upload progress tracking
- 📋 List uploaded files by folder

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

1. Enter a folder name (or use the default)
2. Drag and drop files or click to browse
3. Files will be uploaded automatically
4. View uploaded files organized by folder

## Supported File Types

- Images: JPEG, JPG, PNG, GIF
- Documents: PDF, DOC, DOCX, TXT
- Archives: ZIP

## Configuration

- Port: 3000 (can be changed in server.js)
- Max file size: 10MB
- Max files per upload: 10
- Upload directory: ./uploads

## Project Structure

```
upload_file/
├── server.js          # Express server
├── package.json       # Dependencies
├── views/
│   └── index.ejs     # Frontend template
├── uploads/          # Uploaded files (created automatically)
└── README.md         # Documentation
```
