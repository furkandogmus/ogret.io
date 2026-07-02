import { useNavigate } from "react-router";
import { Home, Search } from "lucide-react";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-6">
        <div className="text-7xl font-bold text-primary/20">404</div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Sayfa Bulunamadı</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Aradığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanılamıyor olabilir.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:opacity-90 transition text-sm"
          >
            <Home className="w-4 h-4" /> Ana Sayfa
          </button>
          <button
            onClick={() => navigate("/arama")}
            className="flex items-center gap-2 px-5 py-2.5 border border-border text-foreground font-medium rounded-xl hover:bg-muted transition text-sm"
          >
            <Search className="w-4 h-4" /> Öğretmen Ara
          </button>
        </div>
      </div>
    </div>
  );
}
