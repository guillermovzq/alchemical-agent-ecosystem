"use client";

import { useEffect, useState } from "react";
import type { DashboardConfig } from "../lib/config";

export function SettingsPanel({ onChange }: { onChange: (c: DashboardConfig) => void }) {
  const [cfg, setCfg] = useState<DashboardConfig | null>(null);
  const [saved, setSaved] = useState("");

  useEffect(() => {
    fetch("/api/config", { cache: "no-store" }).then((r) => r.json()).then((j) => {
      setCfg(j.config);
      onChange(j.config);
    });
  }, [onChange]);

  if (!cfg) return <section className="glass-card" style={{ padding: 14 }}>Cargando configuración...</section>;

  const update = (patch: Partial<DashboardConfig>) => setCfg((p) => ({ ...(p as DashboardConfig), ...patch }));

  const save = async () => {
    const r = await fetch("/api/config", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(cfg) });
    const j = await r.json();
    onChange(j.config);
    setSaved("Guardado");
    setTimeout(() => setSaved(""), 1500);
  };

  return (
    <section className="glass-card" style={{ padding: 14 }}>
      <h3 style={{ marginTop: 0 }}>Configuración avanzada</h3>
      <div style={{ display: "grid", gap: 8 }}>
        <label>Polling agentes (ms)<input value={cfg.agentPollMs} onChange={(e) => update({ agentPollMs: Number(e.target.value) })} style={field} /></label>
        <label>Polling logs (ms)<input value={cfg.logsPollMs} onChange={(e) => update({ logsPollMs: Number(e.target.value) })} style={field} /></label>
        <label>Líneas de log<input value={cfg.logsLines} onChange={(e) => update({ logsLines: Number(e.target.value) })} style={field} /></label>
        <label>Servicio log por defecto<input value={cfg.defaultLogService} onChange={(e) => update({ defaultLogService: e.target.value })} style={field} /></label>
        <button className="cta" onClick={save}>Guardar configuración</button>
        {saved && <small style={{ color: "#34d399" }}>{saved}</small>}
      </div>
    </section>
  );
}

const field: React.CSSProperties = { display: "block", width: "100%", marginTop: 4, borderRadius: 8, border: "1px solid rgba(255,255,255,.15)", background: "rgba(0,0,0,.2)", color: "#f8fafc", padding: "8px" };
