import { Client } from "minio";

export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
});

export const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "pubapp-files";

// Initialize bucket if it doesn't exist
export async function initializeBucket() {
  try {
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET_NAME, "us-east-1");
      console.log(`Bucket ${BUCKET_NAME} created successfully`);
    }
  } catch (error) {
    console.error("Error initializing bucket:", error);
  }
}

// Generate pre-signed URL for file upload
export async function generateUploadUrl(fileName: string, contentType: string) {
  try {
    const policy = minioClient.newPostPolicy();
    policy.setBucket(BUCKET_NAME);
    policy.setKey(fileName);
    policy.setContentType(contentType);
    policy.setExpires(new Date(Date.now() + 24 * 60 * 60 * 1000)); // 24 hours

    const { postURL, formData } = await minioClient.presignedPostPolicy(policy);
    return { postURL, formData };
  } catch (error) {
    console.error("Error generating upload URL:", error);
    throw error;
  }
}

// Generate pre-signed URL for file download
export async function generateDownloadUrl(
  fileName: string,
  expirySeconds = 3600
) {
  try {
    const url = await minioClient.presignedGetObject(
      BUCKET_NAME,
      fileName,
      expirySeconds
    );
    return url;
  } catch (error) {
    console.error("Error generating download URL:", error);
    throw error;
  }
}

// Upload file directly
export async function uploadFile(
  fileName: string,
  fileBuffer: Buffer,
  contentType: string
) {
  try {
    const result = await minioClient.putObject(
      BUCKET_NAME,
      fileName,
      fileBuffer,
      fileBuffer.length,
      {
        "Content-Type": contentType,
      }
    );
    return result;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

// Delete file
export async function deleteFile(fileName: string) {
  try {
    await minioClient.removeObject(BUCKET_NAME, fileName);
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

// Get file info
export async function getFileInfo(fileName: string) {
  try {
    const stat = await minioClient.statObject(BUCKET_NAME, fileName);
    return stat;
  } catch (error) {
    console.error("Error getting file info:", error);
    throw error;
  }
}
