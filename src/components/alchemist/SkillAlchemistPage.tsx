"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  Copy,
  Download,
  Save,
  X,
  Sparkles,
  Check,
  FlaskConical,
} from "lucide-react";
import {
  generateSkillMd,
  type AlchemySkill,
} from "@/lib/alchemist/generateSkillMd";

/* ═══════════════════════════════════════════════════════════════
   DATOS — Categorías y Skills Alquímicas
═══════════════════════════════════════════════════════════════ */

type CategoryKey = "frontend" | "backend" | "ai" | "performance" | "devops";

const CATEGORIES: {
  key: CategoryKey;
  label: string;
  emoji: string;
  color: string;
}[] = [
  {
    key: "frontend",
    label: "Hechizos Frontend & Visual Stack",
    emoji: "🎨",
    color: "#10B981",
  },
  {
    key: "backend",
    label: "Elixires Backend",
    emoji: "🧪",
    color: "#8B5CF6",
  },
  {
    key: "ai",
    label: "Arcana IA y Multi-Agent",
    emoji: "🔮",
    color: "#A78BFA",
  },
  {
    key: "performance",
    label: "Pociones de Performance",
    emoji: "⚡",
    color: "#FFD700",
  },
  {
    key: "devops",
    label: "Runas DevOps y Arquitectura",
    emoji: "🛡️",
    color: "#60A5FA",
  },
];

const SKILLS: AlchemySkill[] = [
  /* ── Frontend ── */
  {
    id: "visual-stack",
    name: "Visual Stack Encantado",
    subtitle: "Next.js + Tailwind + shadcn",
    emoji: "🎨",
    category: "frontend",
  },
  {
    id: "nextjs-transmutation",
    name: "Next.js Transmutación Avanzada",
    subtitle: "App Router + RSC + Streaming",
    emoji: "⚡",
    category: "frontend",
  },
  {
    id: "framer-mastery",
    name: "Framer Motion Mastery",
    subtitle: "Animaciones y gestos fluidos",
    emoji: "🌊",
    category: "frontend",
  },
  {
    id: "react-alchemy",
    name: "React Server Alchemy",
    subtitle: "Server Components avanzados",
    emoji: "⚛️",
    category: "frontend",
  },
  {
    id: "css-arcane",
    name: "CSS Arcane Scrolls",
    subtitle: "Layouts + Grid + moderno",
    emoji: "📜",
    category: "frontend",
  },
  /* ── Backend ── */
  {
    id: "fastapi-elixir",
    name: "FastAPI Elixir Potente",
    subtitle: "APIs de alto rendimiento",
    emoji: "🧪",
    category: "backend",
  },
  {
    id: "python-sorcery",
    name: "Python Sorcery Pro",
    subtitle: "Async + decorators + meta",
    emoji: "🐍",
    category: "backend",
  },
  {
    id: "postgresql-vault",
    name: "PostgreSQL Deep Vault",
    subtitle: "Queries + índices + tuning",
    emoji: "🗄️",
    category: "backend",
  },
  {
    id: "redis-elixir",
    name: "Redis Memory Elixir",
    subtitle: "Cache + pub/sub + streams",
    emoji: "💎",
    category: "backend",
  },
  {
    id: "websocket-whispers",
    name: "WebSocket Whispers",
    subtitle: "Real-time bidireccional",
    emoji: "🕯️",
    category: "backend",
  },
  /* ── IA ── */
  {
    id: "langgraph-arcana",
    name: "LangGraph Orchestration Arcana",
    subtitle: "Grafos de agentes inteligentes",
    emoji: "🔮",
    category: "ai",
  },
  {
    id: "rag-systems",
    name: "RAG Systems Pro",
    subtitle: "Retrieval + generation avanzado",
    emoji: "📚",
    category: "ai",
  },
  {
    id: "multi-agent",
    name: "Multi-Agent Circles",
    subtitle: "Orquestación multi-agente",
    emoji: "🕸️",
    category: "ai",
  },
  {
    id: "chromadb-alchemy",
    name: "ChromaDB Vector Alchemy",
    subtitle: "Embeddings + búsqueda semántica",
    emoji: "💠",
    category: "ai",
  },
  {
    id: "prompt-grimoire",
    name: "Prompt Engineering Grimoire",
    subtitle: "Chain-of-thought + few-shot",
    emoji: "✒️",
    category: "ai",
  },
  {
    id: "llm-rituals",
    name: "LLM Fine-Tuning Rituals",
    subtitle: "LoRA + RLHF + evaluación",
    emoji: "🔥",
    category: "ai",
  },
  /* ── Performance ── */
  {
    id: "performance-sorcery",
    name: "Performance Sorcery",
    subtitle: "Profiling + optimización extrema",
    emoji: "⚡",
    category: "performance",
  },
  {
    id: "memory-sorcery",
    name: "Memory Management Sorcery",
    subtitle: "Heap + leaks + garbage collection",
    emoji: "🧠",
    category: "performance",
  },
  {
    id: "caching-enchant",
    name: "Caching Enchantments",
    subtitle: "CDN + edge + revalidation",
    emoji: "💫",
    category: "performance",
  },
  {
    id: "bundle-arts",
    name: "Bundle Minimization Arts",
    subtitle: "Tree-shaking + code-splitting",
    emoji: "📦",
    category: "performance",
  },
  /* ── DevOps ── */
  {
    id: "docker-potion",
    name: "Docker DevOps Potion",
    subtitle: "Containers + Compose + multi-stage",
    emoji: "🐳",
    category: "devops",
  },
  {
    id: "security-wards",
    name: "Security Wards",
    subtitle: "Auth + OWASP + encryption",
    emoji: "🛡️",
    category: "devops",
  },
  {
    id: "cicd-alchemy",
    name: "CI/CD Pipeline Alchemy",
    subtitle: "GitHub Actions + deploy continuo",
    emoji: "⚙️",
    category: "devops",
  },
  {
    id: "k8s-constellation",
    name: "Kubernetes Constellation",
    subtitle: "Orquestación de containers",
    emoji: "☁️",
    category: "devops",
  },
  {
    id: "monitoring-glass",
    name: "Monitoring Scrying Glass",
    subtitle: "OpenTelemetry + métricas vivas",
    emoji: "👁️",
    category: "devops",
  },
];

