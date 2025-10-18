const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Set UTF-8 encoding for file system operations
process.env.NODE_OPTIONS = '--preserve-unicode';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Folder name will be set dynamically in the route
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Keep original filename with proper UTF-8 encoding
        // Decode the filename properly to handle Thai and other Unicode characters
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, originalName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 20 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept images, documents, etc.
        const allowedTypes = /.*/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, PDFs, documents, and zip files are allowed.'));
        }
    }
});

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ charset: 'utf-8' }));

// Set proper headers for UTF-8 encoding
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    next();
});

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

// Handle file upload with custom folder
app.post('/upload', upload.array('files', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const folderName = req.body.folderName || 'default';
        const targetFolder = path.join(uploadsDir, folderName);

        // Create folder if it doesn't exist
        if (!fs.existsSync(targetFolder)) {
            fs.mkdirSync(targetFolder, { recursive: true });
        }

        // Move files to the target folder
        const uploadedFiles = [];
        req.files.forEach(file => {
            // Properly decode Thai and Unicode filenames
            const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
            const newPath = path.join(targetFolder, originalName);
            
            // If file exists, add a number suffix
            let finalPath = newPath;
            let counter = 1;
            while (fs.existsSync(finalPath)) {
                const ext = path.extname(originalName);
                const nameWithoutExt = path.basename(originalName, ext);
                finalPath = path.join(targetFolder, `${nameWithoutExt} (${counter})${ext}`);
                counter++;
            }
            
            fs.renameSync(file.path, finalPath);
            
            uploadedFiles.push({
                filename: path.basename(finalPath),
                originalname: originalName,
                size: file.size,
                path: finalPath,
                folder: folderName
            });
        });

        res.json({
            success: true,
            message: `Files uploaded successfully to folder: ${folderName}`,
            files: uploadedFiles
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get list of uploaded files
app.get('/files', (req, res) => {
    try {
        const folders = fs.readdirSync(uploadsDir);
        const fileList = {};

        folders.forEach(folder => {
            const folderPath = path.join(uploadsDir, folder);
            if (fs.statSync(folderPath).isDirectory()) {
                fileList[folder] = fs.readdirSync(folderPath);
            }
        });

        res.json(fileList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete folder endpoint
app.delete('/folder/:folderName', (req, res) => {
    try {
        const folderName = req.params.folderName;
        const folderPath = path.join(uploadsDir, folderName);

        // Security check: ensure folder is within uploads directory
        if (!folderPath.startsWith(uploadsDir)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!fs.existsSync(folderPath)) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        if (!fs.statSync(folderPath).isDirectory()) {
            return res.status(400).json({ error: 'Not a folder' });
        }

        // Remove folder and all its contents
        fs.rmSync(folderPath, { recursive: true, force: true });

        res.json({
            success: true,
            message: `Folder "${folderName}" deleted successfully`
        });
    } catch (error) {
        console.error('Delete folder error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
