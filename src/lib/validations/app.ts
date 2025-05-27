import * as yup from "yup";

export const createAppSchema = yup.object({
  name: yup
    .string()
    .min(2, "Uygulama adı en az 2 karakter olmalıdır")
    .max(50, "Uygulama adı en fazla 50 karakter olabilir")
    .required("Uygulama adı gereklidir"),
  packageName: yup
    .string()
    .matches(
      /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/,
      "Geçerli bir paket adı giriniz (örn: com.company.app)"
    )
    .required("Paket adı gereklidir"),
  platform: yup
    .string()
    .oneOf(["ANDROID", "IOS"], "Platform seçimi gereklidir")
    .required("Platform seçimi gereklidir"),
  description: yup
    .string()
    .max(500, "Açıklama en fazla 500 karakter olabilir")
    .optional(),
});

export const createVersionSchema = yup.object({
  version: yup
    .string()
    .matches(
      /^\d+\.\d+\.\d+$/,
      "Geçerli bir semantic version giriniz (örn: 1.0.0)"
    )
    .required("Versiyon numarası gereklidir"),
  buildNumber: yup
    .number()
    .positive("Build numarası pozitif olmalıdır")
    .integer("Build numarası tam sayı olmalıdır")
    .required("Build numarası gereklidir"),
  releaseNotes: yup
    .string()
    .max(1000, "Sürüm notları en fazla 1000 karakter olabilir")
    .optional(),
});

export const updateAppSchema = yup.object({
  name: yup
    .string()
    .min(2, "Uygulama adı en az 2 karakter olmalıdır")
    .max(50, "Uygulama adı en fazla 50 karakter olabilir")
    .optional(),
  description: yup
    .string()
    .max(500, "Açıklama en fazla 500 karakter olabilir")
    .optional(),
});

export type CreateAppFormData = yup.InferType<typeof createAppSchema>;
export type CreateVersionFormData = yup.InferType<typeof createVersionSchema>;
export type UpdateAppFormData = yup.InferType<typeof updateAppSchema>;
