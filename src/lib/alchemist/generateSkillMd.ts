/* ═══════════════════════════════════════════════════════════════
   GENERADOR DE SKILL.md — Transmutación Alquímica
   Combina ingredientes (skills) en un documento SKILL.md profesional.
═══════════════════════════════════════════════════════════════ */

export interface AlchemySkill {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
  category: "frontend" | "backend" | "ai" | "performance" | "devops";
}

/* ── Mapeo de categoría a etiquetas ── */
const CATEGORY_TAGS: Record<string, string[]> = {
  frontend: ["frontend", "ui", "react", "next.js", "styling"],
  backend: ["backend", "api", "server", "database", "python"],
  ai: ["ai", "llm", "agents", "rag", "ml"],
  performance: ["performance", "optimization", "caching", "profiling"],
  devops: ["devops", "docker", "ci-cd", "security", "monitoring"],
};

const CATEGORY_LABELS: Record<string, string> = {
  frontend: "Frontend & Visual Stack",
  backend: "Backend Engineering",
  ai: "IA & Multi-Agent Systems",
  performance: "Performance & Optimization",
  devops: "DevOps & Architecture",
};

/* ── Determinar perfil de la skill combinada ── */
function determineSkillProfile(
  ingredients: AlchemySkill[],
  categories: string[]
): { name: string; category: string; archetype: string } {
  const catCount = categories.length;
  const hasF = categories.includes("frontend");
  const hasB = categories.includes("backend");
  const hasAI = categories.includes("ai");
  const hasP = categories.includes("performance");
  const hasD = categories.includes("devops");

  if (catCount >= 4)
    return { name: "Magnum Opus Universal Agent", category: "magnum-opus", archetype: "Obra Magna" };
  if (hasF && hasB && hasAI)
    return { name: "Full-Stack Alchemical Agent", category: "full-stack-agent", archetype: "Agente Alquímico Full-Stack" };
  if (hasF && hasB)
    return { name: "Full-Stack Transmutation", category: "full-stack", archetype: "Transmutación Full-Stack" };
  if (hasAI && hasB)
    return { name: "AI Backend Orchestrator", category: "ai-backend", archetype: "Orquestador IA-Backend" };
  if (hasAI && hasF)
    return { name: "Intelligent Interface Weaver", category: "ai-frontend", archetype: "Tejedor de Interfaces Inteligentes" };
  if (hasD && hasB)
    return { name: "Infrastructure Alchemist", category: "infra", archetype: "Alquimista de Infraestructura" };
  if (hasP && hasF)
    return { name: "Performance-Optimized Frontend", category: "perf-frontend", archetype: "Frontend Optimizado" };
  if (hasAI)
    return { name: "Multi-Agent Arcana Specialist", category: "ai-specialist", archetype: "Especialista en Arcana Multi-Agente" };
  if (hasF)
    return { name: "Visual Stack Enchanter", category: "frontend-specialist", archetype: "Encantador de Stack Visual" };
  if (hasB)
    return { name: "Backend Elixir Master", category: "backend-specialist", archetype: "Maestro de Elixires Backend" };
  if (hasP)
    return { name: "Performance Sorcerer", category: "performance-specialist", archetype: "Hechicero de Rendimiento" };
  if (hasD)
    return { name: "DevOps Rune Keeper", category: "devops-specialist", archetype: "Guardián de Runas DevOps" };

  return { name: "Alchemical Skill Fusion", category: "fusion", archetype: "Fusión Alquímica" };
}

/* ── Generar la descripción combinada ── */
function generateDescription(
  ingredients: AlchemySkill[],
  profile: { name: string; archetype: string }
): string {
  const skillNames = ingredients.map((s) => `**${s.name}**`).join(", ");
  const categorySet = [...new Set(ingredients.map((s) => CATEGORY_LABELS[s.category]))];

  return [
    `**${profile.archetype}** — Una skill alquímica de nivel producción que fusiona ` +
      `${ingredients.length} ingredientes místicos en un único artefacto de poder.`,
    "",
    `Esta transmutación combina las disciplinas de ${categorySet.join(", ")} ` +
      `para crear un agente especializado capaz de operar en múltiples dominios ` +
      `con maestría alquímica.`,
    "",
    `**Ingredientes fusionados:** ${skillNames}.`,
  ].join("\n");
}

/* ── Generar capabilities ── */
function generateCapabilities(ingredients: AlchemySkill[]): string {
  return ingredients
    .map(
      (s) =>
        `- ${s.emoji} **${s.name}** — ${s.subtitle}. ` +
        `Dominio avanzado integrado en el flujo alquímico de trabajo.`
    )
    .join("\n");
}

