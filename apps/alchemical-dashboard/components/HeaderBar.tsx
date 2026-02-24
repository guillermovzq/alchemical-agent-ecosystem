export function HeaderBar() {
  return (
    <header className="glass-card" style={{ margin: "12px 12px 0", padding: "12px 14px", position:"sticky", top:12, zIndex: 10, display:"flex", justifyContent:"space-between", gap:12, alignItems:"center" }}>
      <div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 24 }}>Alchemical Control Panel</div>
        <small style={{ color:"#9ca3af" }}>Local-first AI orchestration · 10 agentes · 7401-7410</small>
      </div>
      <input aria-label="Buscar" placeholder="Buscar agentes o tareas..." style={{ minWidth: 280, padding:"10px 12px", borderRadius:12, border:"1px solid rgba(255,255,255,.14)", background:"rgba(0,0,0,.28)", color:"#f9fafb" }} />
    </header>
  );
}
