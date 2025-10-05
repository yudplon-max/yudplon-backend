const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/images', (req, res) => {
    const files = fs.readdirSync('uploads/').filter(f => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.png') || f.toLowerCase().endsWith('.jpeg'));
    console.log('All files in uploads:', fs.readdirSync('uploads/'));
    console.log('Filtered images files:', files);
    res.json(files.map(f => `/uploads/${f}`));
});
app.get('/videos', (req, res) => {
    const files = fs.readdirSync('uploads/').filter(f => f.toLowerCase().endsWith('.mp4') || f.toLowerCase().endsWith('.avi'));
    console.log('All files in uploads:', fs.readdirSync('uploads/'));
    console.log('Filtered videos files:', files);
    res.json(files.map(f => `/uploads/${f}`));
});
app.get('/songs', (req, res) => {
    const files = fs.readdirSync('uploads/').filter(f => f.toLowerCase().endsWith('.mp3') || f.toLowerCase().endsWith('.wav'));
    console.log('All files in uploads:', fs.readdirSync('uploads/'));
    console.log('Filtered songs files:', files);
    res.json(files.map(f => `/uploads/${f}`));
});

const ADMIN_PASSWORD = 'mysecret123';

app.post('/upload/:type', upload.single('file'), (req, res) => {
    const { password } = req.body;
    console.log('Received password:', password);
    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'סיסמה שגויה!' });
    }
    const type = req.params.type;
    if (type === 'images' || type === 'videos' || type === 'songs') {
        if (req.file) {
            console.log('Upload success for:', req.file.filename);
            res.json({ success: true, file: req.file.filename });
        } else {
            res.status(400).json({ error: 'לא נבחר קובץ' });
        }
    } else {
        res.status(400).json({ error: 'סוג לא תקין' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});