export function LogsMonitor() {
  const lines = [
    "[info] synapsara: embedding cache warmed",
    "[warn] noctumbra-mail: retrying smtp transport",
    "[info] chromadb: vector flush complete",
    "[error] fluxenrath: latency p95 exceeded 320ms",
  ];
  return (
    <section className="glass-card" style={{ padding: 14 }}>
      <h3 style={{ marginTop:0 }}>Logs & Monitoreo</h3>
      <div style={{ borderRadius:12, padding:12, background:"#020617", border:"1px solid rgba(255,255,255,.1)", fontFamily:"ui-monospace, SFMono-Regular, Menlo, monospace", fontSize:12 }}>
        {lines.map((l) => <div key={l} style={{ padding:"3px 0", color: l.includes("error") ? "#fb7185" : l.includes("warn") ? "#fbbf24" : "#67e8f9" }}>{l}</div>)}
      </div>
    </section>
  );
}
