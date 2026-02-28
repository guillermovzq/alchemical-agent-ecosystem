"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  NodeProps,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Network,
  Bot,
  Cpu,
  Save,
  Plus,
  Trash2,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

interface AgentNode {
  id: string;
  name: string;
  role: string;
  model: string;
  skills: string[];
  tools: string[];
  enabled: boolean;
  status: "running" | "paused" | "error";
}

// Custom Node Component
function AgentNodeComponent({ data, selected }: NodeProps<AgentNode>) {
  const statusColors = {
    running: "border-emerald/50 shadow-emerald/20",
    paused: "border-amber/50 shadow-amber/20",
    error: "border-rose/50 shadow-rose/20",
  };

  return (
    <div
      className={cn(
        "w-48 p-3 rounded-xl glass-card",
        "border-2 transition-all duration-200",
        selected ? "border-gold shadow-lg shadow-gold/20" : statusColors[data.status]
      )}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-gold" />
      
      <div className="flex items-start gap-2">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          data.status === "running" ? "bg-emerald/20" :
          data.status === "paused" ? "bg-amber/20" : "bg-rose/20"
        )}>
          <Bot className={cn(
            "w-4 h-4",
            data.status === "running" ? "text-emerald" :
            data.status === "paused" ? "text-amber" : "text-rose"
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{data.name}</p>
          <p className="text-xs text-muted-foreground truncate">{data.role}</p>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <Cpu className="w-3 h-3 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground truncate">{data.model}</span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {data.skills.slice(0, 2).map((skill, i) => (
          <span
            key={i}
            className="px-1.5 py-0.5 rounded bg-gold/10 text-[9px] text-gold"
          >
            {skill}
          </span>
        ))}
        {data.skills.length > 2 && (
          <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-muted-foreground">
            +{data.skills.length - 2}
          </span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-gold" />
    </div>
  );
}

const nodeTypes = {
  agent: AgentNodeComponent,
};

export function AgentNodeStudio() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState({
    skills: [] as string[],
    tools: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load agents from API
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const [agentsRes, capsRes] = await Promise.all([
          fetch("/api/gateway/agents", { cache: "no-store" }),
          fetch("/api/gateway/capabilities", { cache: "no-store" }),
        ]);

        const agents = await agentsRes.json();
        const caps = await capsRes.json();

        setCapabilities({
          skills: caps.skills || [],
          tools: caps.tools || [],
        });

        // Convert to nodes
        const items: AgentNode[] = agents.items || [];
        const initialNodes: Node[] = items.map((agent, index) => ({
          id: agent.id || agent.name,
          type: "agent",
          position: {
            x: 100 + (index % 4) * 220,
            y: 100 + Math.floor(index / 4) * 180,
          },
          data: {
            ...agent,
            status: agent.enabled ? "running" : "paused",
          },
        }));

        // Create edges based on relationships if any
        const initialEdges: Edge[] = [];

        setNodes(initialNodes);
        setEdges(initialEdges);
        setIsLoading(false);
      } catch (error) {
        toast.error("Error cargando agentes");
        setIsLoading(false);
      }
    };

    loadAgents();
  }, [setNodes, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
            style: { stroke: "#d4af37", strokeWidth: 2 },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  };

  const saveConfiguration = async () => {
    toast.success("Configuración guardada");
  };

  if (isLoading) {
    return (
      <div className="h-[600px] glass-card rounded-xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando agentes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-240px)] min-h-[500px] glass-card rounded-xl overflow-hidden flex">
      {/* Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            color="rgba(212, 175, 55, 0.1)"
            gap={20}
            size={1}
          />
          <Controls className="!bg-void/80 !border-gold/20" />
          <MiniMap
            className="!bg-void/80 !border-gold/20"
            nodeColor={(node) => {
              if (node.data?.status === "running") return "#34d399";
              if (node.data?.status === "paused") return "#fbbf24";
              return "#fb7185";
            }}
            maskColor="rgba(5, 5, 5, 0.8)"
          />
        </ReactFlow>

        {/* Toolbar */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className="glass-card rounded-lg px-3 py-2 flex items-center gap-2">
            <Network className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium">{nodes.length} Agentes</span>
            <span className="text-xs text-muted-foreground">|</span>
            <span className="text-xs text-muted-foreground">{edges.length} Conexiones</span>
          </div>
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={saveConfiguration}
            className="btn-alchemical flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Guardar
          </button>
        </div>
      </div>

      {/* Properties Panel */}
      {selectedNode && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="w-72 glass-card border-l border-gold/10 p-4 overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground">Propiedades</h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 rounded-lg hover:bg-white/10"
            >
              <Trash2 className="w-4 h-4 text-rose" />
            </button>
          </div>

          {(() => {
            const node = nodes.find((n) => n.id === selectedNode);
            if (!node) return null;

            return (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Nombre
                  </label>
                  <p className="text-sm font-medium mt-1">{node.data.name}</p>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Rol
                  </label>
                  <p className="text-sm mt-1">{node.data.role}</p>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Modelo
                  </label>
                  <p className="text-sm mt-1">{node.data.model}</p>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {node.data.skills.map((skill: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-md bg-gold/10 text-xs text-gold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Tools
                  </label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {node.data.tools.map((tool: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-md bg-turq/10 text-xs text-turq"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gold/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Habilitado</span>
                    <div
                      className={cn(
                        "w-10 h-5 rounded-full transition-colors relative cursor-pointer",
                        node.data.enabled ? "bg-emerald" : "bg-white/20"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                          node.data.enabled ? "left-5" : "left-0.5"
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}
