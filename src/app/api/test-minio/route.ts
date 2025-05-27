import { NextRequest, NextResponse } from "next/server";
import { minioClient, BUCKET_NAME, initializeBucket } from "@/lib/minio";

export async function GET(request: NextRequest) {
  try {
    console.log("Testing MinIO connection...");

    // Test bucket existence
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    console.log(`Bucket ${BUCKET_NAME} exists:`, bucketExists);

    if (!bucketExists) {
      console.log("Creating bucket...");
      await initializeBucket();
    }

    // List objects in bucket
    const objects: any[] = [];
    const stream = minioClient.listObjects(BUCKET_NAME, "", true);

    for await (const obj of stream) {
      objects.push(obj);
    }

    return NextResponse.json({
      success: true,
      bucketExists,
      bucketName: BUCKET_NAME,
      objectCount: objects.length,
      objects: objects.slice(0, 10), // First 10 objects
    });
  } catch (error: any) {
    console.error("MinIO test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
