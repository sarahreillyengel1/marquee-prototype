import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans, DM_Mono, Inter, Caveat, Lora } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Canela (licensed trial) — the real display serif for the v7 homepage. Lora stays as fallback.
const canela = localFont({
  src: [
    { path: "./fonts/CanelaText-Light-Trial.otf", weight: "300", style: "normal" },
    { path: "./fonts/CanelaText-Regular-Trial.otf", weight: "400", style: "normal" },
    { path: "./fonts/CanelaText-RegularItalic-Trial.otf", weight: "400", style: "italic" },
    { path: "./fonts/CanelaText-Medium-Trial.otf", weight: "500", style: "normal" },
    { path: "./fonts/CanelaText-MediumItalic-Trial.otf", weight: "500", style: "italic" },
  ],
  variable: "--font-canela",
  display: "swap",
});

// Legacy fonts — used by all existing screens until the phase-2 reskin
const dmSerif = DM_Serif_Display({
  weight: "400",
  style: "italic",
  subsets: ["latin"],
  variable: "--font-dm-serif",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const dmMono = DM_Mono({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
});

// Brand fonts — used by the new landing page + phase-2 reskin
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-caveat",
});

// Display serif for the v7 homepage — free stand-in for the paid Canela (per HANDOFF).
const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-lora",
});

export const metadata: Metadata = {
  title: "Marquee — Your work deserves the spotlight.",
  description:
    "Marquee is the first personal brand platform for your professional story.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSerif.variable} ${dmSans.variable} ${dmMono.variable} ${inter.variable} ${caveat.variable} ${lora.variable} ${canela.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
