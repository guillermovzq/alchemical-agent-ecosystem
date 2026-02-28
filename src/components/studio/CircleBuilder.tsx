"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wand2, Plus, Minus, Sparkles, Brain, Zap, BookOpen, Eye, Shield, Activity, ChevronRight } from "lucide-react";
import { useDashboardStore, type AgentRole, type AlchemicalCircle } from "@/lib/store/dashboard";

/* ═══════════════════════════════════════════════════════════════
   TIPOS
═══════════════════════════════════════════════════════════════ */

interface CircleTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  roles: AgentRole[];
  useCase: string;
  complexity: "simple" | "medio" | "avanzado";
}

type RoleIconComponent = React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;

/* ═══════════════════════════════════════════════════════════════
   PLANTILLAS DE CÍRCULOS
═══════════════════════════════════════════════════════════════ */

const CIRCLE_TEMPLATES: CircleTemplate[] = [
  {
    id: "research",
    name: "Círculo de Investigación",
    description: "Análisis profundo y síntesis de conocimiento",
    icon: "🔬",
    roles: ["prima-materia", "weaver", "oracle"],
    useCase: "Investigación, análisis de documentos, síntesis de información",
    complexity: "medio",
  },
  {
    id: "code",
    name: "Círculo de Forja de Código",
    description: "Desarrollo, revisión y optimización de código",
    icon: "⚙️",
    roles: ["catalyst", "refiner", "sentinel"],
    useCase: "Generación de código, refactoring, code review",
    complexity: "avanzado",
  },
  {
    id: "content",
    name: "Círculo de Creación",
    description: "Generación y refinamiento de contenido premium",
    icon: "✍️",
    roles: ["prima-materia", "refiner", "scribe"],
    useCase: "Redacción, edición, documentación técnica",
    complexity: "simple",
  },
  {
    id: "analysis",
    name: "Círculo Oracular",
    description: "Predicción, análisis de datos y toma de decisiones",
    icon: "🔮",
    roles: ["oracle", "weaver", "sentinel"],
    useCase: "Análisis de datos, predicciones, evaluación de riesgos",
    complexity: "avanzado",
  },
  {
    id: "custom",
    name: "Círculo Personalizado",
    description: "Diseña tu propio equipo alquímico",
    icon: "⚗️",
    roles: [],
    useCase: "Cualquier caso de uso personalizado",
    complexity: "medio",
  },
];

const ROLE_INFO: Record<AgentRole, { icon: RoleIconComponent; label: string; desc: string; color: string }> = {
  "prima-materia": { icon: Brain as RoleIconComponent, label: "Prima Materia", desc: "Planificación y descomposición", color: "#FFD700" },
  catalyst: { icon: Zap as RoleIconComponent, label: "Catalizador", desc: "Ejecución rápida y transformación", color: "#FF4D00" },
  refiner: { icon: Sparkles as RoleIconComponent, label: "Refinador", desc: "Pulido y perfeccionamiento", color: "#10B981" },
  scribe: { icon: BookOpen as RoleIconComponent, label: "Escriba", desc: "Memoria y documentación", color: "#F59E0B" },
  oracle: { icon: Eye as RoleIconComponent, label: "Oráculo", desc: "Predicción y análisis profundo", color: "#A78BFA" },
  sentinel: { icon: Shield as RoleIconComponent, label: "Centinela", desc: "Validación y seguridad", color: "#60A5FA" },
  weaver: { icon: Activity as RoleIconComponent, label: "Tejedor", desc: "Síntesis y conexión", color: "#8B5CF6" },
};

const COMPLEXITY_CONFIG = {
  simple: { label: "Simple", color: "#10B981", dots: 1 },
  medio: { label: "Medio", color: "#FFD700", dots: 2 },
  avanzado: { label: "Avanzado", color: "#FF4D00", dots: 3 },
};

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════════ */