/* ── Runas nórdicas para partículas ── */
const RUNES = [
  "ᚠ",
  "ᚢ",
  "ᚦ",
  "ᚨ",
  "ᚱ",
  "ᚲ",
  "ᚷ",
  "ᚹ",
  "ᚺ",
  "ᚾ",
  "ᛁ",
  "ᛃ",
  "ᛈ",
  "ᛉ",
  "ᛊ",
  "ᛏ",
  "ᛒ",
  "ᛖ",
  "ᛗ",
  "ᛚ",
  "ᛞ",
  "ᛟ",
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE: Canvas de Partículas Rúnicas
   Fondo con runas flotantes, niebla y partículas luminosas.
═══════════════════════════════════════════════════════════════ */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  maxOpacity: number;
  color: string;
  type: "dot" | "rune";
  rune: string;
  life: number;
  maxLife: number;
}

function RuneParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = [];
    const MAX = 50;

    function createParticle(stagger = false): Particle {
      const isRune = Math.random() > 0.65;
      const colors = [
        "16,185,129", // emerald
        "139,92,246", // purple
        "167,139,250", // light purple
        "96,165,250", // blue
      ];
      const c = colors[Math.floor(Math.random() * colors.length)];
      const maxLife = 300 + Math.random() * 400;
      return {
        x: Math.random() * (canvas?.width || 1200),
        y: Math.random() * (canvas?.height || 800),
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.4 - 0.05,
        size: isRune ? 14 + Math.random() * 10 : 1 + Math.random() * 2.5,
        opacity: 0,
        maxOpacity: isRune ? 0.12 + Math.random() * 0.08 : 0.2 + Math.random() * 0.3,
        color: c,
        type: isRune ? "rune" : "dot",
        rune: RUNES[Math.floor(Math.random() * RUNES.length)],
        life: stagger ? Math.random() * maxLife : 0,
        maxLife,
      };
    }

    for (let i = 0; i < MAX; i++) particles.push(createParticle(true));

    let animId: number;
    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        const ratio = p.life / p.maxLife;
        if (ratio < 0.1) p.opacity = (ratio / 0.1) * p.maxOpacity;
        else if (ratio > 0.8)
          p.opacity = ((1 - ratio) / 0.2) * p.maxOpacity;
        else p.opacity = p.maxOpacity;

        if (p.type === "rune") {
          ctx.font = `${p.size}px serif`;
          ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
          ctx.fillText(p.rune, p.x, p.y);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
          ctx.fill();
        }

        if (
          p.life >= p.maxLife ||
          p.y < -30 ||
          p.x < -30 ||
          p.x > canvas.width + 30
        ) {
          particles[i] = createParticle();
        }
      }
      animId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE: Caldero Animado SVG
   Caldero con líquido burbujeante, vapor, fuego y chispas.
═══════════════════════════════════════════════════════════════ */

