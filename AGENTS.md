# Git Workflow

## Branch & PR workflow

- Her yeni gelistirme / feature / bugfix icin ayri bir branch ac
- Branch adi formatı: `feature/<kisa-aciklama>` veya `fix/<kisa-aciklama>` veya `refactor/<kisa-aciklama>`
- Tüm commit'leri bu branch'te yap
- İslem tamamlaninca GitHub'da PR (Pull Request) ac
- PR merge edildikten sonra branch'i sil (hem local hem remote)
- Asla dogrudan `main` veya `master` branch'ine commit etme
