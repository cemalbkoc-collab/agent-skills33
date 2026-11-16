const { chromium } = require('playwright');
const sharp = (() => { try { return require('sharp'); } catch { return null; } })();
(async () => {
  const out = require('path').join(__dirname, 'preview/shots');
  require('fs').mkdirSync(out, { recursive: true });
  const want = process.argv.slice(2);
  const b = await chromium.launch();
  const jobs = [
    ['index', 'index.html', 1440], ['index-m', 'index.html', 390],
    ['urun', 'urun-ilmek-kazak.html', 1440], ['urun-m', 'urun-kalip-ceket.html', 390],
    ['koleksiyon', 'koleksiyon.html', 1440], ['koleksiyon-m', 'koleksiyon.html', 390],
    ['drop', 'drop.html', 1440], ['sss', 'sss.html', 1440], ['hakkimizda', 'hakkimizda.html', 1440], ['iletisim', 'iletisim.html', 1440], ['kvkk-m', 'kvkk.html', 390], ['sepet', 'sepet.html', 1440], ['giris', 'giris.html', 1440], ['404', '404.html', 1440], ['lookbook', 'lookbook.html', 1440], ['urun-yuzuk', 'urun-muhur-yuzuk.html', 1440],
  ].filter((j) => !want.length || want.includes(j[0]));
  for (const [name, file, w] of jobs) {
    const ctx = await b.newContext({ viewport: { width: w, height: w < 500 ? 844 : 900 }, reducedMotion: 'reduce', deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)); });
    await p.addInitScript(() => { try { localStorage.setItem('teyel:cookie', 'true'); localStorage.setItem('teyel:popup', String(Date.now() + 1e9)); } catch {} });
    await p.goto((process.env.PREVIEW_URL || 'http://127.0.0.1:8765') + '/' + file);
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
    await p.waitForTimeout(700);
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    await p.screenshot({ path: `${out}/${name}.jpg`, fullPage: true, type: 'jpeg', quality: 55 });
    console.log(name, 'overflow', ov, 'errors', errs.length, errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
  await b.close();
})();
