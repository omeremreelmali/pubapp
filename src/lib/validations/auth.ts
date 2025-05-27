import * as yup from "yup";

export const signInSchema = yup.object({
  email: yup
    .string()
    .email("Geçerli bir email adresi giriniz")
    .required("Email adresi gereklidir"),
  password: yup
    .string()
    .min(6, "Şifre en az 6 karakter olmalıdır")
    .required("Şifre gereklidir"),
});

export const signUpSchema = yup.object({
  name: yup
    .string()
    .min(2, "İsim en az 2 karakter olmalıdır")
    .required("İsim gereklidir"),
  email: yup
    .string()
    .email("Geçerli bir email adresi giriniz")
    .required("Email adresi gereklidir"),
  password: yup
    .string()
    .min(6, "Şifre en az 6 karakter olmalıdır")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir"
    )
    .required("Şifre gereklidir"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Şifreler eşleşmiyor")
    .required("Şifre tekrarı gereklidir"),
  inviteCode: yup.string().optional(),
});

export const organizationCreateSchema = yup.object({
  name: yup
    .string()
    .min(2, "Organizasyon adı en az 2 karakter olmalıdır")
    .max(50, "Organizasyon adı en fazla 50 karakter olabilir")
    .required("Organizasyon adı gereklidir"),
  description: yup
    .string()
    .max(200, "Açıklama en fazla 200 karakter olabilir")
    .optional(),
});

export const inviteUserSchema = yup.object({
  email: yup
    .string()
    .email("Geçerli bir email adresi giriniz")
    .required("Email adresi gereklidir"),
  role: yup
    .string()
    .oneOf(["ADMIN", "EDITOR", "TESTER"], "Geçerli bir rol seçiniz")
    .required("Rol seçimi gereklidir"),
});

export type SignInFormData = yup.InferType<typeof signInSchema>;
export type SignUpFormData = yup.InferType<typeof signUpSchema>;
export type OrganizationCreateFormData = yup.InferType<
  typeof organizationCreateSchema
>;
export type InviteUserFormData = yup.InferType<typeof inviteUserSchema>;
