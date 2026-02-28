import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Alchemical Agent Ecosystem',
  description: 'Where Intelligence is Forged, Not Fetched.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-[#0D0D0D] text-white">
        {children}
      </body>
    </html>
  );
}
