const express = require('express');
const multer = require('multer');
const cors = require('cors');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();

// 1. FIX: Open CORS so Render doesn't block you
app.use(cors()); 
app.use(express.json());

// 2. FIX: Ensure Database name matches what your Dashboard expects
const mongoURI = "mongodb+srv://muhammad-232:8mAxErO8@project54.qob470d.mongodb.net/FatimaPortal?retryWrites=true&w=majority&appName=Project54";

mongoose.connect(mongoURI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("DB Error:", err));

const Log = mongoose.model('Log', new mongoose.Schema({
    timestamp: { type: String, default: () => new Date().toLocaleString() },
    location: String,
    videoUrl: String
}));

// 3. FIX: API Secret must be EXACT
cloudinary.config({
  cloud_name: 'djyvjemkj',
  api_key: '698248822319277',
  api_secret: 'N3MZbaocx903npocWIOH60YPWc' 
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: { 
      folder: 'fatima_portal_records', 
      resource_type: 'video',
      format: 'webm' // Force format to ensure playback
  },
});
const upload = multer({ storage: storage });

app.post('/upload', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No video file received");
        }
        const newEntry = new Log({
            location: `Lat: ${req.body.lat}, Long: ${req.body.long}`,
            videoUrl: req.file.path 
        });
        await newEntry.save();
        res.status(200).send({ message: "Success" });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).send("Upload Failed");
    }
});

app.get('/data', async (req, res) => {
    const logs = await Log.find().sort({ _id: -1 });
    res.json(logs);
});

app.get('/', (req, res) => res.send("System Online"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on ${PORT}`));
