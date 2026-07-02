# PRD — UI/UX Profesyonelleştirme

## Amaç
MVP görünümünden kurtulup, kullanıcıda güven ve kalite hissi uyandıran profesyonel bir arayüze geçmek.

## Temel Prensipler
1. **Derinlik & Katman**: elevation/shadow sistemi ile görsel hiyerarşi
2. **Tutarlı boşluk**: 4px grid, section spacing standardizasyonu
3. **Mikro-interaksiyonlar**: hover/focus/active geçişlerinde yumuşaklık
4. **Tipografi netliği**: heading/text scale, line-height, letter-spacing tutarlılığı
5. **Boş/yüklenme durumları**: skeleton loading, illustrated empty states

## Değişiklik Listesi

### 1. Tasarım Tokenları (`theme.css` + `globals.css`)
- Elevation scale: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`
- Transition curves: `--ease-spring`, `--ease-smooth`
- Focus ring token: `--ring-offset`

### 2. Navigasyon (`Navbar.tsx`)
- Glassmorphism: `backdrop-blur-xl`, subtle border
- Active link: bottom indicator line
- Avatar + dropdown for auth (vs text)
- Mobile: slide-down panel with animation

### 3. Öğretmen Kartı (`TutorCard.tsx`)
- Elevated card: `shadow-sm hover:shadow-md`
- Premium badge: refined pill with icon
- Better spacing: consistent padding/alignment
- Hover scale effect on avatar

### 4. Landing Page (`LandingPage.tsx`)
- Hero: geometric pattern overlay, refined gradient
- Stats section: glass cards with icons
- Kategoriler: icon-only circles, hover lift
- Nasıl Çalışır: numbered step indicators
- Footer: link groups with hover underline

### 5. Giriş/Kayıt Formları (`LoginPage`, `RegisterPage`)
- Floating labels (shrink on focus/has-value)
- Social proof: "30.000+ kayıtlı kullanıcı" banner
- Password visibility toggle refinement
- Better error messages with icons

### 6. Öğretmen Profili (`TutorProfilePage`)
- Profile header: refined layout, better spacing
- Tab bar: animated underline indicator
- Availability: compact week view
- Review cards: better typography

### 7. Boş/Yüklenme Durumları
- Skeleton cards for tutor listings
- Illustrated empty states (icon + message + CTA)

## Uygulama Sırası
1. Token'lar (tasarım altyapısı)
2. Navigasyon
3. Landing Page
4. Öğretmen Kartı
5. Giriş/Kayıt
6. Öğretmen Profili
7. Boş durumlar
