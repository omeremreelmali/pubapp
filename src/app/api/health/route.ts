import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Database connection check
    await prisma.$queryRaw`SELECT 1`;

    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "PubApp",
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      checks: {
        database: "healthy",
        server: "healthy",
      },
      uptime: process.uptime(),
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    console.error("Health check failed:", error);

    const errorStatus = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      service: "PubApp",
      error: error instanceof Error ? error.message : "Unknown error",
      checks: {
        database: "unhealthy",
        server: "healthy",
      },
    };

    return NextResponse.json(errorStatus, { status: 503 });
  }
}
