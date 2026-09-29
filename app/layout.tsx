import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans, DM_Mono, Inter, Caveat, Lora, Poppins } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { AuthLinkHandler } from "@/components/AuthLinkHandler";
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

// Poppins — UI labels and short headlines (BRAND.md). Used by the profile header.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
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
    "The professional identity platform for human opportunity. Build your brand, share how you work, monetize your expertise, and be discovered by the right people. One profile, one link.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSerif.variable} ${dmSans.variable} ${dmMono.variable} ${inter.variable} ${caveat.variable} ${lora.variable} ${canela.variable} ${poppins.variable} font-sans antialiased`}
      >
        <AuthLinkHandler />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
