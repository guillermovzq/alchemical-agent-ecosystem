#!/usr/bin/env node
/**
 * Generate Dashboard Screenshots using Sharp
 * Creates professional placeholder images with Alchemical 2026 styling
 */

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCREENSHOTS_DIR = join(__dirname, '..', '..', '..', 'assets', 'screenshots');

// Ensure screenshots directory exists
if (!existsSync(SCREENSHOTS_DIR)) {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Alchemical 2026 Color Palette
const COLORS = {
  void: '#050505',
  voidLight: '#0a0a0f',
  voidLighter: '#12121a',
  gold: '#d4af37',
  goldLight: '#f0d070',
  goldDark: '#a08028',
  copper: '#b87333',
  bronze: '#cd7f32',
  text: '#e8e6e3',
  textMuted: '#8a8a8a',
  accent: '#ff6b35',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
};

const WIDTH = 1440;
const HEIGHT = 900;

/**
 * Generate SVG for dashboard background
 */
function generateBackground() {
  return `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg-grad" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stop-color="${COLORS.voidLight}"/>
          <stop offset="50%" stop-color="${COLORS.void}"/>
          <stop offset="100%" stop-color="#020202"/>
        </radialGradient>
        <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${COLORS.goldDark}"/>
          <stop offset="50%" stop-color="${COLORS.gold}"/>
          <stop offset="100%" stop-color="${COLORS.goldDark}"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg-grad)"/>
    </svg>
  `;
}

/**
 * Generate SVG for sidebar
 */
function generateSidebar(activeItem = 'chat') {
  const items = [
    { id: 'chat', icon: '◆', label: 'Chat del Caldero', y: 80 },
    { id: 'nodes', icon: '◇', label: 'Node Studio', y: 140 },
    { id: 'agents', icon: '○', label: 'Agentes', y: 200 },
    { id: 'logs', icon: '▸', label: 'Logs', y: 260 },
    { id: 'admin', icon: '⚙', label: 'Admin', y: 320 },
  ];

  let itemsSvg = items.map(item => {
    const isActive = item.id === activeItem;
    const bgColor = isActive ? COLORS.gold : 'transparent';
    const textColor = isActive ? COLORS.void : COLORS.text;
    const opacity = isActive ? '0.15' : '0';

    return `
      <g transform="translate(0, ${item.y})">
        <rect x="12" y="0" width="236" height="44" rx="8" fill="${COLORS.gold}" opacity="${opacity}"/>
        <text x="24" y="28" fill="${isActive ? COLORS.gold : COLORS.textMuted}" font-family="system-ui" font-size="14" font-weight="${isActive ? '600' : '400'}">${item.icon}</text>
        <text x="48" y="28" fill="${isActive ? COLORS.gold : COLORS.text}" font-family="system-ui" font-size="13" font-weight="${isActive ? '600' : '400'}">${item.label}</text>
        ${isActive ? `<rect x="0" y="8" width="3" height="28" rx="1.5" fill="${COLORS.gold}"/>` : ''}
      </g>
    `;
  }).join('');

  return `
    <svg x="0" y="0" width="260" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sidebar-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${COLORS.voidLight}"/>
          <stop offset="100%" stop-color="${COLORS.void}"/>
        </linearGradient>
      </defs>
      <rect width="260" height="${HEIGHT}" fill="url(#sidebar-grad)" opacity="0.95"/>
      <rect x="259" y="0" width="1" height="${HEIGHT}" fill="${COLORS.gold}" opacity="0.1"/>

      <!-- Logo -->
      <text x="24" y="40" fill="${COLORS.gold}" font-family="serif" font-size="18" font-weight="700" filter="url(#glow)">◈ ALCHEMICAL</text>

      <!-- Nav Items -->
      ${itemsSvg}

      <!-- Bottom Stats -->
      <g transform="translate(24, ${HEIGHT - 120})">
        <text x="0" y="0" fill="${COLORS.textMuted}" font-family="system-ui" font-size="10">CPU</text>
        <text x="0" y="16" fill="${COLORS.gold}" font-family="system-ui" font-size="14" font-weight="600">42%</text>
        <rect x="0" y="24" width="212" height="4" rx="2" fill="${COLORS.voidLighter}"/>
        <rect x="0" y="24" width="89" height="4" rx="2" fill="${COLORS.gold}"/>

        <text x="0" y="48" fill="${COLORS.textMuted}" font-family="system-ui" font-size="10">MEM</text>
        <text x="0" y="64" fill="${COLORS.gold}" font-family="system-ui" font-size="14" font-weight="600">3.2 GB</text>
        <rect x="0" y="72" width="212" height="4" rx="2" fill="${COLORS.voidLighter}"/>
        <rect x="0" y="72" width="140" height="4" rx="2" fill="${COLORS.copper}"/>
      </g>
    </svg>
  `;
}

/**
 * Generate SVG for header
 */
function generateHeader() {
  return `
    <svg x="260" y="0" width="${WIDTH - 260}" height="64" xmlns="http://www.w3.org/2000/svg">
      <rect width="${WIDTH - 260}" height="64" fill="${COLORS.void}" opacity="0.8"/>
      <rect y="63" width="${WIDTH - 260}" height="1" fill="${COLORS.gold}" opacity="0.1"/>

      <!-- Search -->
      <rect x="24" y="16" width="280" height="32" rx="8" fill="${COLORS.voidLighter}" stroke="${COLORS.gold}" stroke-opacity="0.2" stroke-width="1"/>
      <text x="40" y="36" fill="${COLORS.textMuted}" font-family="system-ui" font-size="13">Buscar agentes, skills...</text>

      <!-- Status Indicators -->
      <g transform="translate(${WIDTH - 260 - 300}, 20)">
        <circle cx="0" cy="8" r="6" fill="${COLORS.success}" opacity="0.8"/>
        <text x="14" y="12" fill="${COLORS.textMuted}" font-family="system-ui" font-size="12">7/7 Agentes</text>

        <circle cx="120" cy="8" r="6" fill="${COLORS.gold}" opacity="0.8"/>
        <text x="134" y="12" fill="${COLORS.textMuted}" font-family="system-ui" font-size="12">23 Skills</text>

        <circle cx="220" cy="8" r="6" fill="${COLORS.accent}" opacity="0.6"/>
        <text x="234" y="12" fill="${COLORS.textMuted}" font-family="system-ui" font-size="12">3 Tareas</text>
      </g>
    </svg>
  `;
}

/**
 * Generate dashboard-specific content
 */
function generateChatContent() {
  const messages = [
    { role: 'user', text: 'Analiza los logs del sistema y detecta anomalías', y: 40 },
    { role: 'agent', text: 'He analizado 1,247 líneas de logs. Detecté 3 patrones...', y: 100, highlight: true },
    { role: 'agent', text: 'Recomiendo activar el modo supervisión para...', y: 180 },
  ];

  let messagesSvg = messages.map(msg => {
    const isUser = msg.role === 'user';
    const x = isUser ? 400 : 24;
    const width = 320;
    const bgColor = isUser ? COLORS.copper : COLORS.voidLighter;
    const opacity = isUser ? '0.2' : '0.9';
    const textColor = isUser ? COLORS.text : COLORS.goldLight;

    return `
      <g transform="translate(${x}, ${msg.y})">
        <rect width="${width}" height="${msg.highlight ? 60 : 50}" rx="12" fill="${bgColor}" opacity="${opacity}"
          stroke="${msg.highlight ? COLORS.gold : 'none'}" stroke-width="${msg.highlight ? '1' : '0'}"/>
        <text x="16" y="28" fill="${textColor}" font-family="system-ui" font-size="13" font-weight="${isUser ? '500' : '400'}">
          ${msg.text}
        </text>
        ${msg.highlight ? `<rect x="0" y="0" width="3" height="60" rx="1.5" fill="${COLORS.gold}"/>` : ''}
      </g>
    `;
  }).join('');

  return `
    <svg x="284" y="88" width="${WIDTH - 284 - 24}" height="${HEIGHT - 88 - 24}" xmlns="http://www.w3.org/2000/svg">
      <!-- Chat Area -->
      <rect width="100%" height="100%" rx="12" fill="${COLORS.voidLight}" opacity="0.5" stroke="${COLORS.gold}" stroke-opacity="0.1" stroke-width="1"/>

      <!-- Messages -->
      ${messagesSvg}

      <!-- Input Area -->
      <g transform="translate(24, ${HEIGHT - 88 - 100})">
        <rect width="${WIDTH - 284 - 72}" height="56" rx="12" fill="${COLORS.voidLighter}" stroke="${COLORS.gold}" stroke-opacity="0.3" stroke-width="1"/>
        <text x="20" y="34" fill="${COLORS.textMuted}" font-family="system-ui" font-size="14">Escribe tu mensaje...</text>
        <rect x="${WIDTH - 284 - 120}" y="12" width="80" height="32" rx="8" fill="${COLORS.gold}" opacity="0.9"/>
        <text x="${WIDTH - 284 - 100}" y="32" fill="${COLORS.void}" font-family="system-ui" font-size="12" font-weight="600">ENVIAR</text>
      </g>
    </svg>
  `;
}

function generateNodesContent() {
  const nodes = [
    { x: 100, y: 100, type: 'input', label: 'Trigger', color: COLORS.gold },
    { x: 300, y: 150, type: 'process', label: 'Velktharion', color: COLORS.copper },
    { x: 500, y: 100, type: 'process', label: 'Synapsara', color: COLORS.bronze },
    { x: 300, y: 300, type: 'output', label: 'Result', color: COLORS.success },
  ];

  let nodesSvg = nodes.map(node => `
    <g transform="translate(${node.x}, ${node.y})">
      <rect width="140" height="60" rx="12" fill="${COLORS.voidLighter}" stroke="${node.color}" stroke-width="2" opacity="0.95"/>
      <circle cx="20" cy="30" r="8" fill="${node.color}" opacity="0.8"/>
      <text x="40" y="26" fill="${COLORS.text}" font-family="system-ui" font-size="12" font-weight="600">${node.label}</text>
      <text x="40" y="42" fill="${COLORS.textMuted}" font-family="system-ui" font-size="10">${node.type}</text>
    </g>
  `).join('');

  const connections = [
    { x1: 170, y1: 130, x2: 300, y2: 180 },
    { x1: 440, y1: 180, x2: 500, y2: 130 },
    { x1: 370, y1: 210, x2: 370, y2: 300 },
  ];

  let connectionsSvg = connections.map(conn => `
    <line x1="${conn.x1}" y1="${conn.y1}" x2="${conn.x2}" y2="${conn.y2}"
      stroke="${COLORS.gold}" stroke-width="2" stroke-dasharray="5,3" opacity="0.6">
      <animate attributeName="stroke-dashoffset" from="0" to="16" dur="1s" repeatCount="indefinite"/>
    </line>
  `).join('');

  return `
    <svg x="284" y="88" width="${WIDTH - 284 - 24}" height="${HEIGHT - 88 - 24}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" rx="12" fill="${COLORS.voidLight}" opacity="0.3" stroke="${COLORS.gold}" stroke-opacity="0.1"/>

      <!-- Grid Pattern -->
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="1" fill="${COLORS.gold}" opacity="0.2"/>
      </pattern>
      <rect width="100%" height="100%" fill="url(#grid)"/>

      <!-- Connections -->
      ${connectionsSvg}

      <!-- Nodes -->
      ${nodesSvg}

      <!-- Toolbar -->
      <g transform="translate(24, 24)">
        <rect width="200" height="40" rx="8" fill="${COLORS.voidLighter}" stroke="${COLORS.gold}" stroke-opacity="0.2"/>
        <text x="20" y="25" fill="${COLORS.text}" font-family="system-ui" font-size="12">+ Agregar Nodo</text>
        <text x="120" y="25" fill="${COLORS.text}" font-family="system-ui" font-size="12">▶ Ejecutar</text>
      </g>
    </svg>
  `;
}

function generateAgentsContent() {
  const agents = [
    { name: 'Velktharion', role: 'Prima Materia', status: 'active', latency: '45ms' },
    { name: 'Synapsara', role: 'Tejedor', status: 'active', latency: '38ms' },
    { name: 'Kryonexus', role: 'Centinela', status: 'idle', latency: '12ms' },
    { name: 'Pyraxis', role: 'Catalizador', status: 'active', latency: '52ms' },
  ];

  let agentsSvg = agents.map((agent, i) => {
    const y = 20 + i * 70;
    const statusColor = agent.status === 'active' ? COLORS.success : COLORS.textMuted;

    return `
      <g transform="translate(0, ${y})">
        <rect width="${WIDTH - 308}" height="60" rx="8" fill="${COLORS.voidLighter}" opacity="0.5"
          stroke="${i === 0 ? COLORS.gold : 'none'}" stroke-width="${i === 0 ? '1' : '0'}" stroke-opacity="0.3"/>
        <circle cx="24" cy="30" r="10" fill="${statusColor}" opacity="0.3"/>
        <circle cx="24" cy="30" r="6" fill="${statusColor}"/>
        <text x="50" y="22" fill="${COLORS.text}" font-family="system-ui" font-size="14" font-weight="600">${agent.name}</text>
        <text x="50" y="40" fill="${COLORS.textMuted}" font-family="system-ui" font-size="11">${agent.role}</text>
        <text x="${WIDTH - 400}" y="30" fill="${COLORS.gold}" font-family="system-ui" font-size="12">${agent.latency}</text>
        <text x="${WIDTH - 350}" y="30" fill="${statusColor}" font-family="system-ui" font-size="11" font-weight="500">${agent.status.toUpperCase()}</text>
      </g>
    `;
  }).join('');

  return `
    <svg x="284" y="88" width="${WIDTH - 284 - 24}" height="${HEIGHT - 88 - 24}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" rx="12" fill="${COLORS.voidLight}" opacity="0.5" stroke="${COLORS.gold}" stroke-opacity="0.1"/>

      <!-- Header -->
      <text x="24" y="30" fill="${COLORS.gold}" font-family="system-ui" font-size="16" font-weight="600">Runtime de Agentes</text>

      <!-- Agent List -->
      <g transform="translate(24, 60)">
        ${agentsSvg}
      </g>
    </svg>
  `;
}

function generateLogsContent() {
  const logs = [
    { time: '10:42:15', level: 'info', message: 'Agent Velktharion initialized' },
    { time: '10:42:18', level: 'success', message: 'Workflow execution completed: 245ms' },
    { time: '10:42:22', level: 'warning', message: 'High memory usage detected: 78%' },
    { time: '10:42:25', level: 'info', message: 'SSE connection established: /api/logs/stream' },
    { time: '10:42:30', level: 'error', message: 'Agent timeout: Synapsara response > 30s' },
  ];

  const levelColors = {
    info: COLORS.textMuted,
    success: COLORS.success,
    warning: COLORS.warning,
    error: COLORS.error,
  };

  let logsSvg = logs.map((log, i) => {
    const y = 20 + i * 40;

    return `
      <g transform="translate(0, ${y})">
        <rect width="${WIDTH - 308}" height="36" rx="4" fill="${COLORS.voidLighter}" opacity="${i % 2 === 0 ? '0.3' : '0.1'}"/>
        <text x="16" y="22" fill="${COLORS.textMuted}" font-family="monospace" font-size="11">${log.time}</text>
        <rect x="90" y="10" width="12" height="12" rx="2" fill="${levelColors[log.level]}" opacity="0.3"/>
        <text x="92" y="20" fill="${levelColors[log.level]}" font-family="system-ui" font-size="9" font-weight="700">${log.level[0].toUpperCase()}</text>
        <text x="120" y="22" fill="${COLORS.text}" font-family="monospace" font-size="12">${log.message}</text>
      </g>
    `;
  }).join('');

  return `
    <svg x="284" y="88" width="${WIDTH - 284 - 24}" height="${HEIGHT - 88 - 24}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" rx="12" fill="${COLORS.voidLight}" opacity="0.5" stroke="${COLORS.gold}" stroke-opacity="0.1"/>

      <!-- Header -->
      <text x="24" y="30" fill="${COLORS.gold}" font-family="system-ui" font-size="16" font-weight="600">Logs & Telemetría</text>
      <text x="${WIDTH - 400}" y="30" fill="${COLORS.success}" font-family="system-ui" font-size="12">● STREAMING</text>

      <!-- Log List -->
      <g transform="translate(24, 60)">
        ${logsSvg}
      </g>
    </svg>
  `;
}

function generateAdminContent() {
  return `
    <svg x="284" y="88" width="${WIDTH - 284 - 24}" height="${HEIGHT - 88 - 24}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" rx="12" fill="${COLORS.voidLight}" opacity="0.5" stroke="${COLORS.gold}" stroke-opacity="0.1"/>

      <!-- Header -->
      <text x="24" y="30" fill="${COLORS.gold}" font-family="system-ui" font-size="16" font-weight="600">Administración</text>

      <!-- Cards -->
      <g transform="translate(24, 60)">
        <!-- System Card -->
        <rect width="280" height="120" rx="12" fill="${COLORS.voidLighter}" stroke="${COLORS.gold}" stroke-opacity="0.2"/>
        <text x="20" y="30" fill="${COLORS.text}" font-family="system-ui" font-size="14" font-weight="600">Sistema</text>
        <text x="20" y="55" fill="${COLORS.textMuted}" font-family="system-ui" font-size="12">Gateway: v2.1.0</text>
        <text x="20" y="75" fill="${COLORS.textMuted}" font-family="system-ui" font-size="12">Dashboard: v2026.2.0</text>
        <text x="20" y="95" fill="${COLORS.success}" font-family="system-ui" font-size="12">● Todos los servicios OK</text>

        <!-- Security Card -->
        <g transform="translate(300, 0)">
          <rect width="280" height="120" rx="12" fill="${COLORS.voidLighter}" stroke="${COLORS.copper}" stroke-opacity="0.2"/>
          <text x="20" y="30" fill="${COLORS.text}" font-family="system-ui" font-size="14" font-weight="600">Seguridad</text>
          <text x="20" y="55" fill="${COLORS.textMuted}" font-family="system-ui" font-size="12">API Keys: 5 activas</text>
          <text x="20" y="75" fill="${COLORS.textMuted}" font-family="system-ui" font-size="12">Rate Limit: 1000 req/min</text>
          <text x="20" y="95" fill="${COLORS.gold}" font-family="system-ui" font-size="12">SSL: Habilitado</text>
        </g>

        <!-- Operations -->
        <g transform="translate(0, 140)">
          <rect width="580" height="160" rx="12" fill="${COLORS.voidLighter}" stroke="${COLORS.bronze}" stroke-opacity="0.2"/>
          <text x="20" y="30" fill="${COLORS.text}" font-family="system-ui" font-size="14" font-weight="600">Operaciones</text>

          <rect x="20" y="50" width="100" height="36" rx="8" fill="${COLORS.gold}" opacity="0.9"/>
          <text x="45" y="72" fill="${COLORS.void}" font-family="system-ui" font-size="12" font-weight="600">Reiniciar</text>

          <rect x="130" y="50" width="120" height="36" rx="8" fill="${COLORS.copper}" opacity="0.3" stroke="${COLORS.copper}" stroke-width="1"/>
          <text x="150" y="72" fill="${COLORS.text}" font-family="system-ui" font-size="12">Limpiar Caché</text>

          <rect x="260" y="50" width="140" height="36" rx="8" fill="${COLORS.error}" opacity="0.2" stroke="${COLORS.error}" stroke-width="1"/>
          <text x="285" y="72" fill="${COLORS.error}" font-family="system-ui" font-size="12">Modo Mantenimiento</text>
        </g>
      </g>
    </svg>
  `;
}

/**
 * Generate full dashboard screenshot
 */
async function generateScreenshot(name, contentGenerator) {
  console.log(`📸 Generating: ${name}.png`);

  const svg = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${COLORS.goldDark}"/>
          <stop offset="50%" stop-color="${COLORS.gold}"/>
          <stop offset="100%" stop-color="${COLORS.goldDark}"/>
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>

      <!-- Background -->
      ${generateBackground()}

      <!-- Sidebar -->
      ${generateSidebar(name.replace('dashboard-', ''))}

      <!-- Header -->
      ${generateHeader()}

      <!-- Content -->
      ${contentGenerator()}
    </svg>
  `;

  const outputPath = join(SCREENSHOTS_DIR, `${name}.png`);

  await sharp(Buffer.from(svg))
    .resize(WIDTH, HEIGHT)
    .png({ quality: 95, compressionLevel: 3 })
    .toFile(outputPath);

  console.log(`   ✅ Saved: ${outputPath}`);
}

/**
 * Main function
 */
async function main() {
  console.log('🎨 Generating Alchemical Dashboard Screenshots...');
  console.log(`   Output: ${SCREENSHOTS_DIR}`);
  console.log(`   Size: ${WIDTH}x${HEIGHT}`);
  console.log('');

  // Generate all screenshots
  await generateScreenshot('dashboard-chat', generateChatContent);
  await generateScreenshot('dashboard-nodes', generateNodesContent);
  await generateScreenshot('dashboard-agents', generateAgentsContent);
  await generateScreenshot('dashboard-logs', generateLogsContent);
  await generateScreenshot('dashboard-admin', generateAdminContent);

  console.log('');
  console.log('✨ All screenshots generated successfully!');
  console.log('');
  console.log('Generated files:');
  console.log('   - dashboard-chat.png');
  console.log('   - dashboard-nodes.png');
  console.log('   - dashboard-agents.png');
  console.log('   - dashboard-logs.png');
  console.log('   - dashboard-admin.png');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
