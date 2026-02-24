export function StatsHero() {
  const stats = [
    ["Agentes activos", "7/10"],
    ["Tareas completadas hoy", "342"],
    ["Tokens procesados", "1.8M"],
    ["Uptime promedio", "99.4%"],
  ];
  return (
    <section className="glass-card" style={{ padding: 20 }}>
      <h2 style={{ margin:0, fontFamily:"'Playfair Display', serif" }}>Operación alquímica en tiempo real</h2>
      <p style={{ color:"#a1a1aa", marginTop:6 }}>Orquesta Ollama, Redis y ChromaDB con control fino, elegante y sin APIs pagadas.</p>
      <div style={{ marginTop: 14, display:"grid", gridTemplateColumns:"repeat(4, minmax(0,1fr))", gap:10 }}>
        {stats.map(([k,v]) => <div key={k} className="card" style={{ padding:12 }}><small style={{ color:"#9ca3af" }}>{k}</small><div style={{ fontSize:26, fontWeight:700 }}>{v}</div></div>)}
      </div>
    </section>
  );
}
