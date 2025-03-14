const Minio = require("minio");

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || "localhost", // Replace with your MinIO server URL
    port: parseInt(process.env.MINIO_PORT) || 9000,      // Default MinIO port
    useSSL: false,  // Set to `true` if MinIO uses SSL
    accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY || "minioadmin"
});

const bucketName = "client-files"; // Change as per your MinIO bucket name

// ✅ Ensure Bucket Exists (Create if not exists)
async function ensureBucketExists() {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
        await minioClient.makeBucket(bucketName, "us-east-1");
    }
}

ensureBucketExists().catch(console.error);

module.exports = { minioClient, bucketName };
