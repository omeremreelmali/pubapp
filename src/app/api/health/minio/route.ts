import { NextRequest, NextResponse } from "next/server";
import { minioClient, BUCKET_NAME } from "@/lib/minio";

export async function GET() {
  try {
    console.log("Environment check:", {
      MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
      MINIO_PORT: process.env.MINIO_PORT,
      MINIO_USE_SSL: process.env.MINIO_USE_SSL,
      NODE_ENV: process.env.NODE_ENV,
      BUCKET_NAME,
    });

    // Test MinIO connection
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    
    return NextResponse.json({
      status: "ok",
      minio: {
        connected: true,
        bucketExists,
        bucketName: BUCKET_NAME,
      },
      environment: {
        MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
        MINIO_PORT: process.env.MINIO_PORT,
        MINIO_USE_SSL: process.env.MINIO_USE_SSL,
        NODE_ENV: process.env.NODE_ENV,
      },
    });
  } catch (error: any) {
    console.error("MinIO health check error:", error);
    
    return NextResponse.json({
      status: "error",
      error: error.message,
      environment: {
        MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
        MINIO_PORT: process.env.MINIO_PORT,
        MINIO_USE_SSL: process.env.MINIO_USE_SSL,
        NODE_ENV: process.env.NODE_ENV,
      },
    }, { status: 500 });
  }
} 