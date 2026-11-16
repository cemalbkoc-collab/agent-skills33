// Sahne doğrulaması: her sahneyi kendi ilerlemesinin belirli noktalarında çeker, iplik ve kaymayı ölçer.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const out = process.argv[2] || require('path').join(__dirname, 'preview/shots/sc');
  const W = +(process.argv[3] || 1440), H = +(process.argv[4] || 900);
  const reduced = process.argv.includes('--reduced');
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push('pageerror ' + e.message));
  p.on('requestfailed', (r) => errs.push('failed ' + r.url()));
  p.on('response', (r) => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
  await p.addInitScript(() => { try { localStorage.setItem('teyel:cookie', 'true'); localStorage.setItem('teyel:popup', String(Date.now() + 1e9)); } catch {} });
  await p.goto((process.env.PREVIEW_URL || 'http://127.0.0.1:8765') + '/' + (process.env.HOME_PAGE || 'anasayfa.html'), { waitUntil: 'networkidle' });
  await p.waitForTimeout(600);
  const acts = await p.evaluate(() => [...document.querySelectorAll('[data-sc-act]')].map((a) => ({ cls: a.className.split(' ')[0], top: a.getBoundingClientRect().top + scrollY, h: a.offsetHeight })));
  console.log('acts', JSON.stringify(acts));
  const plan = [['ah', [0, 0.5, 1]], ['rk', [0, 0.3, 0.6, 0.9, 1]], ['drop', [0.1, 0.25]], ['cu', [0.4]]];
  const files = [];
  for (const [cls, ps] of plan) {
    const a = acts.find((x) => x.cls === cls); if (!a) continue;
    for (const pr of ps) {
      const pinned = a.h > H * 1.05 && cls !== 'drop' && cls !== 'cu';
      const y = pinned ? a.top + pr * (a.h - H) : a.top - H + pr * (a.h + H);
      await p.evaluate((y) => scrollTo(0, y), y);
      await p.waitForTimeout(450);
      const info = await p.evaluate((cls) => {
        const el = document.querySelector('.' + cls);
        const st = el.querySelector('[data-sc-stage]');
        const r = { p: el.style.getPropertyValue('--sc-p'), stageTop: st ? Math.round(st.getBoundingClientRect().top) : null };
        if (cls === 'rk') {
          const rail = el.querySelector('[data-sc-pan]');
          r.over = rail.scrollWidth - innerWidth; r.sewn = el.classList.contains('is-sewn');
          r.dash = el.querySelector('[data-thread-front] path')?.getAttribute('stroke-dasharray');
          r.needle = el.querySelector('[data-needle]')?.style.transform;
          r.current = el.querySelector('[aria-current="true"]')?.textContent;
        }
        return r;
      }, cls);
      const f = `${out}/${cls}-${String(pr).replace('.', '')}.jpg`;
      await p.screenshot({ path: f, type: 'jpeg', quality: 55 });
      files.push(f);
      console.log(cls, pr, JSON.stringify(info));
    }
  }
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log('overflow', ov, 'errors', errs.slice(0, 6));
  await b.close();
})();
