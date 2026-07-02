import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Check, Zap, Crown, Star } from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import { subscriptionApi } from "../api/services";
import type { SubscriptionResponse } from "../api/services";

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

const PLAN_ICONS = [Zap, Crown, Star];

export function SubscriptionPage() {
  const { isTutor } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [current, setCurrent] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchPlans(), fetchCurrent()]).finally(() => setLoading(false));
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await subscriptionApi.getPlans();
      setPlans(data as Plan[]);
    } catch {
      console.error("Planlar yuklenemedi");
    }
  };

  const fetchCurrent = async () => {
    try {
      const { data } = await subscriptionApi.getMySubscription();
      setCurrent(data);
    } catch {
      console.error("Abonelik bilgisi alinamadi");
    }
  };

  const handleSubscribe = async (planType: string) => {
    try {
      const { data } = await subscriptionApi.subscribe(planType, "havale");
      setCurrent(data);
    } catch {
      console.error("Abone olunamadi");
    }
  };

  const handleCancel = async () => {
    try {
      await subscriptionApi.cancel();
      setCurrent(null);
    } catch {
      console.error("Abonelik iptal edilemedi");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-3">
          <div className="h-8 w-64 skeleton mx-auto" />
          <div className="h-4 w-48 skeleton mx-auto" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="h-4 w-20 skeleton" />
              <div className="h-8 w-24 skeleton" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-3 w-full skeleton" />
                ))}
              </div>
              <div className="h-10 w-full rounded-xl skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isTutor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">Öğretmen Abonelik Planları</h1>
        <p className="text-muted-foreground mt-2">Abonelik planlarını görüntülemek için öğretmen hesabıyla giriş yapmalısınız.</p>
        <button onClick={() => navigate("/giris")} className="mt-4 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold">
          Giriş Yap
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Abonelik Planları</h1>
        <p className="text-muted-foreground mt-2">Profilinizi öne çıkarın, daha fazla öğrenciye ulaşın</p>
      </div>

      {current && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Aktif Aboneliğiniz</p>
            <p className="text-lg font-bold text-foreground mt-1">
              {current.planType} — ₺{current.price}/ay
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(current.startDate).toLocaleDateString("tr-TR")} - {new Date(current.endDate).toLocaleDateString("tr-TR")}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-sm text-red-500 hover:text-red-600 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            İptal Et
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        {plans.map((plan, i) => {
          const Icon = PLAN_ICONS[i];
          const isActive = current?.planType === plan.name;
          return (
            <div
              key={plan.id}
              className={`relative bg-card rounded-2xl border-2 p-6 space-y-5 ${
                isActive ? "border-primary" : "border-border"
              }`}
            >
              {i === 1 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full">
                  EN POPÜLER
                </div>
              )}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                i === 0 ? "bg-stone-100" : i === 1 ? "bg-primary/10" : "bg-emerald-50"
              }`}>
                <Icon className={`w-6 h-6 ${i === 0 ? "text-stone-600" : i === 1 ? "text-primary" : "text-emerald-600"}`} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-foreground">₺{plan.price}</span>
                  <span className="text-muted-foreground text-sm">/ay</span>
                </div>
              </div>
              <ul className="space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => isActive ? null : handleSubscribe(plan.name)}
                disabled={isActive}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-muted text-muted-foreground cursor-default"
                    : "bg-primary text-white hover:opacity-90"
                }`}
              >
                {isActive ? "Aktif" : "Abone Ol"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
