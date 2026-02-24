import { FlaskConical, LayoutDashboard, Bot, WandSparkles, Settings2, Logs, CircleHelp } from "lucide-react";

const items = [
  ["Dashboard", LayoutDashboard],
  ["Agentes", Bot],
  ["Crear Nuevo Agente", WandSparkles],
  ["Configuración Global", Settings2],
  ["Logs & Monitoreo", Logs],
  ["Ayuda", CircleHelp],
];

export function Sidebar() {
  return (
    <aside className="card" style={{ margin: 12, padding: 14, position: "sticky", top: 12, height: "calc(100vh - 24px)" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
        <FlaskConical size={22} color="#22d3ee" />
        <strong style={{ fontFamily: "'Playfair Display', serif", fontSize: 18 }}>Alchemical</strong>
      </div>
      <nav style={{ display: "grid", gap: 8 }}>
        {items.map(([label, Icon]) => (
          <button key={label} className="card" style={{ display:"flex", gap:10, alignItems:"center", padding:"10px 12px", color:"#e5e7eb", background:"rgba(255,255,255,.03)", borderRadius:12 }}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </nav>
      <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
        <Status label="Ollama" state="running" />
        <Status label="Redis" state="healthy" />
        <Status label="ChromaDB" state="healthy" />
      </div>
    </aside>
  );
}

function Status({ label, state }: { label: string; state: "running" | "healthy" | "warn" }) {
  const color = state === "warn" ? "#fbbf24" : "#34d399";
  return <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}><span>{label}</span><span style={{ color }}>{state}</span></div>;
}
