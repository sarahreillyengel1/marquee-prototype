import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans, DM_Mono, Inter, Caveat } from "next/font/google";
import "./globals.css";

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
        className={`${dmSerif.variable} ${dmSans.variable} ${dmMono.variable} ${inter.variable} ${caveat.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
