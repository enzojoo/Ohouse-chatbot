// Playwright capture script
// Captures all .cw, .cw-mini, and .screen widgets from the chatbot mockup
// Outputs PNG images + manifest.json with metadata for Figma upload

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const HTML_FILE = path.resolve(__dirname, '..', 'chatbot-mockups.html');
const OUT_DIR = path.resolve(__dirname, 'captures');
const MANIFEST = path.resolve(__dirname, 'manifest.json');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ deviceScaleFactor: 2 });
  const page = await context.newPage();

  await page.goto('file://' + HTML_FILE, { waitUntil: 'networkidle' });

  const manifest = [];
  let idx = 0;

  // ──────────────────────────────────────────────────────────
  // 1. M-mockup gallery — each <div class="mockup"> contains
  //    a .mockup-label and a .cw widget. Capture the .cw.
  // ──────────────────────────────────────────────────────────
  const mockups = await page.$$('div.mockup');
  console.log(`Found ${mockups.length} M-mockups`);
  for (const mockup of mockups) {
    const label = await mockup.$eval('.mockup-label', el => el.textContent.trim()).catch(() => null);
    const cw = await mockup.$('.cw');
    if (!cw || !label) continue;
    const id = String(idx++).padStart(3, '0');
    const safeName = label.replace(/[^\w\-가-힣]/g, '_').slice(0, 80);
    const filename = `${id}_mockup_${safeName}.png`;
    await cw.screenshot({ path: path.join(OUT_DIR, filename), omitBackground: false });
    manifest.push({ id, type: 'mockup', label, filename, section: 'M-mockup 갤러리' });
  }

  // ──────────────────────────────────────────────────────────
  // 2. M00 interactive demo — each .screen inside #liveCw
  //    Need to activate each by setting .active class.
  // ──────────────────────────────────────────────────────────
  const liveCw = await page.$('#liveCw');
  if (liveCw) {
    // Make sure liveCw is visible
    await page.evaluate(() => {
      const cw = document.getElementById('liveCw');
      const launcher = document.getElementById('liveLauncher');
      if (cw) cw.hidden = false;
      if (launcher) launcher.hidden = true;
    });
    const screens = await page.$$('#liveCw .screen');
    console.log(`Found ${screens.length} interactive demo screens`);
    for (const screen of screens) {
      const dataScreen = await screen.getAttribute('data-screen');
      // Activate this screen
      await page.evaluate((target) => {
        document.querySelectorAll('#liveCw .screen').forEach(s => s.classList.remove('active'));
        const t = document.querySelector(`#liveCw [data-screen="${target}"]`);
        if (t) t.classList.add('active');
      }, dataScreen);
      // Brief wait for any rendering
      await page.waitForTimeout(150);
      const id = String(idx++).padStart(3, '0');
      const filename = `${id}_demo_${dataScreen}.png`;
      // Screenshot the whole liveCw container so we see header + screen
      await liveCw.screenshot({ path: path.join(OUT_DIR, filename), omitBackground: false });
      manifest.push({ id, type: 'demo', label: `S — ${dataScreen}`, filename, section: '인터랙티브 데모 (M00)' });
    }
  }

  // ──────────────────────────────────────────────────────────
  // 3. Full scenarios — each scenario section has many .cw-mini
  //    inside .scenario-step. Capture each .cw-mini + step label.
  // ──────────────────────────────────────────────────────────
  // Find all scenario-stage sections
  const scenarioStages = await page.$$('.scenario-stage');
  console.log(`Found ${scenarioStages.length} scenario stages`);
  for (const stage of scenarioStages) {
    const title = await stage.$eval('.scenario-title', el => el.textContent.trim().split('\n')[0].trim()).catch(() => 'Scenario');
    const steps = await stage.$$('.scenario-step');
    for (const step of steps) {
      const stepHead = await step.$eval('.scenario-step-head', el => el.textContent.trim()).catch(() => null);
      const mini = await step.$('.cw-mini');
      if (!mini || !stepHead) continue;
      const id = String(idx++).padStart(3, '0');
      const safeStep = stepHead.replace(/[^\w\-가-힣]/g, '_').slice(0, 60);
      const safeTitle = title.replace(/[^\w\-가-힣]/g, '_').slice(0, 50);
      const filename = `${id}_scenario_${safeTitle}_${safeStep}.png`;
      await mini.screenshot({ path: path.join(OUT_DIR, filename), omitBackground: false });
      manifest.push({ id, type: 'scenario-step', label: stepHead, scenario: title, filename, section: title });
    }
  }

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
  console.log(`\n✅ Captured ${manifest.length} images`);
  console.log(`Manifest: ${MANIFEST}`);

  await browser.close();
})();
