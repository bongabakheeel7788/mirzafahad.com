const { chromium } = require('playwright-core');
const fs = require('fs'), path = require('path');
const ROOT = '/home/claude/mf';
const COV = path.join(ROOT,'src/assets/img/covers');
const OG = path.join(ROOT,'src/assets/img/og');
(async () => {
  fs.mkdirSync(OG, {recursive:true});
  const svgs = fs.readdirSync(COV).filter(f=>f.endsWith('.svg'));
  const todo = svgs.filter(f=>!fs.existsSync(path.join(OG, f.replace('.svg','.png'))));
  console.log('to render:', todo.length);
  if (!todo.length) return;
  const browser = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const page = await browser.newPage({viewport:{width:1200,height:630}});
  for (const f of todo) {
    const svg = fs.readFileSync(path.join(COV,f),'utf8');
    await page.setContent(`<style>*{margin:0}</style>${svg.replace('<svg ','<svg width="1200" height="630" ')}`,{waitUntil:'load'});
    await page.screenshot({path:path.join(OG,f.replace('.svg','.png'))});
    process.stdout.write('.');
  }
  await browser.close();
  console.log('\ndone');
})();
