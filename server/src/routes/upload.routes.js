const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { protect } = require('../middleware/auth.middleware');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ignitionx/campaigns',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 675, crop: 'fill', quality: 'auto' }],
  },
});

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ignitionx/pitches',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'webm'],
  },
});

const uploadImage = multer({ storage: imageStorage, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadVideo = multer({ storage: videoStorage, limits: { fileSize: 200 * 1024 * 1024 } });

router.post('/image', protect, uploadImage.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });
  res.json({
    success: true,
    url: req.file.path,
    publicId: req.file.filename,
  });
});

router.post('/video', protect, uploadVideo.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No video uploaded' });
  res.json({
    success: true,
    url: req.file.path,
    publicId: req.file.filename,
    thumbnail: req.file.path.replace('/upload/', '/upload/so_0,f_jpg/'),
  });
});

router.delete('/image/:publicId', protect, async (req, res) => {
  try {
    await cloudinary.uploader.destroy(req.params.publicId);
    res.json({ success: true, message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
});

module.exports = router;
