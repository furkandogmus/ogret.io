import { useState } from "react";
import { useNavigate } from "react-router";
import { Shield, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import { verificationApi, fileApi } from "../api/services";
import { useSeo } from "../hooks/useSeo";

export function VerificationPage() {
  useSeo({
    title: "Kimlik Doğrulama",
    description: "Kimlik belgenizi yükleyerek güvenilirliğinizi artırın. Onaylanan öğretmenler profilinde rozet alır.",
  });
  const { user, isTutor } = useAuth();
  const navigate = useNavigate();
  const [documentType, setDocumentType] = useState("IDENTITY");
  const [fileUrl, setFileUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const selectFile = (file?: File) => {
    if (!file) return;
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setSelectedFile(null);
      setFileUrl("");
      setError("Belge PDF, JPEG veya PNG formatında olmalıdır.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setSelectedFile(null);
      setFileUrl("");
      setError("Belge boyutu 10 MB'dan küçük olmalıdır.");
      return;
    }
    setError("");
    setSelectedFile(file);
    setFileUrl(file.name);
  };

  if (!isTutor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">Kimlik Doğrulama</h1>
        <p className="text-muted-foreground mt-2">Bu sayfa yalnızca öğretmenler içindir.</p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setSubmitting(true);
    setError("");
    try {
      const uploadRes = await fileApi.upload(selectedFile, "IDENTITY_DOCUMENT");
      const documentUrl = uploadRes.data.url;
      await verificationApi.submit({ documentType, documentUrl });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Doğrulama gönderilirken hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Başvuru Alındı</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Kimlik doğrulama belgeniz admin ekibimiz tarafından incelenecektir. En kısa sürede sonuçlanacaktır.
          </p>
          <button
            onClick={() => navigate("/ogretmen-panel")}
            className="mt-6 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold"
          >
            Paneli Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Kimlik Doğrulama</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Güvenilirliğinizi artırmak için kimlik belgenizi yükleyin. Onaylanan öğretmenler profilinde
          <strong className="text-foreground"> "Kimlik Doğrulandı" </strong>
          rozeti alır.
        </p>
      </div>

      {user?.identityVerified && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-800 text-sm">Kimliğiniz Doğrulandı</p>
            <p className="text-green-600 text-xs mt-0.5">Belgeniz onaylanmıştır.</p>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Belge Türü</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "IDENTITY", label: "Kimlik Kartı" },
              { value: "DIPLOMA", label: "Diploma" },
              { value: "CERTIFICATE", label: "Sertifika" },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setDocumentType(value)}
                className={`p-3 rounded-xl text-sm font-medium border transition-colors ${
                  documentType === value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Belge Yükle</label>
          <label htmlFor="verification-document" className="block border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 focus-within:border-primary transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-foreground font-medium">Dosya seçmek için tıklayın</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, JPG veya PNG — Max 10MB</p>
            <input
              id="verification-document"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="sr-only"
              onChange={(event) => selectFile(event.target.files?.[0])}
            />
          </label>
          {fileUrl && (
            <div className="flex items-center gap-2 mt-3 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              {fileUrl} seçildi
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-800">
            <p className="font-medium mb-1">Önemli:</p>
            <p>Yüklediğiniz belgeler yalnızca doğrulama amaçlı kullanılır ve üçüncü taraflarla paylaşılmaz. KVKK kapsamında korunmaktadır.</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || !fileUrl}
          className="w-full bg-primary text-white font-semibold py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Shield className="w-4 h-4" />
          )}
          {submitting ? "Gönderiliyor..." : "Doğrulama Başvurusu Gönder"}
        </button>
      </div>
    </div>
  );
}
