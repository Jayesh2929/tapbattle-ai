import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PageTransition } from "@/components/shared/PageTransition";
import { ParticlesBackground } from "@/components/shared/ParticlesBackground";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "TapBattle AI — Real-Time Reaction Intelligence",
  description:
    "A browser-based multiplayer reaction game with AI-driven performance analytics: trend prediction, fatigue detection, and consistency scoring.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen font-sans">
        <ParticlesBackground />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
