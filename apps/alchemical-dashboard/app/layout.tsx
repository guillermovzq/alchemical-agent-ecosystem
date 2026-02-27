import "./globals.css";
import { Sidebar } from "../components/Sidebar";
import { HeaderBar } from "../components/HeaderBar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="grain" />
        <div className="aura a1" />
        <div className="aura a2" />
        <div className="aura a3" />
        <main className="shell">
          <Sidebar />
          <section className="content">
            <HeaderBar />
            <div className="page">{children}</div>
          </section>
        </main>
      </body>
    </html>
  );
}
