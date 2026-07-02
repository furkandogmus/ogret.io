export function HeroIllustration() {
  return (
    <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none select-none" aria-hidden="true">
      <svg width="280" height="280" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="140" cy="140" r="130" stroke="#FCA5A5" strokeWidth="2" strokeDasharray="8 6" opacity="0.4" />
        <circle cx="140" cy="140" r="95" stroke="#FCA5A5" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.3" />
        <rect x="105" y="75" width="70" height="85" rx="8" fill="#FEE2E2" stroke="#F87171" strokeWidth="2" />
        <text x="140" y="105" textAnchor="middle" fill="#EF4444" fontSize="11" fontWeight="bold">ÖĞREN</text>
        <rect x="85" y="130" width="110" height="4" rx="2" fill="#FECACA" />
        <rect x="85" y="140" width="90" height="4" rx="2" fill="#FECACA" />
        <rect x="85" y="150" width="100" height="4" rx="2" fill="#FECACA" />
        <circle cx="60" cy="60" r="20" fill="#FEE2E2" stroke="#FCA5A5" strokeWidth="1.5" />
        <text x="60" y="65" textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="bold">★</text>
        <circle cx="220" cy="50" r="15" fill="#FEF2F2" stroke="#FECACA" strokeWidth="1.5" />
        <text x="220" y="55" textAnchor="middle" fill="#F87171" fontSize="8" fontWeight="bold">★</text>
        <circle cx="45" cy="215" r="12" fill="#FEF2F2" stroke="#FECACA" strokeWidth="1.5" />
        <text x="45" y="219" textAnchor="middle" fill="#F87171" fontSize="7" fontWeight="bold">★</text>
        <circle cx="230" cy="220" r="18" fill="#FEE2E2" stroke="#FCA5A5" strokeWidth="1.5" />
        <text x="230" y="225" textAnchor="middle" fill="#EF4444" fontSize="9" fontWeight="bold">★</text>
        <path d="M140 210 L140 235" stroke="#FCA5A5" strokeWidth="2" strokeLinecap="round" />
        <path d="M125 225 L140 235 L155 225" stroke="#FCA5A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
