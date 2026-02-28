const express = require('express');
const multer = require('multer');
const cors = require('cors');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
app.use(cors()); // Allows Repo_A to talk to this server
app.use(express.json());

// 1. DATABASE CONNECTION
const mongoURI = "mongodb+srv://muhammad-232:8mAxErO8@project54.qob470d.mongodb.net/FatimaPortal?retryWrites=true&w=majority&appName=Project54";

mongoose.connect(mongoURI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Error:", err));

const Log = mongoose.model('Log', new mongoose.Schema({
    timestamp: { type: String, default: () => new Date().toLocaleString() },
    location: String,
    videoUrl: String
}));

// 2. CLOUDINARY CONFIG
cloudinary.config({
  cloud_name: 'djyvjemkj',
  api_key: '698248822319277',
  api_secret: 'N3MZbaocx9O3npocWIOH60YPWEc'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: { 
    folder: 'fatima_portal_records', 
    resource_type: 'video',
    format: 'webm' 
  },
});
const upload = multer({ storage: storage });

// 3. ROUTES
app.post('/upload', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send("No video file received");

        const newEntry = new Log({
            location: `Lat: ${req.body.lat}, Long: ${req.body.long}`,
            videoUrl: req.file.path // This is the actual video URL from Cloudinary
        });
        await newEntry.save();
        res.status(200).json({ message: "Video Saved!" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error during upload");
    }
});

app.get('/data', async (req, res) => {
    const logs = await Log.find().sort({ _id: -1 });
    res.json(logs);
});

app.get('/', (req, res) => res.send("Video Server is Live"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
