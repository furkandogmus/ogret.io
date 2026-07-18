import { useEffect, useCallback, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { BookOpen, Mail, Lock, Phone, User, Eye, EyeOff, AlertCircle, GraduationCap } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../providers/AuthProvider";
import { useSeo } from "../hooks/useSeo";
import { registerSchema, type RegisterForm } from "../lib/validation";
import { Form, FormField, FormItem, FormControl, FormMessage } from "../components/ui/form";
import { FloatingInput } from "../components/ui/floating-input";

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
}

export function RegisterPage() {
  useSeo({
    title: "Kayıt Ol",
    description: "öğret.io'ya ücretsiz kayıt olun. Özel ders almak veya öğretmen olarak ders vermek için hemen hesap oluşturun.",
  });
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      role: (searchParams.get("role") === "tutor" ? "TUTOR" : "STUDENT") as "STUDENT" | "TUTOR",
    },
  });

  useEffect(() => {
    const role = searchParams.get("role") === "tutor" ? "TUTOR" : "STUDENT";
    form.setValue("role", role as "STUDENT" | "TUTOR");
  }, [searchParams, form]);

  const handleSubmit = async (values: RegisterForm) => {
    setError("");
    try {
      await register({ ...values, phone: values.phone.replace(/\s/g, "") });
      navigate(values.role === "TUTOR" ? "/ogretmen-panel" : "/ogrenci-panel");
    } catch (err: any) {
      setError(err.response?.data?.message || "Kayıt olurken bir hata oluştu");
    }
  };

  const role = form.watch("role");

  return (
    <main>
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-md shadow-emerald-600/20">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground tracking-tight">
              öğret<span className="text-primary">.io</span>
            </span>
          </Link>
          <h1 className="heading-md text-foreground">Hesap Oluştur</h1>
          <p className="text-muted-foreground mt-1 text-sm">Platforma katılmak için kayıt olun</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative flex p-1 bg-muted rounded-xl w-full">
                      <div
                        className={`absolute top-1 bottom-1 w-[calc(50%-2px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                          role === "TUTOR" ? "left-[calc(50%+1px)]" : "left-1"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => field.onChange("STUDENT")}
                        className={`relative flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 z-10 ${
                          role === "STUDENT" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Öğrenci
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange("TUTOR")}
                        className={`relative flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 z-10 ${
                          role === "TUTOR" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Öğretmen
                      </button>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingInput
                      label="Ad Soyad"
                      type="text"
                      icon={<User className="w-4 h-4" />}
                      error={form.formState.errors.fullName?.message}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingInput
                      label="E-posta"
                      type="email"
                      icon={<Mail className="w-4 h-4" />}
                      error={form.formState.errors.email?.message}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingInput
                      label="Telefon"
                      type="tel"
                      icon={<Phone className="w-4 h-4" />}
                      error={form.formState.errors.phone?.message}
                      {...field}
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <FloatingInput
                        label="Şifre"
                        type={showPassword ? "text" : "password"}
                        icon={<Lock className="w-4 h-4" />}
                        error={form.formState.errors.password?.message}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-semibold text-sm btn-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {form.formState.isSubmitting ? "Kaydediliyor..." : "Kayıt Ol"}
            </button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Zaten hesabın var mı?{" "}
          <Link to="/giris" className="text-primary font-medium hover:underline">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
    </main>
  );
}
