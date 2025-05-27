import { v4 as uuidv4 } from "uuid";

// Allowed file types for mobile apps
export const ALLOWED_FILE_TYPES = {
  ANDROID: [
    "application/vnd.android.package-archive", // .apk
    "application/octet-stream", // .aab (sometimes detected as octet-stream)
  ],
  IOS: [
    "application/octet-stream", // .ipa
  ],
};

// File extensions
export const ALLOWED_EXTENSIONS = {
  ANDROID: [".apk", ".aab"],
  IOS: [".ipa"],
};

// Maximum file size (100MB)
export const MAX_FILE_SIZE = 100 * 1024 * 1024;

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateFile(
  file: File,
  platform: "ANDROID" | "IOS"
): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `Dosya boyutu ${MAX_FILE_SIZE / (1024 * 1024)}MB'dan büyük olamaz`,
    };
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const allowedExtensions = ALLOWED_EXTENSIONS[platform];
  const hasValidExtension = allowedExtensions.some((ext) =>
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      isValid: false,
      error: `${platform} için geçerli dosya formatları: ${allowedExtensions.join(
        ", "
      )}`,
    };
  }

  // Check MIME type (less reliable for mobile apps)
  const allowedTypes = ALLOWED_FILE_TYPES[platform];
  if (!allowedTypes.includes(file.type) && file.type !== "") {
    console.warn(`Unexpected MIME type: ${file.type} for file: ${file.name}`);
  }

  return { isValid: true };
}

export function generateFileName(
  originalName: string,
  appId: string,
  version: string
): string {
  const extension = originalName.substring(originalName.lastIndexOf("."));
  const timestamp = Date.now();
  const uuid = uuidv4().substring(0, 8);

  return `apps/${appId}/versions/${version}/${timestamp}-${uuid}${extension}`;
}

export function formatFileSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}

export function getFileExtension(fileName: string): string {
  return fileName.substring(fileName.lastIndexOf("."));
}

export function isValidVersionFormat(version: string): boolean {
  const semverRegex = /^\d+\.\d+\.\d+$/;
  return semverRegex.test(version);
}

export function compareVersions(a: string, b: string): number {
  const aParts = a.split(".").map(Number);
  const bParts = b.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    if (aParts[i] > bParts[i]) return 1;
    if (aParts[i] < bParts[i]) return -1;
  }

  return 0;
}

export function extractAppInfo(fileName: string) {
  // This is a placeholder - in a real app, you might want to
  // extract metadata from APK/IPA files using specialized libraries
  return {
    version: null,
    buildNumber: null,
    packageName: null,
  };
}
