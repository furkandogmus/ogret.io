export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string[];
  date: string;
  readingTime: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "online-ozel-dersin-avantajlari",
    title: "Online Özel Dersin Avantajları: Neden Dijital Eğitim Geleceğimiz?",
    description: "Online özel dersin öğrencilere ve velilere sağladığı avantajlar: esneklik, erişilebilirlik, ve kişiselleştirilmiş öğrenme deneyimi.",
    date: "2026-03-15",
    readingTime: "4 dk okuma",
    content: [
      "Son yıllarda dijital eğitim platformlarının yükselişiyle birlikte online özel ders, geleneksel yüz yüze eğitime güçlü bir alternatif haline geldi. Peki online özel dersin bu kadar popüler olmasının ardındaki sebepler neler?",
      "Esneklik: Online özel dersin en büyük avantajı şüphesiz esneklik. Öğrenciler ve öğretmenler, coğrafi kısıtlamalar olmaksızın diledikleri zaman diliminde ders yapabilir. Yoğun okul programı olan öğrenciler için bu, eğitimlerini aksatmadan ilerlemek anlamına gelir.",
      "Kişiselleştirilmiş Öğrenme Her öğrenci farklı şekilde öğrenir. Online özel ders, birebir etkileşim sayesinde öğretmenlerin dersleri öğrencinin ihtiyaçlarına göre şekillendirmesine olanak tanır. Zayıf olunan konulara daha fazla zaman ayrılabilir.",
      "Zaman ve Maliyet Tasarrufu: Online dersler sayesinde ulaşım süresi ve masrafı ortadan kalkar. Bu hem velilerin bütçesine katkı sağlar hem de öğrencilerin enerjisini ders çalışmaya yönlendirmesine yardımcı olur.",
      "Teknoloji Entegrasyonu: Online ders platformları, interaktif beyaz tahtalar, ekran paylaşımı, dijital kaynaklar ve kayıt özellikleri gibi araçlarla dersleri daha etkileşimli hale getirir.",
      "öğret.io olarak, alanında uzman öğretmenlerimizle her seviyede online özel ders imkanı sunuyoruz. Matematikten İngilizceye, yazılımdan müziğe geniş konu yelpazemizle yanınızdayız.",
    ],
  },
  {
    slug: "sinav-basarisi-icin-ders-calisma-stratejileri",
    title: "Sınav Başarısı İçin Etkili Ders Çalışma Stratejileri",
    description: "LGS, YKS ve diğer sınavlara hazırlanan öğrenciler için kanıtlanmış ders çalışma teknikleri ve zaman yönetimi ipuçları.",
    date: "2026-03-10",
    readingTime: "5 dk okuma",
    content: [
      "Sınav dönemi, öğrencilerin en çok zorlandığı ama aynı zamanda en kritik süreçlerden biridir. Doğru stratejilerle çalışmak, başarıyı doğrudan etkiler. İşte kanıtlanmış çalışma teknikleri:",
      "Pomodoro Tekniği: 25 dakika odaklanma, 5 dakika ara. Bu döngüyü 4 kez tekrarladıktan sonra 15-30 dakikalık uzun bir ara verin. Bu yöntem beyninizin maksimum verimle çalışmasını sağlar.",
      "Aktif Öğrenme: Sadece okuyarak öğrenmek yerine, öğrendiklerinizi kendi cümlelerinizle anlatın, test çözün ve problem üzerinde çalışın. Öğretmen rolü yaparak konuyu bir başkasına anlatmayı deneyin.",
      "Düzenli Tekrar: Unutma eğrisine göre öğrendiklerinizin %50'sini 1 saat içinde unutursunuz. Bu yüzden düzenli tekrar şart. Öğrendikten sonra 1. gün, 3. gün, 7. gün ve 30. gün tekrar edin.",
      "Konu Önceliklendirme: Çalışmaya en zorlandığınız konudan başlayın. Sabah saatlerinde beyniniz daha dinç olduğu için zor konuları bu saatlerde çalışmak daha verimlidir.",
      "Unutmayın, sınav başarısı sadece çok çalışmakla değil, akıllı çalışmakla gelir. öğret.io'daki uzman öğretmenlerimizle hedeflerinize bir adım daha yaklaşın.",
    ],
  },
  {
    slug: "yabanci-dil-ogrenmenin-en-etkili-yollari",
    title: "Yabancı Dil Öğrenmenin En Etkili Yolları",
    description: "İngilizce, Almanca ve diğer yabancı dilleri öğrenmek için bilimsel olarak kanıtlanmış yöntemler ve pratik ipuçları.",
    date: "2026-03-05",
    readingTime: "4 dk okuma",
    content: [
      "Yabancı dil öğrenmek günümüz dünyasında bir lüks değil, ihtiyaç haline geldi. Peki en etkili dil öğrenme yöntemleri neler? Gelin bilimsel araştırmaların ışığında bu soruyu cevaplayalım.",
      "Maruz Kalma (Immersion): Bir dili öğrenmenin en doğal yolu, o dile mümkün olduğunca maruz kalmaktır. Telefonunuzun dilini değiştirin, filmleri orijinal dilinde izleyin, müzik dinleyin. Beyniniz bilinçaltında dili işlemeye başlayacaktır.",
      "Konuşma Pratiği: Dil öğreniminin olmazsa olmazı konuşma pratiğidir. Dil bilgisi kurallarını bilmek yetmez, aktif olarak konuşmak gerekir. Online derslerde anadili İngilizce olan öğretmenlerle pratik yapabilirsiniz.",
      "Aralıklı Tekrar Sistemi: Yeni kelimeleri öğrenirken aralıklı tekrar sistemi (Spaced Repetition) kullanın. Anki, Quizlet gibi uygulamalar bu konuda size yardımcı olabilir. Kelimeleri unutmadan önce hatırlatma yapacak şekilde programlanmıştır.",
      "Hedef Belirleme: 'İngilizce öğreneceğim' yerine '3 ay içinde günlük konuşmaları anlayıp temel cümleler kurabileceğim' gibi somut hedefler belirleyin. Ölçülebilir hedefler motivasyonunuzu yüksek tutar.",
      "öğret.io'da İngilizce, Almanca, Fransızca, İspanyolca, Rusça ve Arapça gibi birçok dilde uzman öğretmenler bulabilir, size özel ders programı oluşturabilirsiniz.",
    ],
  },
  {
    slug: "cocugunuz-icin-dogru-ozel-ders-ogretmenini-secme-rehberi",
    title: "Çocuğunuz İçin Doğru Özel Ders Öğretmenini Seçme Rehberi",
    description: "Çocuğunuz için en uygun özel ders öğretmenini seçerken dikkat etmeniz gereken kriterler ve ipuçları.",
    date: "2026-02-28",
    readingTime: "5 dk okuma",
    content: [
      "Çocuğunuz için doğru özel ders öğretmenini bulmak, eğitim hayatında büyük fark yaratabilir. Peki iyi bir özel ders öğretmenini nasıl seçmelisiniz? İşte dikkat etmeniz gereken noktalar:",
      "Uzmanlık Alanı: Öğretmenin, çocuğunuzun ihtiyaç duyduğu konuda gerçekten uzman olduğundan emin olun. Matematik öğretmeni her zaman matematik konusunda uzmanlaşmış olmayabilir. öğret.io'da her öğretmenin uzmanlık alanlarını ve sertifikalarını görebilirsiniz.",
      "Deneyim ve Referanslar: Deneyimli öğretmenler, farklı öğrenci profillerine göre ders anlatma becerisine sahiptir. Öğretmenin geçmiş deneyimlerini, eğitimini ve diğer öğrencilerden aldığı puanları inceleyin.",
      "İletişim ve Uyum: Bir öğretmen ne kadar bilgili olursa olsun, çocuğunuzla iyi iletişim kuramıyorsa verimli ders yapmak zordur. İlk deneme dersinde çocuğunuzun öğretmenle uyumunu gözlemleyin.",
      "Değerlendirme ve Takip: İyi bir öğretmen, öğrencinin gelişimini düzenli olarak takip eder ve size geri bildirim verir. Hangi konularda ilerleme kaydedildiğini, hangi konularda daha çok çalışılması gerektiğini paylaşır.",
      "öğret.io'da her öğretmenin profilinde puanını, yorumlarını, deneyimini ve uzmanlık alanlarını detaylıca inceleyebilir, çocuğunuz için en doğru öğretmeni seçebilirsiniz.",
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
