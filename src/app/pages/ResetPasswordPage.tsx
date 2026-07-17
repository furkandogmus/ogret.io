import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { BookOpen, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { authApi } from "../api/services";
import { useSeo } from "../hooks/useSeo";

export function ResetPasswordPage() {
  useSeo({
    title: "Şifre Sıfırla",
    description: "Yeni şifrenizi belirleyerek hesabınıza tekrar erişebilirsiniz.",
  });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır");
      return;
    }
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate("/giris"), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Şifre sıfırlanırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div role="main">
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <p className="text-muted-foreground">Geçersiz veya eksik sıfırlama bağlantısı</p>
            <Link to="/giris" className="text-primary font-medium hover:underline text-sm">
              Giriş sayfasına dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div role="main">
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="heading-md text-foreground">Şifre Sıfırlandı</h2>
            <p className="text-sm text-muted-foreground">Yönlendiriliyorsunuz...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div role="main">
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
          <h1 className="heading-md text-foreground">Yeni Şifre Belirleyin</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Yeni şifre"
              required
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Yeni şifre (tekrar)"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-semibold text-sm btn-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sıfırlanıyor..." : "Şifreyi Sıfırla"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            <Link to="/giris" className="inline-flex items-center gap-1 text-primary font-medium hover:underline">
              <ArrowLeft className="w-3 h-3" />
              Giriş sayfasına dön
            </Link>
          </p>
        </form>
        </div>
      </div>
    </div>
  );
}
