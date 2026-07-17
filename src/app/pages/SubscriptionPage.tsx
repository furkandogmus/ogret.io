import { Link } from "react-router";
import { BookOpen, MessageCircle, ShieldCheck } from "lucide-react";
import { useSeo } from "../hooks/useSeo";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Ücretsiz platform erişimi",
    description: "Öğrenciler öğretmenleri keşfedebilir, öğretmenler profil ve ilan oluşturabilir.",
  },
  {
    icon: MessageCircle,
    title: "Doğrudan iletişim",
    description: "Dersin kapsamını, zamanını ve ücretini taraflar mesajlaşarak birlikte belirler.",
  },
  {
    icon: ShieldCheck,
    title: "Platform içi ödeme yok",
    description: "öğret.io ilk sürümde para tahsil etmez, komisyon almaz ve ödeme aracılığı yapmaz.",
  },
];

export function SubscriptionPage() {
  useSeo({
    title: "İlk Sürüm Kullanım Modeli",
    description: "öğret.io ilk sürümde ücretsizdir; ders ücreti ve ödeme koşulları öğrenci ile öğretmen arasında belirlenir.",
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          İlk sürüm
        </span>
        <h1 className="mt-4 text-3xl font-black text-foreground">Herkes için ücretsiz</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Bu sürümde abonelik, paket satışı veya platform üzerinden ders ödemesi bulunmuyor.
          Ders ücreti, ödeme zamanı ve yöntemi öğrenci ile öğretmen tarafından doğrudan kararlaştırılır.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
              <Icon className="h-5 w-5 text-emerald-700" />
            </div>
            <h2 className="mt-4 font-bold text-foreground">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950">
        öğret.io taraflar arasındaki ödemenin tarafı, emanetçisi veya garantörü değildir. Ödeme yapmadan önce
        ders koşullarını yazılı olarak netleştirmenizi ve güvenli, kayıtlı bir yöntem kullanmanızı öneririz.
      </div>

      <div className="text-center">
        <Link to="/arama" className="inline-flex rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700">
          Öğretmenleri keşfet
        </Link>
      </div>
    </div>
  );
}
