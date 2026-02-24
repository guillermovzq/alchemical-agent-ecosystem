export function CreateAgentWizard() {
  const steps = ["Plantilla", "Config", "Capacidades", "Review"]; 
  return (
    <section className="glass-card" style={{ padding:16 }}>
      <h3 style={{ marginTop:0 }}>Crear Nuevo Agente</h3>
      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
        {steps.map((s, i) => <div key={s} className="card" style={{ padding:"6px 10px", fontSize:12, borderColor: i===0 ? "#22d3ee" : undefined }}>{i+1}. {s}</div>)}
      </div>
      <div style={{ display:"grid", gap:8 }}>
        <input placeholder="Nombre del agente" style={field} />
        <input placeholder="Modelo base (ej: llama3.2)" style={field} />
        <textarea placeholder="Descripción" rows={3} style={field} />
        <button className="card" style={{ padding:"12px 14px", color:"#0a0e17", background:"linear-gradient(90deg,#22d3ee,#a78bfa)", fontWeight:700 }}>
          Transmutar Agente
        </button>
      </div>
    </section>
  );
}

const field: React.CSSProperties = {
  width: "100%", borderRadius: 12, border: "1px solid rgba(255,255,255,.14)",
  background: "rgba(3,7,18,.45)", color: "#f8fafc", padding: "10px 12px"
};
