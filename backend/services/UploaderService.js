const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const { v4: uuid } = require('uuid');
const mime = require('mime-types');

class UploaderService {
    constructor() {
        console.log('[Storage] Initializing S3 Client...');
        const endpoint = process.env.MINIO_ENDPOINT;
        const accessKeyId = process.env.MINIO_ACCESS_KEY;
        const secretAccessKey = process.env.MINIO_SECRET_KEY;

        if (!endpoint || !accessKeyId || !secretAccessKey) {
            console.error('[Storage] Missing credentials:', {
                endpoint: !!endpoint,
                accessKey: !!accessKeyId,
                secretKey: !!secretAccessKey
            });
            throw new Error('MinIO credentials (ENDPOINT, ACCESS_KEY, or SECRET_KEY) not configured');
        }

        this.s3Client = new S3Client({
            region: 'us-east-1',
            endpoint: endpoint,
            forcePathStyle: true,
            credentials: {
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey,
            },
        });
        console.log('[Storage] S3 Client Initialized for endpoint:', endpoint);
    }

    async uploadImage(buffer, originalName, folder = 'reports') {
        const fileExtension = path.extname(originalName);
        const fileName = `${uuid()}${fileExtension}`;
        return this.uploadToMinIO(buffer, fileName, folder);
    }

    async uploadFile(buffer, originalName, folder = 'files') {
        const fileExtension = path.extname(originalName);
        const fileName = `${uuid()}${fileExtension}`;
        return this.uploadToMinIO(buffer, fileName, folder);
    }

    async uploadToMinIO(buffer, fileName, folder) {
        const key = `${folder}/${fileName}`;
        const bucket = process.env.MINIO_BUCKET;

        if (!bucket) {
            throw new Error('MinIO bucket not configured');
        }

        const contentType = mime.lookup(fileName) || 'application/octet-stream';

        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ACL: 'public-read',
            ContentType: contentType,
        });

        await this.s3Client.send(command);

        return {
            url: `${process.env.MINIO_ENDPOINT}/${bucket}/${key}`,
            key: key
        };
    }

    async deleteFile(key) {
        const bucket = process.env.MINIO_BUCKET;
        if (!bucket) {
            throw new Error('MinIO bucket not configured');
        }

        const command = new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        });

        await this.s3Client.send(command);
    }
}

module.exports = new UploaderService();
