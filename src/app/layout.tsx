import type { Metadata, Viewport } from "next";
import { Cinzel, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alchemical Agent Ecosystem — Where Intelligence is Forged, Not Fetched.",
  description:
    "Plataforma local-first multi-agente self-hosted. Orquesta inteligencia artificial con soberanía total. Zero APIs de pago. 100% en tu máquina.",
  keywords: [
    "multi-agent",
    "AI orchestration",
    "self-hosted",
    "LangGraph",
    "local AI",
    "alchemical",
  ],
  authors: [{ name: "Alchemical Agent Ecosystem" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${cinzel.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased bg-void text-gold-100`}
      >
        {children}
      </body>
    </html>
  );
}
