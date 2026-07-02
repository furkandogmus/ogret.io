interface BlogIllustrationProps {
  slug: string;
  className?: string;
}

export function BlogIllustration({ slug, className = "w-full h-48" }: BlogIllustrationProps) {
  const illustrations: Record<string, JSX.Element> = {
    "online-ozel-dersin-avantajlari": (
      <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="400" height="240" rx="16" fill="#F0FDF4" />
        <rect x="100" y="50" width="200" height="130" rx="12" fill="#DCFCE7" stroke="#22C55E" strokeWidth="2" />
        <rect x="115" y="65" width="170" height="8" rx="4" fill="#86EFAC" />
        <rect x="115" y="82" width="140" height="6" rx="3" fill="#BBF7D0" />
        <rect x="115" y="95" width="120" height="6" rx="3" fill="#BBF7D0" />
        <rect x="115" y="108" width="150" height="6" rx="3" fill="#BBF7D0" />
        <rect x="115" y="125" width="100" height="6" rx="3" fill="#BBF7D0" />
        <rect x="115" y="142" width="130" height="6" rx="3" fill="#BBF7D0" />
        <rect x="115" y="158" width="90" height="6" rx="3" fill="#BBF7D0" />
        <circle cx="340" cy="50" r="25" fill="#86EFAC" opacity="0.5" />
        <circle cx="360" cy="65" r="15" fill="#22C55E" opacity="0.3" />
        <circle cx="60" cy="190" r="20" fill="#86EFAC" opacity="0.4" />
        <path d="M180 195 L200 185 L220 195" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M185 190 L200 182 L215 190" stroke="#86EFAC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    "sinav-basarisi-icin-ders-calisma-stratejileri": (
      <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="400" height="240" rx="16" fill="#FFF7ED" />
        <rect x="80" y="40" width="240" height="160" rx="12" fill="#FED7AA" stroke="#F97316" strokeWidth="2" />
        <rect x="100" y="60" width="60" height="60" rx="8" fill="#FFEDD5" />
        <text x="130" y="98" textAnchor="middle" fill="#EA580C" fontSize="28" fontWeight="bold">A</text>
        <rect x="175" y="60" width="60" height="60" rx="8" fill="#FFEDD5" />
        <text x="205" y="98" textAnchor="middle" fill="#EA580C" fontSize="28" fontWeight="bold">B</text>
        <rect x="250" y="60" width="60" height="60" rx="8" fill="#FFEDD5" />
        <text x="280" y="98" textAnchor="middle" fill="#EA580C" fontSize="28" fontWeight="bold">C</text>
        <rect x="100" y="135" width="60" height="60" rx="8" fill="#F97316" />
        <text x="130" y="173" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold">D</text>
        <rect x="175" y="135" width="60" height="60" rx="8" fill="#FFEDD5" />
        <text x="205" y="173" textAnchor="middle" fill="#EA580C" fontSize="28" fontWeight="bold">E</text>
        <rect x="250" y="135" width="60" height="60" rx="8" fill="#FFEDD5" />
        <text x="280" y="173" textAnchor="middle" fill="#EA580C" fontSize="28" fontWeight="bold">F</text>
        <circle cx="290" cy="25" r="18" fill="#F97316" opacity="0.3" />
        <path d="M285 28 L290 22 L295 28" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    "yabanci-dil-ogrenmenin-en-etkili-yollari": (
      <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="400" height="240" rx="16" fill="#EFF6FF" />
        <circle cx="200" cy="110" r="70" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2" strokeDasharray="6 4" />
        <circle cx="200" cy="110" r="40" fill="#BFDBFE" />
        <text x="200" y="118" textAnchor="middle" fill="#2563EB" fontSize="22" fontWeight="bold">TR</text>
        <circle cx="125" cy="170" r="22" fill="#EFF6FF" stroke="#60A5FA" strokeWidth="1.5" />
        <text x="125" y="176" textAnchor="middle" fill="#3B82F6" fontSize="11" fontWeight="bold">EN</text>
        <circle cx="200" cy="185" r="22" fill="#EFF6FF" stroke="#60A5FA" strokeWidth="1.5" />
        <text x="200" y="191" textAnchor="middle" fill="#3B82F6" fontSize="11" fontWeight="bold">DE</text>
        <circle cx="275" cy="170" r="22" fill="#EFF6FF" stroke="#60A5FA" strokeWidth="1.5" />
        <text x="275" y="176" textAnchor="middle" fill="#3B82F6" fontSize="11" fontWeight="bold">FR</text>
        <circle cx="150" cy="65" r="14" fill="#DBEAFE" />
        <text x="150" y="69" textAnchor="middle" fill="#2563EB" fontSize="8" fontWeight="bold">ES</text>
        <circle cx="250" cy="65" r="14" fill="#DBEAFE" />
        <text x="250" y="69" textAnchor="middle" fill="#2563EB" fontSize="8" fontWeight="bold">AR</text>
        <line x1="150" y1="79" x2="125" y2="148" stroke="#93C5FD" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="250" y1="79" x2="275" y2="148" stroke="#93C5FD" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="200" y1="150" x2="200" y2="163" stroke="#93C5FD" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="200" y1="110" x2="125" y2="148" stroke="#93C5FD" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="200" y1="110" x2="275" y2="148" stroke="#93C5FD" strokeWidth="1" strokeDasharray="3 3" />
      </svg>
    ),
    "cocugunuz-icin-dogru-ozel-ders-ogretmenini-secme-rehberi": (
      <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="400" height="240" rx="16" fill="#FAF5FF" />
        <circle cx="200" cy="100" r="50" fill="#F3E8FF" stroke="#A855F7" strokeWidth="2" />
        <circle cx="200" cy="90" r="18" fill="#D8B4FE" />
        <ellipse cx="200" cy="135" rx="28" ry="15" fill="#D8B4FE" />
        <rect x="80" y="30" width="80" height="24" rx="12" fill="#E9D5FF" />
        <text x="120" y="47" textAnchor="middle" fill="#7E22CE" fontSize="11" fontWeight="bold">★★★★★</text>
        <rect x="240" y="30" width="80" height="24" rx="12" fill="#E9D5FF" />
        <text x="280" y="47" textAnchor="middle" fill="#7E22CE" fontSize="11" fontWeight="bold">10 YIL</text>
        <rect x="100" y="175" width="200" height="40" rx="20" fill="#E9D5FF" />
        <text x="200" y="200" textAnchor="middle" fill="#7E22CE" fontSize="13" fontWeight="bold">ALANINDA UZMAN</text>
        <circle cx="340" cy="35" r="12" fill="#A855F7" opacity="0.3" />
        <circle cx="55" cy="205" r="10" fill="#C084FC" opacity="0.4" />
      </svg>
    ),
  };

  return illustrations[slug] || (
    <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="400" height="240" rx="16" fill="#F5F5F4" />
      <circle cx="200" cy="120" r="40" fill="#E7E5E4" />
      <text x="200" y="128" textAnchor="middle" fill="#A8A29E" fontSize="24" fontWeight="bold">?</text>
    </svg>
  );
}
