const fs = require('fs');
const path = require('path');
const PptxGenJS = require('pptxgenjs');
const { chromium } = require('playwright');

const WORK_DIR = __dirname;
const OUTPUT_FILE = path.join(WORK_DIR, "The Illusion of Productivity.pptx");
const TEMP_DIR = path.join(WORK_DIR, '.pptx-temp');

// main.css sets slide container to 1472x828 (16:9)
const WIDTH_PX = 1472;
const HEIGHT_PX = 828;

function ensureTempDir() {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
}

function cleanTempDir() {
  if (!fs.existsSync(TEMP_DIR)) {
    return;
  }

  for (const name of fs.readdirSync(TEMP_DIR)) {
    const filePath = path.join(TEMP_DIR, name);
    if (fs.statSync(filePath).isFile()) {
      fs.unlinkSync(filePath);
    }
  }
}

function slideHtmlFiles() {
  const files = [];
  for (let i = 1; i <= 7; i += 1) {
    files.push(path.join(WORK_DIR, `slide_${i}.html`));
  }
  return files;
}

async function renderSlidesToPng() {
  ensureTempDir();
  cleanTempDir();

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: WIDTH_PX, height: HEIGHT_PX } });

  const pngPaths = [];
  for (let i = 1; i <= 7; i += 1) {
    const htmlPath = path.join(WORK_DIR, `slide_${i}.html`);
    if (!fs.existsSync(htmlPath)) {
      throw new Error(`Missing slide file: ${htmlPath}`);
    }

    const fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;
    await page.goto(fileUrl, { waitUntil: 'networkidle' });

    // Give web fonts and layout a moment to settle.
    await page.waitForTimeout(250);

    const container = await page.$('.slide-container');
    if (!container) {
      throw new Error(`No .slide-container found in ${htmlPath}`);
    }

    const outputPng = path.join(TEMP_DIR, `slide_${i}.png`);
    await container.screenshot({ path: outputPng });
    pngPaths.push(outputPng);
  }

  await browser.close();
  return pngPaths;
}

async function buildPptxFromPngs(pngPaths) {
  const pptx = new PptxGenJS();

  // 16:9 custom layout to match slide assets.
  pptx.defineLayout({ name: 'CUSTOM', width: 13.333, height: 7.5 });
  pptx.layout = 'CUSTOM';
  pptx.author = "The Illusion of Productivity";
  pptx.subject = 'Presentation export from HTML slides';
  pptx.title = "The Illusion of Productivity";

  for (const pngPath of pngPaths) {
    const slide = pptx.addSlide();
    slide.addImage({ path: pngPath, x: 0, y: 0, w: 13.333, h: 7.5 });
  }

  await pptx.writeFile({ fileName: OUTPUT_FILE });
}

(async () => {
  try {
    console.log('Rendering HTML slides to images...');
    const pngPaths = await renderSlidesToPng();

    console.log('Building PowerPoint...');
    await buildPptxFromPngs(pngPaths);

    console.log(`Done: ${OUTPUT_FILE}`);
  } catch (err) {
    console.error('Failed to generate PPTX.');
    console.error(err && err.message ? err.message : err);

    if (String(err && err.message).toLowerCase().includes('executable')) {
      console.error('Tip: run "npx playwright install chromium" and try again.');
    }

    process.exitCode = 1;
  }
})();
