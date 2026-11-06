// Drawn money icons for the report page. Brand palette (BRAND.md): Vermillion #FF5A36, Wine #670821, Sky #A8CFFF, Powder #C0DDFB, Lavender #C7B5FF, Ink #111111.

/** A stack of coins with a dollar sign on the top coin. */
export function CoinStack({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* back coins (stack) */}
      {[150, 130, 110].map((y, i) => (
        <g key={y}>
          <ellipse cx="120" cy={y + 26} rx="78" ry="26" fill={i === 1 ? "#670821" : "#FF5A36"} stroke="#111111" strokeWidth="4" />
          <path d={`M42 ${y + 26} v22 a78 26 0 0 0 156 0 v-22`} fill={i === 1 ? "#670821" : "#FF5A36"} stroke="#111111" strokeWidth="4" />
          <path d={`M42 ${y + 48} a78 26 0 0 0 156 0`} stroke="#111111" strokeWidth="4" />
        </g>
      ))}
      {/* top coin, face on */}
      <circle cx="120" cy="92" r="64" fill="#FF5A36" stroke="#111111" strokeWidth="4" />
      <circle cx="120" cy="92" r="50" fill="none" stroke="#111111" strokeWidth="3" strokeDasharray="6 7" />
      <text x="120" y="118" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="78" fill="#111111">$</text>
      {/* sparkle */}
      <path d="M206 30 l4 12 12 4 -12 4 -4 12 -4 -12 -12 -4 12 -4z" fill="#FF5A36" stroke="#111111" strokeWidth="3" />
      <path d="M28 54 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="#A8CFFF" stroke="#111111" strokeWidth="3" />
    </svg>
  );
}

/** One coin, face on. */
export function Coin({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="#FF5A36" stroke="#111111" strokeWidth="3" />
      <circle cx="32" cy="32" r="21" fill="none" stroke="#111111" strokeWidth="2" strokeDasharray="4 5" />
      <text x="32" y="43" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="32" fill="#111111">$</text>
    </svg>
  );
}

/** A banknote. */
export function Banknote({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect x="4" y="16" width="56" height="32" rx="3" fill="#A8CFFF" stroke="#111111" strokeWidth="3" />
      <rect x="11" y="22" width="42" height="20" rx="2" fill="none" stroke="#111111" strokeWidth="2" strokeDasharray="3 4" />
      <circle cx="32" cy="32" r="8" fill="#FF5A36" stroke="#111111" strokeWidth="2.5" />
      <text x="32" y="36.5" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="12" fill="#111111">$</text>
    </svg>
  );
}

/** A bar chart going up. */
export function Chart({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="36" width="12" height="20" fill="#C7B5FF" stroke="#111111" strokeWidth="3" />
      <rect x="26" y="26" width="12" height="30" fill="#A8CFFF" stroke="#111111" strokeWidth="3" />
      <rect x="44" y="12" width="12" height="44" fill="#FF5A36" stroke="#111111" strokeWidth="3" />
      <path d="M8 24 L30 14 L44 6" fill="none" stroke="#111111" strokeWidth="3" />
      <path d="M36 6 h8 v8" fill="none" stroke="#111111" strokeWidth="3" />
    </svg>
  );
}
