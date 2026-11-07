// Drawn art for the Future Worth Club page, in the Club sheet's colors (Sarah, 6 Nov 2026):
// Club Green #1E3A2C · Oxblood #670821 · Ink #22293B · Cream #F2ECDF · Sky Blue #A8CFFF · Marigold #EDBB2D · Orange #FF5436.

/** The Club badge: a cream rosette with an orange ribbon, "FUTURE WORTH" around the rim and the script word "Club" on green in the middle. Filled, with ink outlines, like the coins on the report page. Two colors plus the ribbon (Sarah, 7 Nov: the page was "way too colorful"). */
export function Badge({ className = "" }: { className?: string }) {
  // 16-point scalloped rim
  const pts: string[] = [];
  const N = 16;
  for (let i = 0; i < N * 2; i++) {
    const a = (Math.PI * 2 * i) / (N * 2) - Math.PI / 2;
    const r = i % 2 === 0 ? 108 : 96;
    pts.push(`${(130 + r * Math.cos(a)).toFixed(1)},${(118 + r * Math.sin(a)).toFixed(1)}`);
  }
  return (
    <svg viewBox="0 0 260 290" className={className} aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      {/* ribbons */}
      <path d="M92 206 L70 282 L104 262 L124 288 L138 212z" fill="#FF5436" stroke="#22293B" strokeWidth="4" />
      <path d="M168 206 L190 282 L156 262 L136 288 L122 212z" fill="#FF5436" stroke="#22293B" strokeWidth="4" />
      {/* rosette */}
      <polygon points={pts.join(" ")} fill="#F2ECDF" stroke="#22293B" strokeWidth="4" />
      <circle cx="130" cy="118" r="88" fill="none" stroke="#22293B" strokeWidth="2.5" strokeDasharray="5 6" />
      <circle cx="130" cy="118" r="60" fill="#1E3A2C" stroke="#22293B" strokeWidth="3" />
      <defs>
        {/* top: clockwise from the left; bottom: counter-clockwise from the left, so both read left to right */}
        <path id="fw-rim-top" d="M58 118 a72 72 0 1 1 144 0" />
        <path id="fw-rim-bottom" d="M54 118 a76 76 0 1 0 152 0" />
      </defs>
      <text fill="#22293B" fontSize="15" fontWeight="500" letterSpacing="4.5" textAnchor="middle" style={{ fontFamily: "var(--fw-text), sans-serif" }}>
        <textPath href="#fw-rim-top" startOffset="50%">FUTURE WORTH</textPath>
        <textPath href="#fw-rim-bottom" startOffset="50%">EST. 2026</textPath>
      </text>
      <text x="130" y="140" textAnchor="middle" fill="#F2ECDF" fontSize="58" style={{ fontFamily: "var(--fw-script), cursive" }}>Club</text>
    </svg>
  );
}

/** Content: a page with lines and a pen. One color, from `currentColor`. */
export function Essay({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="10" y="6" width="38" height="52" rx="2" />
      <path d="M18 18 h22 M18 27 h22 M18 36 h14" />
      <path d="M38 52 L54 24 l6 3 -16 28 -7 2z" />
    </svg>
  );
}

/** Community: three people. */
export function People({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="24" r="8" />
      <circle cx="46" cy="24" r="8" />
      <circle cx="32" cy="18" r="9" />
      <path d="M4 52 a14 14 0 0 1 28 0" />
      <path d="M32 52 a14 14 0 0 1 28 0" />
      <path d="M16 54 a16 16 0 0 1 32 0z" />
    </svg>
  );
}

/** Events: two glasses. */
export function Glasses({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 8 h22 l-3 22 a8 8 0 0 1 -16 0z" />
      <path d="M11 18 h16" />
      <path d="M19 38 v16 M11 54 h16" />
      <path d="M34 14 h22 l-3 22 a8 8 0 0 1 -16 0z" />
      <path d="M45 44 v12 M37 56 h16" />
    </svg>
  );
}
