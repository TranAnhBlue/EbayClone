const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const { upload } = require('../config/cloudinary');
const { strictRateLimiter } = require('../middleware/rateLimit.middleware');

// Upload a single image (áp dụng rate limit nghiêm ngặt)
router.post('/upload', strictRateLimiter, upload.single('image'), imageController.uploadImage);

// Upload multiple images (max 10) (áp dụng rate limit nghiêm ngặt)
router.post('/upload-multiple', strictRateLimiter, upload.array('images', 10), imageController.uploadMultipleImages);

// Delete an image (áp dụng rate limit nghiêm ngặt)
router.delete('/delete', strictRateLimiter, imageController.deleteImage);

module.exports = router; 