export default function CircleBuilder() {
  const { isForgeModalOpen, closeForgeModal, addCircle, addConsoleEntry } = useDashboardStore();

  const [step, setStep] = useState<"template" | "configure" | "forge">("template");
  const [selectedTemplate, setSelectedTemplate] = useState<CircleTemplate | null>(null);
  const [circleName, setCircleName] = useState("");
  const [circleDesc, setCircleDesc] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<AgentRole[]>([]);
  const [isForging, setIsForging] = useState(false);
  const [forgeProgress, setForgeProgress] = useState(0);

  const handleSelectTemplate = useCallback((template: CircleTemplate) => {
    setSelectedTemplate(template);
    setSelectedRoles(template.roles);
    setCircleName(template.name);
    setCircleDesc(template.description);
    setStep("configure");
  }, []);

  const toggleRole = useCallback((role: AgentRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }, []);

  const handleForge = useCallback(async () => {
    if (!circleName.trim() || selectedRoles.length === 0) return;

    setStep("forge");
    setIsForging(true);

    const steps = [
      "⚗️ Preparando el crisol alquímico...",
      "🔥 Invocando agentes seleccionados...",
      "🕸️ Tejiendo conexiones entre agentes...",
      "✨ Calibrando flujos de transmutación...",
      "📜 Registrando en el Grimorio...",
    ];

    for (let i = 0; i <= 100; i += 20) {
      setForgeProgress(i);
      addConsoleEntry({
        level: "transmutation",
        message: steps[Math.floor(i / 20)] || "Finalizando...",
      });
      await new Promise((r) => setTimeout(r, 600));
    }

    // Crear el círculo
    const newCircle: AlchemicalCircle = {
      id: `circle-${Date.now()}`,
      name: circleName,
      description: circleDesc,
      agents: selectedRoles.map((r) => r),
      phase: "nigredo",
      status: "idle",
      createdAt: new Date(),
      nodes: [],
      edges: [],
    };

    addCircle(newCircle);
    addConsoleEntry({
      level: "success",
      message: `✓ Círculo "${circleName}" forjado exitosamente. ${selectedRoles.length} agentes invocados.`,
    });

    setIsForging(false);

    // Reset y cerrar
    setTimeout(() => {
      closeForgeModal();
      setStep("template");
      setSelectedTemplate(null);
      setCircleName("");
      setCircleDesc("");
      setSelectedRoles([]);
      setForgeProgress(0);
    }, 1500);
  }, [circleName, circleDesc, selectedRoles, addCircle, addConsoleEntry, closeForgeModal]);

  const handleClose = useCallback(() => {
    closeForgeModal();
    setTimeout(() => {
      setStep("template");
      setSelectedTemplate(null);
      setCircleName("");
      setCircleDesc("");
      setSelectedRoles([]);
      setForgeProgress(0);
      setIsForging(false);
    }, 300);
  }, [closeForgeModal]);

  return (
    <AnimatePresence>
      {isForgeModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-2xl rounded-2xl border border-[#FFD700]/20 overflow-hidden pointer-events-auto"
              style={{
                background: "rgba(13,13,13,0.98)",
                boxShadow: "0 0 60px rgba(255,215,0,0.1), 0 20px 60px rgba(0,0,0,0.8)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-4 border-b border-[#FFD700]/10"
                style={{ background: "linear-gradient(90deg, rgba(255,215,0,0.05) 0%, transparent 100%)" }}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="text-2xl"
                  >
                    ⚗️
                  </motion.div>
                  <div>
                    <h2 className="font-cinzel text-base font-bold text-[#FFD700]">
                      Forja un Nuevo Círculo
                    </h2>
                    <p className="text-[10px] text-[#666]">
                      {step === "template" && "Elige una plantilla alquímica"}
                      {step === "configure" && "Configura tu equipo de agentes"}
                      {step === "forge" && "Transmutación en proceso..."}
                    </p>
                  </div>
                </div>

                {/* Indicador de pasos */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {["template", "configure", "forge"].map((s, i) => (
                      <div key={s} className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            step === s
                              ? "bg-[#FFD700] scale-125"
                              : ["template", "configure", "forge"].indexOf(step) > i
                              ? "bg-[#FFD700]/40"
                              : "bg-[#2A2A2A]"
                          }`}
                        />
                        {i < 2 && <div className="w-4 h-px bg-[#2A2A2A]" />}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleClose}
                    className="p-1.5 rounded-lg text-[#555] hover:text-[#FFD700]/60 hover:bg-[#FFD700]/5 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <AnimatePresence mode="wait">
                  {/* PASO 1: Selección de plantilla */}
                  {step === "template" && (
                    <motion.div
                      key="template"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="grid grid-cols-1 gap-3"
                    >
                      {CIRCLE_TEMPLATES.map((template) => {
                        const complexity = COMPLEXITY_CONFIG[template.complexity];
                        return (
                          <motion.button
                            key={template.id}
                            onClick={() => handleSelectTemplate(template)}
                            className="flex items-center gap-4 p-4 rounded-xl border border-[#2A2A2A] hover:border-[#FFD700]/30 transition-all text-left group"
                            style={{ background: "rgba(17,17,17,0.8)" }}
                            whileHover={{ scale: 1.01, x: 2 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                              style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.1)" }}
                            >
                              {template.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-[#FFD700]/90 font-cinzel">
                                  {template.name}
                                </span>
                                <div className="flex gap-0.5">
                                  {Array.from({ length: complexity.dots }).map((_, i) => (
                                    <div
                                      key={i}
                                      className="w-1.5 h-1.5 rounded-full"
                                      style={{ background: complexity.color }}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-[#888] mb-1">{template.description}</p>
                              <p className="text-[10px] text-[#555]">{template.useCase}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="flex gap-1">
                                {template.roles.slice(0, 3).map((role) => {
                                  const info = ROLE_INFO[role];
                                  return (
                                    <div
                                      key={role}
                                      className="w-6 h-6 rounded-full flex items-center justify-center"
                                      style={{ background: `${info.color}15`, border: `1px solid ${info.color}30` }}
                                      title={info.label}
                                    >
                                      <info.icon size={10} style={{ color: info.color }} />
                                    </div>
                                  );
                                })}
                              </div>
                              <ChevronRight size={14} className="text-[#444] group-hover:text-[#FFD700]/40 transition-colors" />
                            </div>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* PASO 2: Configuración */}
                  {step === "configure" && (
                    <motion.div
                      key="configure"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {/* Nombre y descripción */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-[#FFD700]/60 font-cinzel mb-1.5 block">
                            NOMBRE DEL CÍRCULO
                          </label>
                          <input
                            type="text"
                            value={circleName}
                            onChange={(e) => setCircleName(e.target.value)}
                            placeholder="Ej: Círculo de Análisis Profundo"
                            className="w-full px-3 py-2.5 rounded-lg text-sm text-[#FFD700]/90 placeholder-[#444] outline-none transition-all"
                            style={{
                              background: "rgba(17,17,17,0.8)",
                              border: "1px solid rgba(255,215,0,0.15)",
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = "rgba(255,215,0,0.4)";
                              e.target.style.boxShadow = "0 0 15px rgba(255,215,0,0.1)";
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = "rgba(255,215,0,0.15)";
                              e.target.style.boxShadow = "none";
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#FFD700]/60 font-cinzel mb-1.5 block">
                            DESCRIPCIÓN (OPCIONAL)
                          </label>
                          <textarea
                            value={circleDesc}
                            onChange={(e) => setCircleDesc(e.target.value)}
                            placeholder="Describe el propósito de este Círculo alquímico..."
                            rows={2}
                            className="w-full px-3 py-2.5 rounded-lg text-sm text-[#888] placeholder-[#444] outline-none resize-none transition-all"
                            style={{
                              background: "rgba(17,17,17,0.8)",
                              border: "1px solid rgba(255,215,0,0.1)",
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = "rgba(255,215,0,0.3)";
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = "rgba(255,215,0,0.1)";
                            }}
                          />
                        </div>
                      </div>

                      {/* Selección de roles */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-xs text-[#FFD700]/60 font-cinzel">
                            ROLES DEL CÍRCULO
                          </label>
                          <span className="text-[10px] text-[#555]">
                            {selectedRoles.length} seleccionados
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {(Object.entries(ROLE_INFO) as [AgentRole, typeof ROLE_INFO[AgentRole]][]).map(([role, info]) => {
                            const isSelected = selectedRoles.includes(role);
                            const RoleIcon = info.icon;
                            return (
                              <motion.button
                                key={role}
                                onClick={() => toggleRole(role)}
                                className="flex items-center gap-2.5 p-3 rounded-lg border transition-all text-left"
                                style={{
                                  background: isSelected ? `${info.color}10` : "rgba(17,17,17,0.6)",
                                  borderColor: isSelected ? `${info.color}40` : "rgba(42,42,42,0.8)",
                                  boxShadow: isSelected ? `0 0 15px ${info.color}15` : "none",
                                }}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                              >
                                <div
                                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{
                                    background: `${info.color}15`,
                                    border: `1px solid ${info.color}${isSelected ? "40" : "20"}`,
                                  }}
                                >
                                  <RoleIcon size={12} style={{ color: info.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium" style={{ color: isSelected ? info.color : "#888" }}>
                                    {info.label}
                                  </div>
                                  <div className="text-[9px] text-[#555] truncate">{info.desc}</div>
                                </div>
                                <div className="flex-shrink-0">
                                  {isSelected ? (
                                    <Minus size={12} style={{ color: info.color }} />
                                  ) : (
                                    <Plus size={12} className="text-[#444]" />
                                  )}
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Sugerencia de IA */}
                      <motion.div
                        className="flex items-start gap-3 p-3 rounded-lg border border-[#8B5CF6]/20"
                        style={{ background: "rgba(139,92,246,0.05)" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Wand2 size={14} className="text-[#8B5CF6] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-[#8B5CF6]/80 font-medium mb-0.5">Sugerencia Alquímica</p>
                          <p className="text-[10px] text-[#666]">
                            Para máxima eficiencia, combina un <span className="text-[#FFD700]/70">Prima Materia</span> con
                            al menos un <span className="text-[#10B981]/70">Refinador</span> o <span className="text-[#60A5FA]/70">Centinela</span> para
                            garantizar calidad en los outputs.
                          </p>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* PASO 3: Forja en proceso */}
                  {step === "forge" && (
                    <motion.div
                      key="forge"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center py-8 space-y-6"
                    >
                      {/* Animación central */}
                      <div className="relative w-32 h-32">
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-[#FFD700]/20"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div
                          className="absolute inset-3 rounded-full border border-[#FF4D00]/30"
                          animate={{ rotate: -360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div
                          className="absolute inset-6 rounded-full border border-[#8B5CF6]/20"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div
                            className="text-4xl"
                            animate={{
                              scale: [1, 1.2, 1],
                              filter: [
                                "drop-shadow(0 0 5px rgba(255,215,0,0.3))",
                                "drop-shadow(0 0 20px rgba(255,215,0,0.8))",
                                "drop-shadow(0 0 5px rgba(255,215,0,0.3))",
                              ],
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            ⚗️
                          </motion.div>
                        </div>
                      </div>

                      {/* Texto de estado */}
                      <div className="text-center">
                        <h3 className="font-cinzel text-lg font-bold text-[#FFD700] mb-1">
                          {isForging ? "Forjando el Círculo..." : "¡Círculo Forjado!"}
                        </h3>
                        <p className="text-sm text-[#888]">
                          {isForging
                            ? `Transmutando ${selectedRoles.length} agentes en armonía alquímica`
                            : `"${circleName}" está listo para invocar`}
                        </p>
                      </div>

                      {/* Barra de progreso */}
                      <div className="w-full max-w-xs">
                        <div className="flex justify-between text-[10px] text-[#555] mb-1.5">
                          <span>Progreso de transmutación</span>
                          <span>{forgeProgress}%</span>
                        </div>
                        <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              background: "linear-gradient(90deg, #FFD700, #FF4D00)",
                              width: `${forgeProgress}%`,
                            }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>

                      {/* Roles seleccionados */}
                      <div className="flex gap-2 flex-wrap justify-center">
                        {selectedRoles.map((role) => {
                          const info = ROLE_INFO[role];
                          const RoleIcon = info.icon;
                          return (
                            <motion.div
                              key={role}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px]"
                              style={{
                                background: `${info.color}15`,
                                border: `1px solid ${info.color}30`,
                                color: info.color,
                              }}
                            >
                              <RoleIcon size={10} />
                              {info.label}
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer con acciones */}
              {step !== "forge" && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-[#FFD700]/10">
                  <button
                    onClick={step === "template" ? handleClose : () => setStep("template")}
                    className="text-xs text-[#555] hover:text-[#888] transition-colors"
                  >
                    {step === "template" ? "Cancelar" : "← Volver"}
                  </button>

                  {step === "configure" && (
                    <motion.button
                      onClick={handleForge}
                      disabled={!circleName.trim() || selectedRoles.length === 0}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold font-cinzel transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background: "linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,77,0,0.15))",
                        border: "1px solid rgba(255,215,0,0.4)",
                        color: "#FFD700",
                      }}
                      whileHover={circleName.trim() && selectedRoles.length > 0 ? {
                        scale: 1.02,
                        boxShadow: "0 0 25px rgba(255,215,0,0.3)",
                      } : {}}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Sparkles size={14} />
                      Forjar Círculo
                    </motion.button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