function AnimatedCauldron({
  isBoiling,
  isDragOver,
  ingredientCount,
}: {
  isBoiling: boolean;
  isDragOver: boolean;
  ingredientCount: number;
}) {
  /* Intensidad de las animaciones basada en ingredientes */
  const intensity = Math.min(ingredientCount / 5, 1);
  const liquidColor1 = isDragOver
    ? "rgba(16,185,129,0.9)"
    : `rgba(16,185,129,${0.4 + intensity * 0.4})`;
  const liquidColor2 = isDragOver
    ? "rgba(139,92,246,0.8)"
    : `rgba(139,92,246,${0.3 + intensity * 0.3})`;

  return (
    <div className={`relative ${isBoiling ? "cauldron-boiling" : ""}`}>
      <svg
        viewBox="0 0 400 360"
        width="400"
        height="360"
        className="drop-shadow-2xl"
        role="img"
        aria-label="Caldero alquímico"
      >
        <defs>
          {/* Gradiente del líquido */}
          <radialGradient id="liquidGrad" cx="50%" cy="40%">
            <stop offset="0%" stopColor={liquidColor1} />
            <stop offset="60%" stopColor={liquidColor2} />
            <stop offset="100%" stopColor="rgba(76,29,149,0.4)" />
          </radialGradient>
          {/* Gradiente del cuerpo del caldero */}
          <linearGradient
            id="cauldronGrad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#2A2A2A" />
            <stop offset="40%" stopColor="#1A1A1A" />
            <stop offset="100%" stopColor="#0D0D0D" />
          </linearGradient>
          {/* Filtro de glow esmeralda */}
          <filter id="emeraldGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Filtro de glow fuego */}
          <filter id="fireGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── FUEGO ── */}
        <g filter="url(#fireGlow)">
          <ellipse
            cx="200"
            cy="325"
            rx="55"
            ry="12"
            fill="rgba(255,100,0,0.12)"
          />
          <path
            d="M160,325 Q165,295 175,308 Q185,280 195,300 Q200,270 210,300 Q215,280 225,308 Q235,295 240,325"
            fill="rgba(255,100,0,0.25)"
            className="cauldron-fire"
          />
          <path
            d="M175,325 Q180,305 190,312 Q200,288 210,312 Q220,305 225,325"
            fill="rgba(255,160,0,0.2)"
            className="cauldron-fire"
            style={{ animationDelay: "0.3s", animationDuration: "1.2s" }}
          />
          {/* Brasas */}
          <circle cx="180" cy="328" r="2" fill="rgba(255,120,0,0.5)" className="cauldron-spark" style={{ "--sx": "3px", "--sy": "-10px", "--dur": "2s" } as React.CSSProperties} />
          <circle cx="220" cy="326" r="1.5" fill="rgba(255,80,0,0.4)" className="cauldron-spark" style={{ "--sx": "-4px", "--sy": "-12px", "--dur": "2.5s", animationDelay: "0.8s" } as React.CSSProperties} />
        </g>

        {/* ── PATAS ── */}
        <line
          x1="145"
          y1="285"
          x2="125"
          y2="335"
          stroke="#2A2A2A"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <line
          x1="200"
          y1="290"
          x2="200"
          y2="340"
          stroke="#2A2A2A"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <line
          x1="255"
          y1="285"
          x2="275"
          y2="335"
          stroke="#2A2A2A"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* ── CUERPO DEL CALDERO ── */}
        <path
          d="M92,140 C88,145 78,200 98,258 Q115,288 200,292 Q285,288 302,258 C322,200 312,145 308,140"
          fill="url(#cauldronGrad)"
          stroke="#333"
          strokeWidth="2"
        />
        {/* Reflejo metálico */}
        <path
          d="M108,160 C106,190 100,235 120,262"
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* ── SOMBRA INTERIOR ── */}
        <ellipse cx="200" cy="143" rx="104" ry="24" fill="rgba(0,0,0,0.6)" />

        {/* ── LÍQUIDO ── */}
        <ellipse
          cx="200"
          cy="146"
          rx="99"
          ry="21"
          fill="url(#liquidGrad)"
          style={{ opacity: 0.9 }}
        />
        {/* Ondas del líquido */}
        <path
          d="M106,146 Q150,136 200,146 Q250,156 294,146"
          fill="none"
          stroke="rgba(16,185,129,0.3)"
          strokeWidth="2"
          className="cauldron-wave"
          style={{ "--wave-x": "6px", "--dur": "2.5s" } as React.CSSProperties}
        />
        <path
          d="M110,146 Q155,156 200,146 Q245,136 290,146"
          fill="none"
          stroke="rgba(139,92,246,0.2)"
          strokeWidth="2"
          className="cauldron-wave"
          style={{ "--wave-x": "-6px", "--dur": "3s" } as React.CSSProperties}
        />

        {/* ── BURBUJAS ── */}
        {[
          { cx: 165, cy: 148, r: 4, delay: "0s", dur: "2.5s", color: "16,185,129" },
          { cx: 210, cy: 143, r: 3, delay: "0.4s", dur: "2s", color: "139,92,246" },
          { cx: 240, cy: 150, r: 5, delay: "0.8s", dur: "3s", color: "16,185,129" },
          { cx: 150, cy: 145, r: 2.5, delay: "1.2s", dur: "2.2s", color: "139,92,246" },
          { cx: 225, cy: 144, r: 3.5, delay: "0.2s", dur: "2.8s", color: "16,185,129" },
          { cx: 188, cy: 141, r: 4, delay: "0.6s", dur: "2.4s", color: "139,92,246" },
          { cx: 175, cy: 147, r: 2, delay: "1s", dur: "1.8s", color: "16,185,129" },
          { cx: 255, cy: 146, r: 3, delay: "1.4s", dur: "2.6s", color: "139,92,246" },
        ].map((b, i) => (
          <circle
            key={i}
            cx={b.cx}
            cy={b.cy}
            r={b.r}
            fill={`rgba(${b.color},0.5)`}
            className="cauldron-bubble"
            style={{ animationDelay: b.delay, "--dur": b.dur } as React.CSSProperties}
          />
        ))}

        {/* ── VAPOR ── */}
        <g filter="url(#emeraldGlow)" opacity={0.35 + intensity * 0.3}>
          <path
            d="M178,118 Q173,96 183,76 Q188,56 178,36"
            fill="none"
            stroke="rgba(16,185,129,0.3)"
            strokeWidth="3"
            strokeLinecap="round"
            className="cauldron-steam"
            style={{ "--dur": "3s" } as React.CSSProperties}
          />
          <path
            d="M208,113 Q218,88 203,68 Q193,48 208,28"
            fill="none"
            stroke="rgba(139,92,246,0.25)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="cauldron-steam"
            style={{ "--dur": "3.5s", animationDelay: "0.5s" } as React.CSSProperties}
          />
          <path
            d="M232,116 Q227,92 237,72 Q242,52 232,32"
            fill="none"
            stroke="rgba(16,185,129,0.2)"
            strokeWidth="2"
            strokeLinecap="round"
            className="cauldron-steam"
            style={{ "--dur": "4s", animationDelay: "1s" } as React.CSSProperties}
          />
        </g>

        {/* ── BORDE / RIM ── */}
        <ellipse
          cx="200"
          cy="138"
          rx="112"
          ry="25"
          fill="none"
          stroke="#3A3A3A"
          strokeWidth="8"
        />
        <ellipse
          cx="200"
          cy="138"
          rx="112"
          ry="25"
          fill="none"
          stroke="rgba(16,185,129,0.25)"
          strokeWidth="2"
          filter="url(#emeraldGlow)"
          className="cauldron-rim-glow"
        />

        {/* ── ASAS ── */}
        <path
          d="M88,168 Q56,168 56,200 Q56,232 88,232"
          fill="none"
          stroke="#333"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M312,168 Q344,168 344,200 Q344,232 312,232"
          fill="none"
          stroke="#333"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* ── CHISPAS (salen del líquido) ── */}
        <circle cx="172" cy="128" r="1.5" fill="#10B981" className="cauldron-spark" style={{ "--sx": "-8px", "--sy": "-20px", "--dur": "1.8s" } as React.CSSProperties} />
        <circle cx="222" cy="124" r="1" fill="#A78BFA" className="cauldron-spark" style={{ "--sx": "6px", "--sy": "-25px", "--dur": "2.2s", animationDelay: "0.7s" } as React.CSSProperties} />
        <circle cx="195" cy="126" r="1.5" fill="#10B981" className="cauldron-spark" style={{ "--sx": "3px", "--sy": "-22px", "--dur": "2s", animationDelay: "1.3s" } as React.CSSProperties} />
      </svg>

      {/* Glow debajo del caldero */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 h-12 rounded-full blur-2xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse, rgba(255,100,0,${0.15 + intensity * 0.15}) 0%, transparent 70%)`,
        }}
      />

      {/* Indicador de drag over */}
      {isDragOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="text-emerald-400/60 text-lg font-cinzel font-bold animate-pulse">
            ¡Suelta aquí!
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE: Burbuja de Skill Draggable
═══════════════════════════════════════════════════════════════ */

function SkillBubble({
  skill,
  isUsed,
  onClick,
}: {
  skill: AlchemySkill;
  isUsed: boolean;
  onClick: () => void;
}) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/json", JSON.stringify(skill));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable={!isUsed}
      onDragStart={handleDragStart}
      onClick={!isUsed ? onClick : undefined}
    >
      <motion.div
        className={`
          relative group rounded-xl px-3 py-3 cursor-pointer select-none
          border transition-all duration-200
          ${
            isUsed
              ? "opacity-35 cursor-not-allowed border-[#1A1A1A] bg-[#0A0A0A]"
              : "border-[#1F1F1F] bg-[#0D0D0D] hover:border-emerald-500/30 hover:bg-emerald-500/5"
          }
        `}
        whileHover={isUsed ? {} : { scale: 1.04, y: -2 }}
        whileTap={isUsed ? {} : { scale: 0.97 }}
        layout
      >
        {/* Glow de fondo al hover */}
        {!isUsed && (
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(16,185,129,0.08) 0%, transparent 70%)",
            }}
          />
        )}
        <div className="flex items-start gap-2.5">
          <span className="text-xl flex-shrink-0 mt-0.5">{skill.emoji}</span>
          <div className="min-w-0 flex-1">
            <div
              className={`text-xs font-semibold leading-tight ${
                isUsed ? "text-[#444]" : "text-emerald-300/90"
              }`}
            >
              {skill.name}
            </div>
            <div className="text-[10px] text-[#555] mt-0.5 truncate">
              {skill.subtitle}
            </div>
          </div>
        </div>
        {isUsed && (
          <div className="absolute top-1.5 right-1.5">
            <Check size={10} className="text-emerald-500/50" />
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE: Pill de Ingrediente en el Caldero
═══════════════════════════════════════════════════════════════ */

function IngredientPill({
  skill,
  onRemove,
}: {
  skill: AlchemySkill;
  onRemove: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ scale: 0, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0, opacity: 0, y: -10 }}
      transition={{ type: "spring", damping: 15, stiffness: 300 }}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 group"
    >
      <span className="text-xs">{skill.emoji}</span>
      <span className="text-[10px] text-emerald-300/80 font-medium whitespace-nowrap">
        {skill.name}
      </span>
      <motion.button
        onClick={() => onRemove(skill.id)}
        className="ml-0.5 p-0.5 rounded-full hover:bg-red-500/20 text-[#555] hover:text-red-400 transition-colors"
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.8 }}
      >
        <X size={10} />
      </motion.button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE: Overlay de Transmutación
   Loading mágico con runas girando y mensajes místicos.
═══════════════════════════════════════════════════════════════ */

const TRANSMUTATION_MESSAGES = [
  "Disolviendo ingredientes en el éter...",
  "Transmutando tokens alquímicos...",
  "Invocando la Obra Magna...",
  "Fusionando esencias arcanas...",
  "Cristalizando el conocimiento...",
  "¡La transmutación está casi completa!",
];

function TransmutationOverlay() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % TRANSMUTATION_MESSAGES.length);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "rgba(5,5,5,0.92)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex flex-col items-center gap-8">
        {/* Runas orbitando */}
        <div className="relative w-40 h-40">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="absolute inset-0 flex items-center justify-center alch-rune-orbit"
              style={{
                "--dur": `${3 + i * 0.4}s`,
                animationDelay: `${i * 0.5}s`,
              } as React.CSSProperties}
            >
              <span
                className="text-2xl"
                style={{
                  color:
                    i % 2 === 0
                      ? "rgba(16,185,129,0.6)"
                      : "rgba(139,92,246,0.5)",
                  textShadow:
                    i % 2 === 0
                      ? "0 0 10px rgba(16,185,129,0.4)"
                      : "0 0 10px rgba(139,92,246,0.3)",
                }}
              >
                {RUNES[i]}
              </span>
            </div>
          ))}
          {/* Símbolo central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                filter: [
                  "drop-shadow(0 0 10px rgba(16,185,129,0.4))",
                  "drop-shadow(0 0 30px rgba(16,185,129,0.8))",
                  "drop-shadow(0 0 10px rgba(16,185,129,0.4))",
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-5xl"
            >
              ⚗️
            </motion.div>
          </div>
        </div>

        {/* Mensaje animado */}
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm font-cinzel text-emerald-400/70"
          >
            {TRANSMUTATION_MESSAGES[msgIndex]}
          </motion.p>
        </AnimatePresence>

        {/* Barra de progreso */}
        <motion.div
          className="w-64 h-1 rounded-full bg-[#1A1A1A] overflow-hidden"
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, #10B981, #8B5CF6, #10B981)",
              backgroundSize: "200% 100%",
            }}
            animate={{
              width: ["0%", "100%"],
              backgroundPosition: ["0% 50%", "200% 50%"],
            }}
            transition={{ duration: 3.5, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE: Modal de Resultado
   Muestra el SKILL.md generado con preview, copiar y descargar.
═══════════════════════════════════════════════════════════════ */

function AlchemyResultModal({
  markdown,
  onClose,
}: {
  markdown: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [viewMode, setViewMode] = useState<"preview" | "raw">("preview");

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [markdown]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SKILL.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [markdown]);

  const handleSave = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(5,5,5,0.9)",
        backdropFilter: "blur(16px)",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 20, stiffness: 250 }}
        className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border border-emerald-500/15 overflow-hidden"
        style={{ background: "rgba(10,10,10,0.98)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-emerald-500/10"
          style={{
            background:
              "linear-gradient(90deg, rgba(16,185,129,0.05) 0%, rgba(139,92,246,0.03) 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-2xl"
            >
              ✨
            </motion.div>
            <div>
              <h2 className="font-cinzel font-bold text-emerald-300/90 text-sm">
                ¡Obra Magna Completada!
              </h2>
              <p className="text-[10px] text-[#555]">
                Tu SKILL.md ha sido transmutado con éxito
              </p>
            </div>
          </div>
          <motion.button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-[#555] hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={16} />
          </motion.button>
        </div>

        {/* Tabs preview/raw */}
        <div className="flex items-center gap-1 px-6 pt-3">
          {(["preview", "raw"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                viewMode === mode
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "text-[#555] hover:text-[#888]"
              }`}
            >
              {mode === "preview" ? "Vista Previa" : "Código Raw"}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          {viewMode === "preview" ? (
            <div className="prose prose-invert prose-sm max-w-none prose-headings:font-cinzel prose-headings:text-emerald-300/90 prose-p:text-[#999] prose-strong:text-emerald-200/80 prose-code:text-purple-300/80 prose-code:bg-purple-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-[#0D0D0D] prose-pre:border prose-pre:border-[#1F1F1F] prose-li:text-[#888] prose-a:text-emerald-400 prose-blockquote:border-emerald-500/30 prose-blockquote:text-[#777] prose-hr:border-[#1A1A1A]">
              <ReactMarkdown>{markdown}</ReactMarkdown>
            </div>
          ) : (
            <pre className="text-[11px] text-emerald-300/60 font-mono leading-relaxed whitespace-pre-wrap break-words">
              {markdown}
            </pre>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-emerald-500/10">
          <motion.button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-all"
            style={{
              background: copied
                ? "rgba(16,185,129,0.15)"
                : "rgba(16,185,129,0.05)",
              borderColor: copied
                ? "rgba(16,185,129,0.4)"
                : "rgba(16,185,129,0.15)",
              color: copied ? "#6EE7B7" : "#10B981",
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "¡Copiado!" : "Copiar al portapapeles"}
          </motion.button>

          <motion.button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border border-purple-500/15 bg-purple-500/5 text-purple-400 hover:border-purple-500/30 transition-all"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Download size={14} />
            Descargar SKILL.md
          </motion.button>

          <motion.button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-all"
            style={{
              background: saved
                ? "rgba(255,215,0,0.1)"
                : "rgba(255,215,0,0.03)",
              borderColor: saved
                ? "rgba(255,215,0,0.3)"
                : "rgba(255,215,0,0.1)",
              color: saved ? "#FCD34D" : "rgba(255,215,0,0.6)",
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Save size={14} />
            {saved ? "¡Guardado!" : "Guardar en workspace/skills/"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL: Página del Alquimista de Habilidades
═══════════════════════════════════════════════════════════════ */

export default function SkillAlchemistPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("frontend");
  const [ingredients, setIngredients] = useState<AlchemySkill[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isTransmuting, setIsTransmuting] = useState(false);
  const [resultMd, setResultMd] = useState<string | null>(null);

  /* Restaurar ingredientes de localStorage */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("alch-cauldron-ingredients");
      if (saved) {
        const parsed = JSON.parse(saved) as AlchemySkill[];
        if (Array.isArray(parsed)) setIngredients(parsed);
      }
    } catch {
      /* localStorage no disponible o datos corruptos */
    }
  }, []);

  /* Persistir ingredientes en localStorage */
  useEffect(() => {
    try {
      localStorage.setItem(
        "alch-cauldron-ingredients",
        JSON.stringify(ingredients)
      );
    } catch {
      /* localStorage no disponible */
    }
  }, [ingredients]);

  /* ── Handlers de Drag & Drop ── */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    /* Solo si realmente salimos del área de drop, no de un hijo */
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      try {
        const data = e.dataTransfer.getData("application/json");
        if (!data) return;
        const skill = JSON.parse(data) as AlchemySkill;
        if (ingredients.find((i) => i.id === skill.id)) return;
        setIngredients((prev) => [...prev, skill]);
      } catch {
        /* datos inválidos */
      }
    },
    [ingredients]
  );

  /* ── Añadir/quitar skill por click ── */
  const toggleSkill = useCallback(
    (skill: AlchemySkill) => {
      if (ingredients.find((i) => i.id === skill.id)) {
        setIngredients((prev) => prev.filter((i) => i.id !== skill.id));
      } else {
        setIngredients((prev) => [...prev, skill]);
      }
    },
    [ingredients]
  );

  const removeIngredient = useCallback((id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  }, []);

  /* ── Iniciar la transmutación ── */
  const startAlchemy = useCallback(async () => {
    if (ingredients.length === 0 || isTransmuting) return;
    setIsTransmuting(true);
    /* Simular tiempo de transmutación para los efectos */
    await new Promise((resolve) => setTimeout(resolve, 3800));
    const md = generateSkillMd(ingredients);
    setResultMd(md);
    setIsTransmuting(false);
  }, [ingredients, isTransmuting]);

  /* ── Limpiar el caldero ── */
  const clearCauldron = useCallback(() => {
    setIngredients([]);
  }, []);

  const filteredSkills = SKILLS.filter((s) => s.category === activeCategory);
  const currentCategoryData = CATEGORIES.find(
    (c) => c.key === activeCategory
  );

  return (
    <div className="relative min-h-screen bg-[#030305] overflow-x-hidden">
      {/* Canvas de partículas rúnicas */}
      <RuneParticleCanvas />

      {/* Niebla radial de fondo */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, rgba(16,185,129,0.04) 0%, transparent 50%), " +
            "radial-gradient(ellipse at 30% 30%, rgba(139,92,246,0.03) 0%, transparent 40%), " +
            "radial-gradient(ellipse at 70% 80%, rgba(96,165,250,0.02) 0%, transparent 40%)",
        }}
      />

      {/* Contenido principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ── HEADER ── */}
        <header className="text-center mb-8 sm:mb-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[10px] text-[#444] hover:text-emerald-400/60 transition-colors mb-6"
          >
            <ArrowLeft size={12} />
            Volver al Grimorio
          </Link>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-black mb-3"
          >
            <span className="shimmer-emerald">⚗️ Alquimista de Habilidades</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-[#555] max-w-xl mx-auto leading-relaxed"
          >
            &ldquo;Lanza tus habilidades al caldero, invoca la transmutación
            y forja una <span className="text-emerald-400/60">Skill</span> lista
            para producción.&rdquo;
          </motion.p>
        </header>

        {/* ── GRID PRINCIPAL ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* ═══ COLUMNA IZQUIERDA: Skills ═══ */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-5"
          >
            {/* Tabs de categorías */}
            <div className="flex flex-wrap gap-2 mb-5">
              {CATEGORIES.map((cat) => (
                <motion.button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] sm:text-[11px]
                    font-medium border transition-all whitespace-nowrap
                    ${
                      activeCategory === cat.key
                        ? "border-emerald-500/30 bg-emerald-500/8 text-emerald-300"
                        : "border-[#1A1A1A] bg-[#0A0A0A] text-[#555] hover:border-[#333] hover:text-[#888]"
                    }
                  `}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span>{cat.emoji}</span>
                  <span className="hidden sm:inline">{cat.label}</span>
                  <span className="sm:hidden">
                    {cat.label.split(" ")[0]}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Título de categoría activa */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4"
              >
                <h2
                  className="text-xs font-cinzel font-bold mb-1"
                  style={{ color: `${currentCategoryData?.color}99` }}
                >
                  {currentCategoryData?.emoji}{" "}
                  {currentCategoryData?.label}
                </h2>
                <p className="text-[9px] text-[#444]">
                  Arrastra las burbujas al caldero o haz click para añadir
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Grid de skill bubbles */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
              >
                {filteredSkills.map((skill, index) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, scale: 0.8, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      delay: index * 0.05,
                      type: "spring",
                      damping: 15,
                    }}
                  >
                    <SkillBubble
                      skill={skill}
                      isUsed={ingredients.some((i) => i.id === skill.id)}
                      onClick={() => toggleSkill(skill)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* ═══ COLUMNA DERECHA: Caldero ═══ */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-7 flex flex-col items-center"
          >
            {/* Zona de drop del caldero */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative rounded-3xl p-4 transition-all duration-300
                ${isDragOver ? "alch-dropzone-active border-2 border-dashed" : "border-2 border-transparent"}
              `}
            >
              <AnimatedCauldron
                isBoiling={isTransmuting}
                isDragOver={isDragOver}
                ingredientCount={ingredients.length}
              />

              {/* Texto de guía cuando el caldero está vacío */}
              {ingredients.length === 0 && !isDragOver && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute left-1/2 -translate-x-1/2 bottom-20 text-[11px] text-[#444] text-center whitespace-nowrap"
                >
                  ↑ Arrastra habilidades aquí o haz click en ellas ↑
                </motion.p>
              )}
            </div>

            {/* Contador de ingredientes */}
            {ingredients.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mb-3"
              >
                <FlaskConical
                  size={12}
                  className="text-emerald-500/50"
                />
                <span className="text-[10px] text-emerald-400/60 font-cinzel">
                  {ingredients.length} ingrediente
                  {ingredients.length !== 1 ? "s" : ""} en el caldero
                </span>
                <motion.button
                  onClick={clearCauldron}
                  className="text-[9px] text-red-400/40 hover:text-red-400/70 transition-colors ml-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Vaciar
                </motion.button>
              </motion.div>
            )}

            {/* Lista de ingredientes */}
            <div className="flex flex-wrap gap-2 justify-center max-w-lg mb-6 min-h-[32px]">
              <AnimatePresence>
                {ingredients.map((ing) => (
                  <IngredientPill
                    key={ing.id}
                    skill={ing}
                    onRemove={removeIngredient}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* ── BOTÓN INICIAR ALQUIMIA ── */}
            <motion.button
              onClick={startAlchemy}
              disabled={ingredients.length === 0 || isTransmuting}
              className={`
                relative px-10 sm:px-14 py-4 sm:py-5 rounded-2xl font-cinzel font-black
                text-base sm:text-lg tracking-wider
                border-2 transition-all duration-300 overflow-hidden
                ${
                  ingredients.length === 0
                    ? "border-[#1A1A1A] bg-[#0A0A0A] text-[#333] cursor-not-allowed"
                    : "border-emerald-500/30 text-emerald-300 alch-glow-pulse cursor-pointer"
                }
              `}
              style={
                ingredients.length > 0
                  ? {
                      background:
                        "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(139,92,246,0.08) 100%)",
                    }
                  : undefined
              }
              whileHover={
                ingredients.length > 0
                  ? {
                      scale: 1.05,
                      boxShadow:
                        "0 0 40px rgba(16,185,129,0.4), 0 0 80px rgba(139,92,246,0.2)",
                    }
                  : {}
              }
              whileTap={ingredients.length > 0 ? { scale: 0.97 } : {}}
            >
              <Sparkles
                size={18}
                className={`inline mr-2 ${
                  ingredients.length > 0
                    ? "text-emerald-400"
                    : "text-[#333]"
                }`}
              />
              INICIAR ALQUIMIA
              <Sparkles
                size={18}
                className={`inline ml-2 ${
                  ingredients.length > 0
                    ? "text-purple-400"
                    : "text-[#333]"
                }`}
              />
            </motion.button>

            {ingredients.length === 0 && (
              <p className="text-[9px] text-[#333] mt-3 text-center">
                Añade al menos un ingrediente para comenzar la transmutación
              </p>
            )}
          </motion.div>
        </div>

        {/* ── FOOTER ── */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12 sm:mt-16 pb-8"
        >
          <p className="text-[9px] text-[#333]">
            Alquimista de Habilidades v1.0 — Alchemical Agent Ecosystem
          </p>
          <p className="text-[8px] text-[#222] mt-1">
            &ldquo;Where Intelligence is Forged, Not Fetched.&rdquo;
          </p>
        </motion.footer>
      </div>

      {/* ── OVERLAY DE TRANSMUTACIÓN ── */}
      <AnimatePresence>
        {isTransmuting && <TransmutationOverlay />}
      </AnimatePresence>

      {/* ── MODAL DE RESULTADO ── */}
      <AnimatePresence>
        {resultMd && (
          <AlchemyResultModal
            markdown={resultMd}
            onClose={() => setResultMd(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
