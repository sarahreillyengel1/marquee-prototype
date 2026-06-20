// Brand icons — inline SVG, 2px stroke, rounded caps, simple/approachable.
// Drawn from the brand guide section 05. Designed to live inside a
// soft-green circle background. Stroke uses currentColor.

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const DEFAULT: SVGProps<SVGSVGElement> = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

/* ── Product icons ── */

export function IconBeSeen(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...DEFAULT} {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconTellYourStory(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...DEFAULT} {...props}>
      <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3z" />
      <path d="M19 3l.6 1.8L21 5l-1.4.6L19 7l-.6-1.4L17 5l1.4-.6L19 3z" />
    </svg>
  );
}

export function IconConnections(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...DEFAULT} {...props}>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="8" r="2.5" />
      <path d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M14 13c.9-.6 2-1 3-1 3 0 5 2 5 5" />
    </svg>
  );
}

export function IconControl(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...DEFAULT} {...props}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

/* ── Assessment icons ── */

export function IconAssessment(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...DEFAULT} {...props}>
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4h6v3H9z" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  );
}

export function IconDiscovery(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...DEFAULT} {...props}>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2v.3h6V17c0-.7.4-1.5 1-2A7 7 0 0 0 12 2z" />
    </svg>
  );
}

export function IconBlueprint(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...DEFAULT} {...props}>
      <path d="M5 3v18" />
      <path d="M5 4h11l-2 4 2 4H5" />
    </svg>
  );
}

/* ── Brand mark: Geometric M (lavender block letterform) ── */

export function GeometricM(
  props: SVGProps<SVGSVGElement> & { color?: string }
) {
  const { color = "#C7B5FF", ...rest } = props;
  // Wider legs + deeper V valley so the M letterform reads clearly.
  // Paths fill the FULL viewBox (no internal padding) so the M shares
  // an exact bottom edge with whatever's layered with it (the photo).
  return (
    <svg
      viewBox="0 0 200 200"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block" }}
      {...rest}
    >
      {/* Left leg (30% wide, full height) */}
      <path d="M0 0 L60 0 L60 200 L0 200 Z" />
      {/* Right leg (30% wide, full height) */}
      <path d="M140 0 L200 0 L200 200 L140 200 Z" />
      {/* Left diagonal — V extends to 80% down */}
      <path d="M60 0 L100 160 L60 160 Z" />
      {/* Right diagonal */}
      <path d="M140 0 L100 160 L140 160 Z" />
    </svg>
  );
}

/* ── Brand mark: Signal M (dotted/pixel pattern) ── */

export function SignalM(
  props: SVGProps<SVGSVGElement> & { color?: string }
) {
  const { color = "#111111", ...rest } = props;
  // Bitmap pattern reconstructed from the brand guide
  const PATTERN = [
    "1.....1",
    "11...11",
    "1.1.1.1",
    "1..1..1",
    "1.....1",
    "1.....1",
    "1.....1",
  ];
  const dotSize = 6;
  const gap = 4;
  const step = dotSize + gap;
  const cols = PATTERN[0].length;
  const rows = PATTERN.length;
  const width = cols * step - gap;
  const height = rows * step - gap;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      {PATTERN.flatMap((row, r) =>
        row.split("").map((c, x) =>
          c === "1" ? (
            <circle
              key={`${r}-${x}`}
              cx={x * step + dotSize / 2}
              cy={r * step + dotSize / 2}
              r={dotSize / 2}
              fill={color}
            />
          ) : null
        )
      )}
    </svg>
  );
}

/* ── Social icons ── */

export function IconLinkedIn(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...DEFAULT} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M16 17v-4" />
    </svg>
  );
}

export function IconX(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...DEFAULT} {...props}>
      <path d="M4 4l16 16M20 4L4 20" />
    </svg>
  );
}

export function IconInstagram(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...DEFAULT} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}
