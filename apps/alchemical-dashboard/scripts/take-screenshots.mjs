import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'http://localhost:3001';
const OUTPUT_DIR = join(__dirname, '../../assets/screenshots');

const views = [
  { name: 'dashboard-chat', path: '/', title: 'Chat del Caldero' },
  { name: 'dashboard-nodes', path: '/?view=nodes', title: 'Agent Node Studio' },
  { name: 'dashboard-agents', path: '/?view=agents', title: 'Runtime de Agentes' },
  { name: 'dashboard-logs', path: '/?view=logs', title: 'Logs & Telemetría' },
  { name: 'dashboard-admin', path: '/?view=admin', title: 'Administración' },
];

async function takeScreenshots() {
  console.log('🚀 Iniciando navegador...');
  
  const browser = await chromium.launch({
    headless: true,
  });
  
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  
  const page = await context.newPage();
  
  for (const view of views) {
    console.log(`📸 Tomando screenshot: ${view.title}`);
    
    try {
      await page.goto(`${BASE_URL}${view.path}`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Esperar a que cargue el contenido
      await page.waitForTimeout(3000);
      
      const outputPath = join(OUTPUT_DIR, `${view.name}.png`);
      await page.screenshot({ 
        path: outputPath,
        fullPage: false 
      });
      
      console.log(`✅ Screenshot guardado: ${outputPath}`);
    } catch (error) {
      console.error(`❌ Error en ${view.name}:`, error.message);
    }
  }
  
  await browser.close();
  console.log('🏁 Screenshots completados');
}

takeScreenshots().catch(console.error);
