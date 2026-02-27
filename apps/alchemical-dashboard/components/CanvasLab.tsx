"use client";

import { useState } from "react";

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function CanvasLab() {
  const [url, setUrl] = useState("https://example.com");
  const [snapshot, setSnapshot] = useState<unknown>(null);
  const [urlError, setUrlError] = useState("");

  const capture = async () => {
    if (!isSafeUrl(url)) {
      setUrlError("URL must use http or https protocol.");
      return;
    }
    setUrlError("");
    const r = await fetch("/api/agent/velktharion/dispatch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "snapshot", payload: { targetUrl: url } }),
    });
    const j = await r.json();
    setSnapshot(j);
  };

  const safeUrl = isSafeUrl(url) ? url : "";

  return (
    <section className="glass-card" style={{ padding: 14 }}>
      <h3 style={{ marginTop: 0 }}>Canvas Lab</h3>
      <p style={{ color: "#94a3b8", marginTop: 0 }}>Visualiza webs en canvas e inicia capturas/snapshots para trabajo visual.</p>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setUrlError("");
          }}
          style={{ flex: 1, borderRadius: 8, border: "1px solid rgba(255,255,255,.15)", background: "rgba(0,0,0,.2)", color: "#f8fafc", padding: "8px" }}
        />
        <button className="card" style={{ padding: "8px 10px" }} onClick={capture}>Snapshot</button>
      </div>
      {urlError && (
        <div style={{ marginTop: 6, color: "#fb7185", fontSize: 12 }}>{urlError}</div>
      )}
      {safeUrl ? (
        <iframe
          src={safeUrl}
          title="canvas-web"
          sandbox="allow-scripts allow-same-origin"
          referrerPolicy="no-referrer"
          style={{ marginTop: 10, width: "100%", height: 220, borderRadius: 12, border: "1px solid rgba(255,255,255,.12)", background: "#020617" }}
        />
      ) : (
        <div style={{ marginTop: 10, height: 220, borderRadius: 12, border: "1px solid rgba(255,255,255,.12)", background: "#020617", display: "flex", alignItems: "center", justifyContent: "center", color: "#fb7185", fontSize: 13 }}>
          Enter a valid http/https URL to preview.
        </div>
      )}
      {snapshot !== null && (
        <pre style={{ marginTop: 10, maxHeight: 180, overflow: "auto", borderRadius: 10, padding: 8, background: "#020617", border: "1px solid rgba(255,255,255,.1)", color: "#67e8f9", fontSize: 12 }}>
          {JSON.stringify(snapshot, null, 2)}
        </pre>
      )}
    </section>
  );
}
