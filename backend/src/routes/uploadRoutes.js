const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'devconnect_avatars',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  },
});

const upload = multer({ storage: storage });

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Public (or Private depending on your auth strategy)
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No image uploaded');
  }
  
  // Return the secure URL from Cloudinary
  res.status(200).json({
    message: 'Image uploaded successfully',
    url: req.file.path,
  });
});

module.exports = router;
