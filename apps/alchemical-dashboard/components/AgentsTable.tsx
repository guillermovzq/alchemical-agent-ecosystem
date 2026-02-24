import { agents } from "../lib/mock-data";

export function AgentsTable() {
  return (
    <section style={{ padding: 14 }}>
      <h3 style={{ marginTop:0 }}>Agentes</h3>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead>
          <tr style={{ color:"#9ca3af", textAlign:"left" }}>
            <th>Nombre</th><th>Puerto</th><th>Estado</th><th>Modelo</th><th>Descripción</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((a) => (
            <tr key={a.name} style={{ borderTop:"1px solid rgba(255,255,255,.08)" }}>
              <td>{a.name}</td><td>{a.port}</td><td>{a.status}</td><td>{a.model}</td><td>{a.description}</td>
              <td><button>Start</button> <button>Stop</button> <button>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