/* ── Generar best practices ── */
function generateBestPractices(ingredients: AlchemySkill[]): string {
  const categories = [...new Set(ingredients.map((s) => s.category))];
  const practices: string[] = [
    "1. **Principio de Transmutación Gradual**: Activa las capacidades una por una, " +
      "verificando la estabilidad del sistema en cada fase alquímica.",
    '2. **Memoria Compartida**: Utiliza Redis como "cristal de memoria" para compartir ' +
      "estado entre las capacidades activas del agente.",
    "3. **Observabilidad**: Activa OpenTelemetry para rastrear cada transmutación " +
      "y detectar anomalías antes de que se propaguen.",
  ];

  if (categories.includes("frontend"))
    practices.push(
      "4. **Renderizado Incremental**: Aprovecha ISR y streaming de Server Components " +
        "para mantener la interfaz viva y reactiva."
    );
  if (categories.includes("ai"))
    practices.push(
      `${practices.length + 1}. **Círculos de Validación**: Siempre ejecuta un agente Sentinel ` +
        "que valide las respuestas del LLM antes de entregarlas al usuario."
    );
  if (categories.includes("performance"))
    practices.push(
      `${practices.length + 1}. **Profiling Continuo**: Ejecuta benchmarks periódicos para detectar ` +
        "regresiones de rendimiento en cada ciclo de transmutación."
    );
  if (categories.includes("devops"))
    practices.push(
      `${practices.length + 1}. **Inmutabilidad de Artefactos**: Genera imágenes Docker inmutables ` +
        "y versionadas para cada transmutación exitosa."
    );

  return practices.join("\n");
}

/* ── Generar ejemplos de uso ── */
function generateExamples(ingredients: AlchemySkill[]): string {
  const categories = [...new Set(ingredients.map((s) => s.category))];
  const examples: string[] = [];

  examples.push(
    "### Invocación Básica",
    "```python",
    "from alchemical_gateway import invoke_skill",
    "",
    `result = await invoke_skill(`,
    `    skill="${ingredients[0]?.id || "fusion"}",`,
    `    ingredients=${JSON.stringify(ingredients.map((s) => s.id))},`,
    '    phase="rubedo",',
    "    context={",
    '        "workspace": "/workspace/skills/",',
    '        "memory_backend": "redis",',
    '        "vector_store": "chromadb",',
    "    }",
    ")",
    "```",
    ""
  );

  if (categories.includes("ai")) {
    examples.push(
      "### Orquestación Multi-Agente",
      "```python",
      "from alchemical_gateway import AlchemicalCircle",
      "",
      "circle = AlchemicalCircle(",
      '    name="transmutation-circle",',
      "    agents=[",
      '        {"role": "prima-materia", "model": "llama3.2:latest"},',
      '        {"role": "refiner", "model": "mistral:latest"},',
      '        {"role": "sentinel", "model": "phi3:latest"},',
      "    ],",
      `    skill="${ingredients.find((i) => i.category === "ai")?.id || "ai-fusion"}",`,
      ")",
      "output = await circle.transmute(input_data)",
      "```",
      ""
    );
  }

  if (categories.includes("frontend")) {
    examples.push(
      "### Integración Frontend",
      "```tsx",
      "// app/transmutation/page.tsx",
      'import { useAlchemicalSkill } from "@/hooks/use-skill";',
      "",
      "export default function TransmutationPage() {",
      `  const { invoke, result, isTransmuting } = useAlchemicalSkill("${ingredients.find((i) => i.category === "frontend")?.id || "visual-stack"}");`,
      "",
      "  return (",
      '    <motion.div animate={isTransmuting ? { scale: [1, 1.02, 1] } : {}}>',
      "      {result && <SkillPreview data={result} />}",
      "    </motion.div>",
      "  );",
      "}",
      "```",
      ""
    );
  }

  return examples.join("\n");
}

