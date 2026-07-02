import { useState } from "react";
import { Link } from "react-router";
import { BookOpen, Mail, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { authApi } from "../api/services";
import { useSeo } from "../hooks/useSeo";

export function ForgotPasswordPage() {
  useSeo({
    title: "Şifremi Unuttum",
    description: "Şifrenizi mi unuttunuz? E-posta adresinizi girerek şifrenizi sıfırlayabilirsiniz.",
  });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
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
          <h1 className="heading-md text-foreground">Şifremi Unuttum</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            E-posta adresinizi girin, size sıfırlama bağlantısı gönderelim
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              E-posta adresinize şifre sıfırlama bağlantısı gönderildi.
              Lütfen gelen kutunuzu kontrol edin.
            </p>
            <Link
              to="/giris"
              className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Giriş sayfasına dön
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresiniz"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-semibold text-sm btn-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
            </button>

            <p className="text-center text-sm text-muted-foreground">
              <Link to="/giris" className="inline-flex items-center gap-1 text-primary font-medium hover:underline">
                <ArrowLeft className="w-3 h-3" />
                Giriş sayfasına dön
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
    </main>
  );
}
