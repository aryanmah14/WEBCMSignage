require('dotenv').config();
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

console.log("Checking S3/MinIO Configuration...");
console.log("Endpoint:", process.env.MINIO_ENDPOINT);
console.log("Region:", process.env.AWS_REGION || 'us-east-1');
console.log("Bucket:", process.env.MINIO_BUCKET);
console.log("Access Key Length:", process.env.MINIO_ACCESS_KEY ? process.env.MINIO_ACCESS_KEY.length : 'MISSING');

const s3 = new S3Client({
    region: 'us-east-1',
    endpoint: process.env.MINIO_ENDPOINT.replace('https://', 'http://').replace('http://', 'http://') + ':9000', // Try port 9000
    forcePathStyle: true, // Crucial for MinIO usually
    credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY,
        secretAccessKey: process.env.MINIO_SECRET_KEY,
    },
});

console.log("Attempting to list buckets...");

const command = new ListBucketsCommand({});

s3.send(command)
    .then((data) => {
        console.log("SUCCESS: Connection established!");
        console.log("Buckets:", data.Buckets.map(b => b.Name));
    })
    .catch((err) => {
        console.error("FAILURE: Error connecting to S3/MinIO:");
        console.error(err);
    });
