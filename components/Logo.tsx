// Marquee logo — from BRAND.md.
// Primary wordmark: MARQUEE, uppercase, Inter, weight 500, letter-spacing 0.25em.
// No mark/icon next to it. Editorial variant = lowercase "marquee" (Canela, editorial only).

type LogoProps = {
  variant?: "primary" | "editorial";
  className?: string;
};

export function Logo({ variant = "primary", className = "" }: LogoProps) {
  if (variant === "editorial") {
    // lowercase editorial wordmark — Canela (self-host in public/fonts when licensed)
    return (
      <span className={`font-serif lowercase ${className}`} style={{ letterSpacing: "-0.01em" }}>
        marquee
      </span>
    );
  }
  // primary wordmark — the live marquee.bio logo
  return (
    <span
      className={`font-inter uppercase ${className}`}
      style={{ fontWeight: 500, letterSpacing: "0.25em" }}
    >
      MARQUEE
    </span>
  );
}