/* ── Generar requirements ── */
function generateRequirements(ingredients: AlchemySkill[]): string {
  const categories = [...new Set(ingredients.map((s) => s.category))];
  const tools: string[] = [
    "- **Alchemical Gateway** >= 1.0.0",
    "- **Python** >= 3.11",
    "- **Ollama** (modelos LLM locales)",
  ];

  if (categories.includes("frontend")) {
    tools.push("- **Node.js** >= 20.x", "- **Next.js** >= 15.x con App Router");
  }
  if (categories.includes("backend")) {
    tools.push("- **FastAPI** >= 0.100.0", "- **PostgreSQL** >= 15 (opcional)");
  }
  if (categories.includes("ai")) {
    tools.push("- **ChromaDB** >= 0.4.x", "- **LangGraph** >= 0.2.x", "- **Redis** >= 7.x");
  }
  if (categories.includes("devops")) {
    tools.push("- **Docker** >= 24.x", "- **Docker Compose** >= 2.x");
  }

  tools.push(
    "",
    "### Permisos requeridos",
    "- `skill:execute` — Ejecutar la skill en el Gateway",
    "- `memory:read` / `memory:write` — Acceso a memoria compartida",
    "- `agent:invoke` — Invocar agentes del ecosistema"
  );

  if (categories.includes("devops"))
    tools.push("- `infra:deploy` — Desplegar artefactos en producción");

  return tools.join("\n");
}

/* ── Generar integración con Gateway ── */
function generateIntegration(ingredients: AlchemySkill[]): string {
  const skillIds = ingredients.map((s) => `"${s.id}"`).join(", ");

  return [
    "Esta skill se registra automáticamente en el **Alchemical Gateway** al ser activada.",
    "",
    "### Registro en Gateway",
    "```yaml",
    "# gateway/skills/config.yml",
    "skills:",
    `  - name: "${ingredients.length > 1 ? "fusion-skill" : ingredients[0]?.id || "skill"}"`,
    `    ingredients: [${skillIds}]`,
    '    phase: "rubedo"',
    "    auto_activate: true",
    "    circle_compatible: true",
    "    memory_backend: redis",
    "    vector_store: chromadb",
    "```",
    "",
    "### Endpoints disponibles",
    "```",
    "POST /gateway/skills/invoke     → Ejecutar transmutación",
    "GET  /gateway/skills/status     → Estado de la skill",
    "PUT  /gateway/skills/config     → Actualizar configuración",
    "GET  /gateway/skills/telemetry  → Métricas y trazas",
    "```",
    "",
    "### Webhook de eventos",
    "```python",
    "# La skill emite eventos en cada fase de transmutación",
    "events = [",
    '    "skill.activated",',
    '    "skill.transmutation.started",',
    '    "skill.transmutation.phase_changed",',
    '    "skill.transmutation.completed",',
    '    "skill.error",',
    "]",
    "```",
  ].join("\n");
}

/* ═══════════════════════════════════════════════════════════════
   FUNCIÓN PRINCIPAL — Genera el SKILL.md completo
═══════════════════════════════════════════════════════════════ */

export function generateSkillMd(ingredients: AlchemySkill[]): string {
  if (ingredients.length === 0) return "";

  const categories = [...new Set(ingredients.map((s) => s.category))];
  const now = new Date().toISOString().split("T")[0];
  const profile = determineSkillProfile(ingredients, categories);

  const tags = [
    ...new Set(categories.flatMap((c) => CATEGORY_TAGS[c] || [])),
  ];

  const frontmatter = [
    "---",
    `name: "${profile.name}"`,
    `version: "1.0.0"`,
    `category: "${profile.category}"`,
    `author: "Alchemical Ecosystem — Skill Alchemist"`,
    `created: "${now}"`,
    `tags: [${tags.join(", ")}]`,
    `ingredients_count: ${ingredients.length}`,
    `compatibility: ">=1.0.0"`,
    `phase: "rubedo"`,
    "---",
  ].join("\n");

  const body = [
    `# ⚗️ ${profile.name}`,
    "",
    `> *Skill alquímica generada por el **Alquimista de Habilidades** del Ecosistema Alquímico.*`,
    `> *Combina ${ingredients.length} ingrediente${ingredients.length > 1 ? "s" : ""} en una transmutación coherente y lista para producción.*`,
    "",
    "---",
    "",
    "## 📖 Description",
    "",
    generateDescription(ingredients, profile),
    "",
    "---",
    "",
    "## ⚡ Capabilities",
    "",
    generateCapabilities(ingredients),
    "",
    "---",
    "",
    "## 🏆 Best Practices",
    "",
    generateBestPractices(ingredients),
    "",
    "---",
    "",
    "## 💡 Examples of Use",
    "",
    generateExamples(ingredients),
    "",
    "---",
    "",
    "## 🔧 Required Tools & Permissions",
    "",
    generateRequirements(ingredients),
    "",
    "---",
    "",
    "## 🌐 Integration with Alchemical Gateway",
    "",
    generateIntegration(ingredients),
    "",
    "---",
    "",
    `*Generado el ${now} por el Alquimista de Habilidades — "Where Intelligence is Forged, Not Fetched."*`,
  ].join("\n");

  return `${frontmatter}\n\n${body}\n`;
}
