#!/usr/bin/env node
/**
 * Screenshot Generator - Playwright Version
 * Captura screenshots del dashboard para README y documentación
 *
 * Usage:
 *   node scripts/screenshot-playwright.mjs
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCREENSHOTS_DIR = join(__dirname, '..', '..', '..', 'assets', 'screenshots');
const BASE_URL = 'http://localhost:3000';

// Ensure screenshots directory exists
if (!existsSync(SCREENSHOTS_DIR)) {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: 'dashboard-chat', width: 1440, height: 900, clickSelector: '[data-testid="nav-chat"], nav button:nth-child(1)' },
  { name: 'dashboard-nodes', width: 1440, height: 900, clickSelector: '[data-testid="nav-nodes"], nav button:nth-child(2)' },
  { name: 'dashboard-agents', width: 1440, height: 900, clickSelector: '[data-testid="nav-agents"], nav button:nth-child(3)' },
  { name: 'dashboard-logs', width: 1440, height: 900, clickSelector: '[data-testid="nav-logs"], nav button:nth-child(4)' },
  { name: 'dashboard-admin', width: 1440, height: 900, clickSelector: '[data-testid="nav-admin"], nav button:nth-child(5)' },
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureScreenshot(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 2, // Retina quality
  });

  const page = await context.newPage();

  try {
    console.log(`📸 Capturing: ${viewport.name} (${viewport.width}x${viewport.height})`);

    // Navigate to the page
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for initial render
    await delay(3000);

    // Click on navigation if selector provided
    if (viewport.clickSelector) {
      try {
        // Try multiple selectors
        const selectors = viewport.clickSelector.split(',').map(s => s.trim());
        for (const selector of selectors) {
          try {
            const button = page.locator(selector).first();
            if (await button.isVisible({ timeout: 2000 })) {
              await button.click();
              await delay(1500);
              break;
            }
          } catch (e) {
            // Try next selector
          }
        }
      } catch (e) {
        console.log(`   ⚠️ Could not click navigation for ${viewport.name}`);
      }
    }

    // Additional wait for animations
    await delay(2000);

    // Take screenshot
    const screenshotPath = join(SCREENSHOTS_DIR, `${viewport.name}.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: false,
      type: 'png',
    });

    console.log(`   ✅ Saved: ${screenshotPath}`);

  } catch (error) {
    console.error(`   ❌ Error capturing ${viewport.name}:`, error.message);
  } finally {
    await context.close();
  }
}

async function main() {
  console.log('🚀 Starting screenshot capture with Playwright...');
  console.log(`   Screenshots will be saved to: ${SCREENSHOTS_DIR}`);
  console.log(`   Base URL: ${BASE_URL}`);
  console.log('');

  // Check if server is running
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    console.log('✅ Server is running');
  } catch (error) {
    console.error('❌ Server is not running at', BASE_URL);
    console.error('   Please start the dev server first:');
    console.error('   cd apps/alchemical-dashboard && npm run dev');
    process.exit(1);
  }

  // Launch browser - use installed chromium
  const browser = await chromium.launch({
    headless: true,
  });

  console.log('🌐 Browser launched');
  console.log('');

  // Capture all screenshots
  for (const viewport of VIEWPORTS) {
    await captureScreenshot(browser, viewport);
  }

  await browser.close();

  console.log('');
  console.log('✨ All screenshots captured successfully!');
  console.log(`📁 Saved to: ${SCREENSHOTS_DIR}`);
  console.log('');
  console.log('Files:');
  VIEWPORTS.forEach(v => {
    console.log(`   - ${v.name}.png`);
  });
}

main().catch(console.error);
