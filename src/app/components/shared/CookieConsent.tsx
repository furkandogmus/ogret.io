import { useState, useEffect } from "react";
import { Link } from "react-router";
import { X, Cookie } from "lucide-react";

const CONSENT_KEY = "cookie-consent-v1";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem(CONSENT_KEY, "rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Cookie className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm">
            <p>
              Size daha iyi bir deneyim sunmak için çerezler kullanıyoruz.
              Devam ederek{" "}
              <Link to="/legal/cerez-politikasi" className="text-primary hover:underline">Çerez Politikası</Link>
              'nı kabul etmiş olursunuz.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={reject} className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5">
            Reddet
          </button>
          <button onClick={accept} className="text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:opacity-90">
            Kabul Et
          </button>
        </div>
        <button onClick={reject} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
