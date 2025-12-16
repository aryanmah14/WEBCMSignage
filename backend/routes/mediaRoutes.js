const express = require('express');
const router = express.Router();
const multer = require('multer');
const AppDataSource = require('../config/data-source');

// Configure Multer for S3 Storage
// Configure Multer for Memory Storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

const UploaderService = require('../services/UploaderService');

// POST /upload-media
router.post('/upload-media', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const type = req.file.mimetype.startsWith('image/') ? 'image' : 'video';

        try {
            const { url, key } = await (type === 'image'
                ? UploaderService.uploadImage(req.file.buffer, req.file.originalname)
                : UploaderService.uploadFile(req.file.buffer, req.file.originalname));

            // Save to DB using TypeORM
            const mediaRepository = AppDataSource.getRepository("Media");
            const newMedia = mediaRepository.create({
                url,
                type,
                s3_key: key
            });
            const result = await mediaRepository.save(newMedia);

            res.status(201).json(result);
        } catch (uploadError) {
            console.error('Upload error:', uploadError);
            return res.status(500).json({ error: 'Failed to upload file to storage' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during upload' });
    }
});

// GET /media-list
router.get('/media-list', async (req, res) => {
    try {
        const mediaRepository = AppDataSource.getRepository("Media");
        const result = await mediaRepository.find({
            order: {
                created_at: "DESC"
            }
        });
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching media' });
    }
});

// DELETE /media/:id
router.delete('/media/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const mediaRepository = AppDataSource.getRepository("Media");
        const media = await mediaRepository.findOneBy({ id: parseInt(id) });

        if (!media) {
            return res.status(404).json({ error: 'Media not found' });
        }

        // Delete from S3/MinIO
        try {
            await UploaderService.deleteFile(media.s3_key);
            console.log('Deleted from storage successfully');
        } catch (storageErr) {
            console.error('Error deleting from storage:', storageErr);
            // Optionally decide if we should block DB deletion if storage deletion fails
            // For now, continuing since file might be already gone or accessible manually
        }

        // Delete from DB
        await mediaRepository.remove(media);

        res.json({ message: 'Media deleted successfully' });
    } catch (err) {
        console.error('Server error during deletion:', err);
        res.status(500).json({ error: 'Server error deleting media' });
    }
});

module.exports = router;
