import { useParams, Link } from "react-router";
import { ArrowLeft } from "lucide-react";

const LEGAL_CONTENT: Record<string, { title: string; content: string[] }> = {
  "gizlilik-politikasi": {
    title: "Gizlilik Politikası",
    content: [
      "Bu gizlilik politikası, öğret.io üzerinden toplanan kişisel verilerin işlenmesine ilişkin esasları belirler.",
      "Toplanan Veriler: Ad, soyad, e-posta adresi, telefon numarası, eğitim ve profil bilgileri ile platform kullanım verileri. İlk sürümde ödeme veya kart verisi toplanmaz.",
      "Verilerin Kullanım Amaçları: Hesap oluşturma ve yönetimi, ders talep ve rezervasyon işlemleri, kullanıcı deneyiminin iyileştirilmesi, iletişim ve bildirim gönderimi.",
      "Verilerin Saklanması: Kişisel verileriniz, hesabınız aktif olduğu sürece saklanır. Hesap silinmesi durumunda 30 gün içinde verileriniz anonim hale getirilir veya silinir.",
      "Veri Paylaşımı: Verileriniz, açık rızanız olmadan üçüncü taraflarla paylaşılmaz. Yasal yükümlülükler kapsamında yetkili kurumlarla paylaşılabilir.",
      "Haklarınız: KVKK kapsamında verilerinize erişme, düzeltme, silme, işlemeyi kısıtlama ve veri taşınabilirliği haklarına sahipsiniz."
    ]
  },
  "kullanim-kosullari": {
    title: "Kullanım Koşulları",
    content: [
      "öğret.io kullanıcıları aşağıdaki kullanım koşullarını kabul etmiş sayılır.",
      "Hesap Güvenliği: Kullanıcılar, hesap bilgilerinin gizliliğinden sorumludur. Hesap güvenliğinin ihlali durumunda derhal platforma bildirim yapılmalıdır.",
      "Hizmet Kullanımı: Platform, öğrenci ve öğretmenleri bir araya getiren bir pazaryeridir. Ders içerikleri ve kalitesinden tarafların kendisi sorumludur.",
      "Ödeme: Platform ödeme almaz veya ödeme aracılığı yapmaz. Ders ücreti, ödeme, iptal ve varsa iade koşulları öğrenci ile öğretmen arasında belirlenir.",
      "Yasaklı Faaliyetler: Platformda yasa dışı, taciz edici, nefret söylemi içeren veya başkalarının haklarını ihlal eden içerik paylaşmak yasaktır.",
      "Hesap Feshi: Kullanım koşullarını ihlal eden hesaplar, önceden bildirim yapılmaksızın askıya alınabilir veya sonlandırılabilir."
    ]
  },
  "kvkk-aydinlatma": {
    title: "KVKK Aydınlatma Metni",
    content: [
      "6698 sayılı Kişisel Verilerin Korunması Kanunu ('KVKK') uyarınca, öğret.io hizmetinin veri sorumlusu tarafından kişisel verilerinizin işlenmesine ilişkin bilgilendirme yapılır.",
      "Veri sorumlusunun doğrulanmış adı/unvanı ve tebligat adresi production yayını öncesinde bu metinde ilan edilecektir. Başvurular şimdilik info@ogret.io adresinden alınır.",
      "Kişisel Verilerin İşlenme Amacı: Toplanan kişisel verileriniz, platform hizmetlerinin sunulması, kullanıcı deneyiminin kişiselleştirilmesi, iletişim faaliyetlerinin yürütülmesi ve yasal yükümlülüklerin yerine getirilmesi amaçlarıyla işlenmektedir.",
      "Kişisel Verilerin Aktarılması: Kişisel verileriniz, hizmetin sunulması için gerekli olduğu ölçüde barındırma, e-posta ve altyapı sağlayıcılarına; hukuki yükümlülük halinde yetkili kurumlara aktarılabilir. İlk sürümde ödeme kuruluşuna aktarım yapılmaz.",
      "Veri Toplama Yöntemi: Kişisel verileriniz, internet sitesi ve mobil uygulama aracılığıyla elektronik ortamda toplanmaktadır.",
      "KVKK Kapsamındaki Haklarınız: Veri işleme faaliyetleri hakkında bilgi talep etme, verilerin düzeltilmesini talep etme, verilerin silinmesini talep etme, itiraz etme ve zararın giderilmesini talep etme haklarına sahipsiniz."
    ]
  },
  "cerez-politikasi": {
    title: "Çerez Politikası",
    content: [
      "DersPlatform olarak, web sitemizin düzgün çalışması ve size daha iyi bir deneyim sunmak için çerezler kullanıyoruz.",
      "Zorunlu Çerezler: Web sitemizin temel işlevlerini yerine getirebilmesi için gerekli olan çerezlerdir. Oturum bilgileri ve güvenlik çerezleri bu kategoriye girer.",
      "Analitik Çerezler: Ziyaretçi trafiğini analiz etmek ve site performansını iyileştirmek için kullanılır. Hangi sayfaların daha çok ziyaret edildiğini anlamamıza yardımcı olur.",
      "İşlevsel Çerezler: Tercihlerinizi hatırlamak ve size kişiselleştirilmiş bir deneyim sunmak için kullanılır.",
      "Çerez Yönetimi: Tarayıcı ayarlarınızdan çerez tercihlerinizi yönetebilirsiniz. Ancak, zorunlu çerezleri devre dışı bırakmanız site işlevselliğini etkileyebilir.",
      "Güncellemeler: Bu çerez politikası zaman zaman güncellenebilir. Güncellemeler web sitemizde yayınlandığı tarihte yürürlüğe girer."
    ]
  }
};

export function LegalPage() {
  const { slug } = useParams<{ slug: string }>();
  const page = slug ? LEGAL_CONTENT[slug] : null;

  if (!page) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Sayfa Bulunamadı</h1>
        <p className="text-muted-foreground mb-4">Aradığınız yasal sayfa mevcut değil.</p>
        <Link to="/" className="text-primary hover:underline">Ana sayfaya dön</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Ana sayfaya dön
      </Link>

      <h1 className="text-3xl font-bold mb-6">{page.title}</h1>

      <div className="space-y-4">
        {page.content.map((paragraph, i) => (
          <p key={i} className="leading-relaxed text-muted-foreground">{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
