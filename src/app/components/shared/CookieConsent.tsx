import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Cookie, Settings2, X } from "lucide-react";

const CONSENT_KEY = "cookie-consent-v2";

interface ConsentPreferences {
  version: 2;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      const timer = window.setTimeout(() => setVisible(true), 400);
      return () => window.clearTimeout(timer);
    }
    try {
      const preferences = JSON.parse(stored) as ConsentPreferences;
      setAnalytics(Boolean(preferences.analytics));
      setMarketing(Boolean(preferences.marketing));
    } catch {
      localStorage.removeItem(CONSENT_KEY);
      setVisible(true);
    }
  }, []);

  const save = (nextAnalytics: boolean, nextMarketing: boolean) => {
    const preferences: ConsentPreferences = {
      version: 2,
      necessary: true,
      analytics: nextAnalytics,
      marketing: nextMarketing,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(preferences));
    window.dispatchEvent(new CustomEvent("cookie-consent:changed", { detail: preferences }));
    setAnalytics(nextAnalytics);
    setMarketing(nextMarketing);
    setVisible(false);
  };

  if (!visible) {
    return (
      <button
        type="button"
        onClick={() => setVisible(true)}
        className="fixed bottom-3 left-3 z-40 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-xs text-muted-foreground shadow-sm hover:text-foreground"
        aria-label="Çerez tercihlerini değiştir"
      >
        <Settings2 className="h-3.5 w-3.5" />
        Çerez tercihleri
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background p-4 shadow-2xl" role="dialog" aria-modal="true" aria-label="Çerez tercihleri">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-foreground">Çerez tercihlerinizi siz belirleyin</p>
            <p className="mt-1 text-muted-foreground">
              Zorunlu çerezler oturum ve güvenlik için gereklidir. Analitik ve pazarlama çerezleri yalnızca açık izninizle çalışır.{" "}
              <Link to="/gizlilik" className="text-primary hover:underline">Gizlilik ve çerez bilgileri</Link>
            </p>
          </div>
          <button type="button" onClick={() => save(false, false)} aria-label="Yalnızca zorunlu çerezlerle kapat" className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {showDetails && (
          <div className="grid gap-3 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-3">
            <Preference title="Zorunlu" description="Oturum, CSRF güvenliği ve tercih kaydı." checked disabled onChange={() => undefined} />
            <Preference title="Analitik" description="Anonim kullanım ve performans ölçümü." checked={analytics} onChange={setAnalytics} />
            <Preference title="Pazarlama" description="Kampanya ölçümü ve kişiselleştirme." checked={marketing} onChange={setMarketing} />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button type="button" onClick={() => setShowDetails((value) => !value)} className="mr-auto px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
            {showDetails ? "Ayrıntıları gizle" : "Tercihleri özelleştir"}
          </button>
          <button type="button" onClick={() => save(false, false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
            İsteğe bağlıları reddet
          </button>
          {showDetails && (
            <button type="button" onClick={() => save(analytics, marketing)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
              Seçimleri kaydet
            </button>
          )}
          <button type="button" onClick={() => save(true, true)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            Tümünü kabul et
          </button>
        </div>
      </div>
    </div>
  );
}

function Preference({
  title,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1"
      />
      <span>
        <span className="block font-semibold text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </span>
    </label>
  );
}
