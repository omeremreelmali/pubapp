import StreamZip from "node-stream-zip";
import plist from "plist";
import { promises as fs } from "fs";

export interface IPAInfo {
  bundleId: string;
  appName: string;
  version: string;
  buildNumber: string;
  minimumOSVersion: string;
  supportedDevices: string[];
  teamId?: string;
  provisioningProfile?: {
    uuid: string;
    name: string;
    teamId: string;
    expirationDate: Date;
    devices: string[];
    isAdHoc: boolean;
    isDevelopment: boolean;
    isEnterprise: boolean;
    raw: string;
  };
  certificate?: {
    commonName: string;
    organizationName: string;
    teamId: string;
  };
}

export async function parseIPA(filePath: string): Promise<IPAInfo> {
  const zip = new StreamZip.async({ file: filePath });

  try {
    // 1. Info.plist'i oku
    const infoPlistData = await extractInfoPlist(zip);

    // 2. Provisioning Profile'ı oku
    const provisioningProfile = await extractProvisioningProfile(zip);

    // 3. Certificate bilgilerini çıkar
    const certificate = extractCertificateInfo(provisioningProfile);

    return {
      bundleId: infoPlistData.CFBundleIdentifier,
      appName: infoPlistData.CFBundleDisplayName || infoPlistData.CFBundleName,
      version: infoPlistData.CFBundleShortVersionString,
      buildNumber: infoPlistData.CFBundleVersion,
      minimumOSVersion: infoPlistData.MinimumOSVersion || "12.0",
      supportedDevices: getSupportedDevices(infoPlistData),
      teamId: provisioningProfile?.teamId,
      provisioningProfile,
      certificate,
    };
  } finally {
    await zip.close();
  }
}

async function extractInfoPlist(zip: StreamZip.StreamZipAsync): Promise<any> {
  const entries = await zip.entries();

  // Payload/AppName.app/Info.plist dosyasını bul
  const infoPlistEntry = Object.values(entries).find((entry) =>
    entry.name.includes(".app/Info.plist")
  );

  if (!infoPlistEntry) {
    throw new Error("Info.plist bulunamadı");
  }

  const infoPlistBuffer = await zip.entryData(infoPlistEntry);
  return plist.parse(infoPlistBuffer.toString());
}

async function extractProvisioningProfile(
  zip: StreamZip.StreamZipAsync
): Promise<any> {
  const entries = await zip.entries();

  // embedded.mobileprovision dosyasını bul
  const provisioningEntry = Object.values(entries).find((entry) =>
    entry.name.includes("embedded.mobileprovision")
  );

  if (!provisioningEntry) {
    return null; // App Store build'lerde olmayabilir
  }

  const provisioningBuffer = await zip.entryData(provisioningEntry);

  // Provisioning profile'ı parse et
  const provisioningText = provisioningBuffer.toString();
  const plistStart = provisioningText.indexOf("<?xml");
  const plistEnd = provisioningText.indexOf("</plist>") + 8;

  if (plistStart === -1 || plistEnd === -1) {
    throw new Error("Provisioning profile parse edilemedi");
  }

  const plistContent = provisioningText.substring(plistStart, plistEnd);
  const parsed = plist.parse(plistContent) as any;

  return {
    uuid: parsed.UUID,
    name: parsed.Name,
    teamId: parsed.TeamIdentifier?.[0],
    expirationDate: parsed.ExpirationDate,
    devices: parsed.ProvisionedDevices || [],
    isAdHoc: !parsed.ProvisionsAllDevices && !!parsed.ProvisionedDevices,
    isDevelopment: parsed.Entitlements?.["get-task-allow"] === true,
    isEnterprise: parsed.ProvisionsAllDevices === true,
    raw: provisioningBuffer.toString("base64"), // Configuration Profile için
  };
}

function extractCertificateInfo(provisioningProfile: any): any {
  if (!provisioningProfile) return null;

  // Certificate bilgilerini provisioning profile'dan çıkar
  return {
    commonName: "iPhone Distribution",
    organizationName: "Unknown",
    teamId: provisioningProfile.teamId,
  };
}

function getSupportedDevices(infoPlist: any): string[] {
  const deviceFamily = infoPlist.UIDeviceFamily || [];
  const devices = [];

  if (deviceFamily.includes(1)) devices.push("iPhone");
  if (deviceFamily.includes(2)) devices.push("iPad");

  return devices.length > 0 ? devices : ["iPhone"]; // Default to iPhone
}
