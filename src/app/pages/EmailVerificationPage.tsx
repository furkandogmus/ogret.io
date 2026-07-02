import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { authApi } from "../api/services";
import { useSeo } from "../hooks/useSeo";

export function EmailVerificationPage() {
  useSeo({
    title: "E-posta Doğrulama",
    description: "E-posta adresinizi doğrulayın ve hesabınızı aktifleştirin.",
  });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Doğrulama linki geçersiz. Lütfen e-postanızdaki linki tekrar deneyin.");
      return;
    }
    authApi.verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage("E-posta adresiniz başarıyla doğrulandı!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "Doğrulama sırasında bir hata oluştu. Link süresi dolmuş olabilir.");
      });
  }, [searchParams]);

  return (
    <div className="max-w-lg mx-auto px-4 py-20">
      <div className="bg-white border border-stone-100 rounded-3xl p-8 text-center shadow-sm space-y-4">
        {status === "loading" && (
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
        )}
        {status === "success" && (
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
        )}
        {status === "error" && (
          <XCircle className="w-12 h-12 text-red-500 mx-auto" />
        )}

        <h2 className="text-xl font-bold text-stone-900">
          {status === "loading" && "Doğrulanıyor..."}
          {status === "success" && "E-posta Doğrulandı"}
          {status === "error" && "Doğrulama Başarısız"}
        </h2>

        <p className="text-sm text-stone-500">{message}</p>

        {(status === "success" || status === "error") && (
          <button
            onClick={() => navigate("/giris")}
            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all"
          >
            Giriş Yap
          </button>
        )}
      </div>
    </div>
  );
}
