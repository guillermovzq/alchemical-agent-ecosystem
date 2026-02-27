"use client";

import { useEffect, useState } from "react";
import { Bell, Command, Cpu, MemoryStick, CircleGauge } from "lucide-react";

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ minWidth: 92 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8" }}>
        <span>{label}</span><span>{value}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,.08)", marginTop: 4 }}>
        <div style={{ width: `${value}%`, height: "100%", borderRadius: 999, background: color, boxShadow: `0 0 14px ${color}` }} />
      </div>
    </div>
  );
}

export function HeaderBar() {
  const [m, setM] = useState({ cpu: 0, ram: 0, gpu: 0 });

  useEffect(() => {
    let stop = false;
    const load = async () => {
      const r = await fetch("/api/metrics", { cache: "no-store" });
      const j = await r.json();
      if (!stop) setM(j);
    };
    load();
    const id = setInterval(load, 7000);
    return () => { stop = true; clearInterval(id); };
  }, []);

  return (
    <header className="glass-card gradient-frame" style={{ margin: "12px 12px 0", padding: "12px 14px", position: "sticky", top: 12, zIndex: 20, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
      <div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 24 }}>Alchemical Control Panel</div>
        <small style={{ color: "#9ca3af" }}>Caldero local-first · KiloCode AI + Redis + ChromaDB</small>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 10px", borderRadius: 12, border: "1px solid rgba(255,255,255,.12)", background: "rgba(0,0,0,.24)", minWidth: 280 }}>
          <Command size={14} color="#67e8f9" />
          <input aria-label="Buscar" placeholder="Invoca agentes, tareas, logs..." style={{ width: "100%", border: 0, outline: 0, background: "transparent", color: "#e2e8f0" }} />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <div className="card metric"><Cpu size={14} /> <Meter label="CPU" value={m.cpu} color="#22d3ee" /></div>
          <div className="card metric"><MemoryStick size={14} /> <Meter label="RAM" value={m.ram} color="#a78bfa" /></div>
          <div className="card metric"><CircleGauge size={14} /> <Meter label="GPU" value={m.gpu} color="#34d399" /></div>
        </div>

        <button className="icon-btn" aria-label="Notificaciones"><Bell size={16} /></button>
      </div>
    </header>
  );
}
