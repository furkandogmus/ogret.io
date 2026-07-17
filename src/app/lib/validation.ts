import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "E-posta gerekli").email("Geçerli bir e-posta girin"),
  password: z.string().min(1, "Şifre gerekli"),
});
export type LoginForm = z.infer<typeof loginSchema>;

const phoneRegex = /^0[5-9]\d{9}$/;

const phoneDisplayRegex = /^0[5-9]\d{2} \d{3} \d{2} \d{2}$/;

export const registerSchema = z.object({
  fullName: z.string().min(1, "Ad soyad gerekli").min(2, "En az 2 karakter"),
  email: z.string().min(1, "E-posta gerekli").email("Geçerli bir e-posta girin"),
  phone: z
    .string()
    .min(1, "Telefon gerekli")
    .refine((val) => phoneRegex.test(val.replace(/\s/g, "")) || phoneDisplayRegex.test(val), {
      message: "Geçerli bir telefon numarası girin (05XX XXX XX XX)",
    }),
  password: z.string().min(1, "Şifre gerekli").min(12, "Şifre en az 12 karakter olmalı").max(100, "Şifre en fazla 100 karakter olabilir"),
  role: z.enum(["STUDENT", "TUTOR"]),
});
export type RegisterForm = z.infer<typeof registerSchema>;

export const profileSchema = z.object({
  fullName: z.string().min(1, "Ad soyad gerekli").min(2, "En az 2 karakter"),
  bio: z.string().max(500, "En fazla 500 karakter").optional().or(z.literal("")),
  education: z.string().max(200, "En fazla 200 karakter").optional().or(z.literal("")),
  experienceYears: z.coerce.number().min(0, "Negatif olamaz").max(50, "En fazla 50 yıl").optional(),
  hourlyRate: z.coerce.number().min(0, "Negatif olamaz").max(10000, "En fazla ₺10.000").optional(),
});
export type ProfileForm = z.infer<typeof profileSchema>;

export const reviewSchema = z.object({
  rating: z.number().min(1, "Puan gerekli").max(5),
  comment: z.string().max(500, "En fazla 500 karakter").optional().or(z.literal("")),
});
export type ReviewForm = z.infer<typeof reviewSchema>;
