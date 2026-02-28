const express = require('express');
const multer = require('multer');
const cors = require('cors');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. MONGODB CONNECTION ---
const mongoURI = "mongodb+srv://muhammad-232:8mAxErO8@project54.qob470d.mongodb.net/FatimaPortal?retryWrites=true&w=majority&appName=Project54";

mongoose.connect(mongoURI)
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch(err => console.error("MongoDB Connection Error:", err));

const Log = mongoose.model('Log', new mongoose.Schema({
    timestamp: { type: String, default: () => new Date().toLocaleString() },
    location: String,
    videoUrl: String
}));

// --- 2. CLOUDINARY CONFIGURATION ---
cloudinary.config({
  cloud_name: 'djyvjemkj',
  api_key: '698248822319277',
  api_secret: 'N3MZbaocx903npocWIOH60YPWc'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: { folder: 'fatima_portal_records', resource_type: 'video' },
});
const upload = multer({ storage: storage });

// --- 3. API ROUTES ---
app.post('/upload', upload.single('video'), async (req, res) => {
    try {
        const newEntry = new Log({
            location: `Lat: ${req.body.lat}, Long: ${req.body.long}`,
            videoUrl: req.file.path // The permanent link from Cloudinary
        });
        await newEntry.save();
        res.status(200).send({ message: "Data Secured Permanently" });
    } catch (error) {
        res.status(500).send("Upload Failed");
    }
});

app.get('/data', async (req, res) => {
    const logs = await Log.find().sort({ _id: -1 });
    res.json(logs);
});

const PORT = process.env.PORT || 3000;
// Add this to your server.js
app.get('/', (req, res) => {
    res.send("Love Portal Backend is Online and Ready! ❤️");
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
