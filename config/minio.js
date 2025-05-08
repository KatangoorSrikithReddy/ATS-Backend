const Minio = require("minio");

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT, // Replace with your MinIO server URL
    port: parseInt(process.env.MINIO_PORT) ,    // Default MinIO port
    useSSL: false,  // Set to `true` if MinIO uses SSL
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});

const bucketName =process.env.CLIENT_BUCKET_NAME; // Change as per your MinIO bucket name

// ✅ Ensure Bucket Exists (Create if not exists)
async function ensureBucketExists() {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
        await minioClient.makeBucket(bucketName, "us-east-1");
    }
}

ensureBucketExists().catch(console.error);

module.exports = { minioClient, bucketName };
