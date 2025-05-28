import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/auth-utils";
import { parseIPA } from "@/lib/ipa-parser";
import { generateDownloadUrl } from "@/lib/minio";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { tmpdir } from "os";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; versionId: string }> }
) {
  try {
    const { slug, versionId } = await params;
    const user = await requireEditorOrAdmin();

    if (!user.activeOrganization) {
      return NextResponse.json(
        { error: "Aktif organizasyon bulunamadı" },
        { status: 400 }
      );
    }

    // Get app and version
    const app = await prisma.app.findFirst({
      where: {
        slug,
        organizationId: user.activeOrganization.id,
      },
    });

    if (!app || app.platform !== "IOS") {
      return NextResponse.json(
        { error: "iOS uygulaması bulunamadı" },
        { status: 404 }
      );
    }

    const version = await prisma.appVersion.findFirst({
      where: {
        id: versionId,
        appId: app.id,
      },
    });

    if (!version) {
      return NextResponse.json(
        { error: "Versiyon bulunamadı" },
        { status: 404 }
      );
    }

    // Download IPA file temporarily
    const tempFilePath = path.join(tmpdir(), `${versionId}.ipa`);

    try {
      // Generate download URL and fetch file
      const downloadUrl = await generateDownloadUrl(version.fileName, 3600);
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        throw new Error("Dosya indirilemedi");
      }

      const fileBuffer = await response.arrayBuffer();
      await writeFile(tempFilePath, Buffer.from(fileBuffer));

      // Parse IPA
      const ipaInfo = await parseIPA(tempFilePath);

      // Update app with iOS distribution info
      await prisma.app.update({
        where: { id: app.id },
        data: {
          iosDistributionType: ipaInfo.provisioningProfile?.isAdHoc
            ? "adhoc"
            : ipaInfo.provisioningProfile?.isDevelopment
            ? "development"
            : ipaInfo.provisioningProfile?.isEnterprise
            ? "enterprise"
            : "appstore",
          iosTeamId: ipaInfo.teamId,
          iosBundleId: ipaInfo.bundleId,
          iosMinimumVersion: ipaInfo.minimumOSVersion,
          iosSupportedDevices: JSON.stringify(ipaInfo.supportedDevices),
          iosProvisioningProfile: ipaInfo.provisioningProfile?.raw,
        },
      });

      return NextResponse.json({
        message: "IPA analizi tamamlandı",
        ipaInfo: {
          bundleId: ipaInfo.bundleId,
          appName: ipaInfo.appName,
          version: ipaInfo.version,
          buildNumber: ipaInfo.buildNumber,
          distributionType: ipaInfo.provisioningProfile?.isAdHoc
            ? "Ad Hoc"
            : ipaInfo.provisioningProfile?.isDevelopment
            ? "Development"
            : ipaInfo.provisioningProfile?.isEnterprise
            ? "Enterprise"
            : "App Store",
          teamId: ipaInfo.teamId,
          minimumOSVersion: ipaInfo.minimumOSVersion,
          supportedDevices: ipaInfo.supportedDevices,
          expirationDate: ipaInfo.provisioningProfile?.expirationDate,
          hasProvisioningProfile: !!ipaInfo.provisioningProfile,
          canCreateProfile:
            ipaInfo.provisioningProfile?.isAdHoc ||
            ipaInfo.provisioningProfile?.isDevelopment,
        },
      });
    } finally {
      // Clean up temp file
      try {
        await unlink(tempFilePath);
      } catch (error) {
        console.warn("Temp file cleanup failed:", error);
      }
    }
  } catch (error: any) {
    console.error("IPA analysis error:", error);
    return NextResponse.json(
      {
        error: error.message || "IPA analizi başarısız",
      },
      { status: 500 }
    );
  }
}
