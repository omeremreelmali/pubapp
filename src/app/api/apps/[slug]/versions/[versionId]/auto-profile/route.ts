import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; versionId: string }> }
) {
  try {
    const { slug, versionId } = await params;
    const user = await requireAuth();

    if (!user.activeOrganization) {
      return NextResponse.json(
        { error: "Aktif organizasyon bulunamadı" },
        { status: 400 }
      );
    }

    // Get app with iOS distribution info
    const app = await prisma.app.findFirst({
      where: {
        slug,
        organizationId: user.activeOrganization.id,
      },
    });

    const version = await prisma.appVersion.findFirst({
      where: {
        id: versionId,
        appId: app?.id,
      },
    });

    if (!app || !version || app.platform !== "IOS") {
      return NextResponse.json(
        { error: "iOS uygulaması bulunamadı" },
        { status: 404 }
      );
    }

    // IPA'dan çıkarılan bilgiler yoksa analiz et
    if (!app.iosDistributionType) {
      return NextResponse.json(
        {
          error:
            "IPA analizi yapılmamış. Önce 'IPA Analiz Et' butonuna tıklayın.",
        },
        { status: 400 }
      );
    }

    // App Store build'ler için Configuration Profile oluşturulamaz
    if (app.iosDistributionType === "appstore") {
      return NextResponse.json(
        {
          error:
            "App Store build'leri için Configuration Profile oluşturulamaz. TestFlight kullanın.",
        },
        { status: 400 }
      );
    }

    // Create download link
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const downloadLink = await prisma.downloadLink.create({
      data: {
        versionId: version.id,
        createdById: user.id,
        expiresAt,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const manifestUrl = `${baseUrl}/api/download/${downloadLink.token}/manifest`;

    // Generate automatic configuration profile
    const profileXML = generateAutoConfigurationProfile({
      appName: app.name,
      bundleId: app.iosBundleId || app.packageName,
      version: version.version,
      buildNumber: version.buildNumber,
      manifestUrl,
      organizationName: user.activeOrganization.name,
      distributionType: app.iosDistributionType,
      provisioningProfile: app.iosProvisioningProfile || undefined,
      teamId: app.iosTeamId || undefined,
      minimumOSVersion: app.iosMinimumVersion || undefined,
      supportedDevices: app.iosSupportedDevices
        ? JSON.parse(app.iosSupportedDevices)
        : ["iPhone"],
    });

    return new NextResponse(profileXML, {
      headers: {
        "Content-Type": "application/x-apple-aspen-config",
        "Content-Disposition": `attachment; filename="${app.slug}-auto-v${version.version}.mobileconfig"`,
      },
    });
  } catch (error: any) {
    console.error("Auto configuration profile error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}

interface AutoProfileConfig {
  appName: string;
  bundleId: string;
  version: string;
  buildNumber: number;
  manifestUrl: string;
  organizationName: string;
  distributionType: string;
  provisioningProfile?: string;
  teamId?: string;
  minimumOSVersion?: string;
  supportedDevices: string[];
}

function generateAutoConfigurationProfile(config: AutoProfileConfig): string {
  const profileUUID = generateUUID();
  let payloads = [];

  // 1. Provisioning Profile (if available and not App Store)
  if (config.provisioningProfile && config.distributionType !== "appstore") {
    payloads.push(`
        <dict>
            <key>PayloadDescription</key>
            <string>Provisioning Profile for ${config.appName}</string>
            <key>PayloadDisplayName</key>
            <string>${config.appName} Provisioning</string>
            <key>PayloadIdentifier</key>
            <string>${config.bundleId}.provisioning</string>
            <key>PayloadType</key>
            <string>com.apple.developer.provisioning-profile</string>
            <key>PayloadUUID</key>
            <string>${generateUUID()}</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>ProvisioningProfile</key>
            <data>${config.provisioningProfile}</data>
        </dict>`);
  }

  // 2. App Installation
  payloads.push(`
        <dict>
            <key>PayloadDescription</key>
            <string>Install ${config.appName} v${config.version}</string>
            <key>PayloadDisplayName</key>
            <string>${config.appName} Installer</string>
            <key>PayloadIdentifier</key>
            <string>${config.bundleId}.installer</string>
            <key>PayloadType</key>
            <string>com.apple.webClip.managed</string>
            <key>PayloadUUID</key>
            <string>${generateUUID()}</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>URL</key>
            <string>itms-services://?action=download-manifest&amp;url=${encodeURIComponent(
              config.manifestUrl
            )}</string>
            <key>Label</key>
            <string>${config.appName}</string>
            <key>IsRemovable</key>
            <true/>
        </dict>`);

  const distributionTypeText =
    {
      adhoc: "Ad Hoc Distribution",
      development: "Development Build",
      enterprise: "Enterprise Distribution",
      appstore: "App Store",
    }[config.distributionType] || "Unknown";

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>${payloads.join("")}
    </array>
    <key>PayloadDescription</key>
    <string>${
      config.appName
    } - Otomatik Kurulum Profili (${distributionTypeText})</string>
    <key>PayloadDisplayName</key>
    <string>${config.appName} Auto Install</string>
    <key>PayloadIdentifier</key>
    <string>${config.bundleId}.auto.profile</string>
    <key>PayloadOrganization</key>
    <string>${config.organizationName}</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>${profileUUID}</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
    <key>ConsentText</key>
    <dict>
        <key>default</key>
        <string>Bu profil ${
          config.appName
        } uygulamasını otomatik olarak cihazınıza kuracaktır.

📱 Uygulama: ${config.appName}
📦 Versiyon: ${config.version} (${config.buildNumber})
🔧 Dağıtım: ${distributionTypeText}
📋 Bundle ID: ${config.bundleId}
${config.teamId ? `👥 Team ID: ${config.teamId}` : ""}
${config.minimumOSVersion ? `📱 Min iOS: ${config.minimumOSVersion}` : ""}
🎯 Desteklenen: ${config.supportedDevices.join(", ")}

IPA dosyasından otomatik olarak çıkarılan bilgiler kullanılmıştır.</string>
    </dict>
</dict>
</plist>`;
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
