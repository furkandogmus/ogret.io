import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { BookOpen, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../providers/AuthProvider";
import { useSeo } from "../hooks/useSeo";
import { loginSchema, type LoginForm } from "../lib/validation";
import { Form, FormField, FormItem, FormControl, FormMessage } from "../components/ui/form";
import { FloatingInput } from "../components/ui/floating-input";

export function LoginPage() {
  useSeo({
    title: "Giriş Yap",
    description: "öğret.io hesabınıza giriş yapın. Online özel ders almak veya vermek için hemen oturum açın.",
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleSubmit = async (values: LoginForm) => {
    setError("");
    try {
      await login(values.email, values.password);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Giriş yapılırken bir hata oluştu");
    }
  };

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
          <h1 className="heading-md text-foreground">Hoş Geldiniz</h1>
          <p className="text-muted-foreground mt-1 text-sm">Hesabınıza giriş yapın</p>
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
              {form.formState.isSubmitting ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>

            <p className="text-center text-sm">
              <Link to="/sifre-unuttum" className="text-muted-foreground hover:text-primary transition-colors">
                Şifremi unuttum
              </Link>
            </p>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Hesabın yok mu?{" "}
          <Link to="/kayit" className="text-primary font-medium hover:underline">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
    </main>
  );
}
