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
    let currentPhase = 'Initialization';
    try {
        if (!AppDataSource.isInitialized) {
            return res.status(500).json({
                error: 'Database source is not initialized',
                phase: currentPhase,
                details: 'Check your DB connection settings.'
            });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded', phase: 'Validation' });
        }

        const type = req.file.mimetype.startsWith('image/') ? 'image' : 'video';

        currentPhase = 'Storage Upload';
        console.log(`[Upload] Starting phase: ${currentPhase} for file: ${req.file.originalname}`);

        const { url, key } = await (type === 'image'
            ? UploaderService.uploadImage(req.file.buffer, req.file.originalname)
            : UploaderService.uploadFile(req.file.buffer, req.file.originalname));

        currentPhase = 'Database Save';
        console.log(`[Upload] Starting phase: ${currentPhase}`);

        const mediaRepository = AppDataSource.getRepository("Media");
        const newMedia = mediaRepository.create({
            url,
            type,
            s3_key: key,
            is_enabled: true
        });
        const result = await mediaRepository.save(newMedia);

        console.log('[Upload] Success');
        res.status(201).json(result);
    } catch (err) {
        console.error(`[Upload] Failed during phase: ${currentPhase}`);
        console.error(err);
        res.status(500).json({
            error: 'Server error during upload',
            phase: currentPhase,
            message: err.message,
            code: err.code || 'UNKNOWN_ERROR',
            timestamp: new Date().toISOString()
        });
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

// GET /media/:id
router.get('/media/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const mediaRepository = AppDataSource.getRepository("Media");
        const media = await mediaRepository.findOneBy({ id: parseInt(id) });

        if (!media) {
            return res.status(404).json({ error: 'Media not found' });
        }

        res.json(media);
    } catch (err) {
        console.error('Server error fetching media by ID:', err);
        res.status(500).json({ error: 'Server error fetching media' });
    }
});

// DELETE /media/:id
router.delete('/media/:id', async (req, res) => {
    const { id } = req.params;
    let currentPhase = 'Initialization';
    try {
        const mediaRepository = AppDataSource.getRepository("Media");
        const media = await mediaRepository.findOneBy({ id: parseInt(id) });

        if (!media) {
            return res.status(404).json({ error: 'Media not found', phase: 'Validation' });
        }

        currentPhase = 'Storage Deletion';
        console.log(`[Delete] Starting phase: ${currentPhase} for key: ${media.s3_key}`);
        await UploaderService.deleteFile(media.s3_key);

        currentPhase = 'Database Deletion';
        console.log(`[Delete] Starting phase: ${currentPhase}`);
        await mediaRepository.remove(media);

        console.log('[Delete] Success');
        res.json({ message: 'Media deleted successfully' });
    } catch (err) {
        console.error(`[Delete] Failed during phase: ${currentPhase}`);
        console.error(err);
        res.status(500).json({
            error: 'Server error during deletion',
            phase: currentPhase,
            message: err.message,
            code: err.code || 'UNKNOWN_ERROR',
            timestamp: new Date().toISOString()
        });
    }
});

// PATCH /media/:id/toggle
router.patch('/media/:id/toggle', async (req, res) => {
    const { id } = req.params;
    try {
        const mediaRepository = AppDataSource.getRepository("Media");
        const media = await mediaRepository.findOneBy({ id: parseInt(id) });

        if (!media) {
            return res.status(404).json({ error: 'Media not found' });
        }

        media.is_enabled = !media.is_enabled;
        const result = await mediaRepository.save(media);

        res.json(result);
    } catch (err) {
        console.error('Server error toggling media status:', err);
        res.status(500).json({ error: 'Server error toggling status' });
    }
});

module.exports = router;
