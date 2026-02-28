import type { Metadata, Viewport } from "next";
import { Inter, Cinzel, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alchemical Dashboard | Multi-Agent Orchestration",
  description: "2026 Alchemical Agent Ecosystem - Immersive multi-agent orchestration dashboard",
  keywords: ["AI", "agents", "orchestration", "alchemical", "dashboard", "2026"],
  authors: [{ name: "Alchemical Team" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/alchemical-logo.svg",
    apple: "/alchemical-logo.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${cinzel.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-void text-foreground antialiased">
        <Providers>
          {/* Ambient background effects */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-turq/5 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: "1s" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gold/5 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
          </div>
          
          {/* Grid pattern overlay */}
          <div 
            className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(rgba(212, 175, 55, 0.3) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(212, 175, 55, 0.3) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />
          
          {/* Main content */}
          <div className="relative z-10">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
