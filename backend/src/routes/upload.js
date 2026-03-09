const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { protect } = require('../middlewares/authMiddleware');
const stream = require('stream');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', protect, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file provided' });
  }

  // Determine resource type and folder based on mimetype
  const isPdfOrDoc = req.file.mimetype === 'application/pdf' || req.file.mimetype.includes('document');
  const resourceType = isPdfOrDoc ? 'raw' : 'image';
  const folder = isPdfOrDoc ? 'devconnect_resumes' : 'devconnect_avatars';

  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: folder, resource_type: resourceType },
    (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ message: 'Upload failed' });
      }
      res.json({
        message: 'File uploaded successfully',
        url: result.secure_url,
      });
    }
  );

  const bufferStream = new stream.PassThrough();
  bufferStream.end(req.file.buffer);
  bufferStream.pipe(uploadStream);
});

module.exports = router;
