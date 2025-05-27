import * as yup from "yup";

export const createGroupSchema = yup.object({
  name: yup
    .string()
    .min(2, "Grup adı en az 2 karakter olmalıdır")
    .max(50, "Grup adı en fazla 50 karakter olabilir")
    .required("Grup adı gereklidir"),
  description: yup
    .string()
    .max(500, "Açıklama en fazla 500 karakter olabilir")
    .optional(),
});

export const updateGroupSchema = yup.object({
  name: yup
    .string()
    .min(2, "Grup adı en az 2 karakter olmalıdır")
    .max(50, "Grup adı en fazla 50 karakter olabilir")
    .optional(),
  description: yup
    .string()
    .max(500, "Açıklama en fazla 500 karakter olabilir")
    .optional(),
});

export const addMemberSchema = yup.object({
  userId: yup.string().required("Kullanıcı seçimi gereklidir"),
});

export const grantAppAccessSchema = yup.object({
  appId: yup.string().required("Uygulama seçimi gereklidir"),
});

export type CreateGroupFormData = yup.InferType<typeof createGroupSchema>;
export type UpdateGroupFormData = yup.InferType<typeof updateGroupSchema>;
export type AddMemberFormData = yup.InferType<typeof addMemberSchema>;
export type GrantAppAccessFormData = yup.InferType<typeof grantAppAccessSchema>;
