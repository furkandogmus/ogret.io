## Proje Kuralları

### Genel
- Proje: **öğret.io** — Türkiye odaklı online özel ders marketplace
- Frontend: React 18 + Vite + Tailwind CSS v4 + shadcn/ui
- State management: React Context (provider pattern)
- Routing: react-router v7
- Tema: Light-only (CSS variables ile)
- Animasyon opsiyonel: motion (eski framer-motion)

### Dosya Düzeni
```
src/
├── app/
│   ├── components/
│   │   ├── ui/         # shadcn/ui primitives (dokunma!)
│   │   ├── shared/     # Projeye özel tekrar kullanılan componentler
│   │   └── layout/     # Navbar, RootLayout vb.
│   ├── pages/          # Sayfa componentleri (route başına bir tane)
│   ├── data/           # Mock data (geçici, API gelince silinecek)
│   ├── types/          # TypeScript interface/type tanımları
│   ├── providers/      # React Context provider'ları
│   └── App.tsx         # Router + Provider'ları bağla
├── styles/             # Global CSS (theme.css, fonts.css)
└── main.tsx            # Entry point
```

### Kod Stili
- Fonksiyonel component + hooks, class component yok
- Props interface'leri inline tanımlanabilir (küçükse)
- Tailwind utility class'ları kullan, özel CSS yazmaktan kaçın
- shadcn/ui hazır component'i varsa onu kullan, sıfırdan yazma
- Türkçe içerik (etiketler, placeholder'lar, vs.)
- Lucide ikon kütüphanesi
- 2 space indent
- Import sırası: react → kütüphaneler → proje içi absolute import → relative

### Tema
- CSS değişkenleri theme.css'te tanılı (light-only)
- Renkleri hardcode etme, CSS variable kullan: `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`

### Dallar & Commit
- feature/ branch yapısı
- Commit mesajları Türkçe veya İngilizce, kısa ve açıklayıcı
- Build'ı kırmadan commit et
