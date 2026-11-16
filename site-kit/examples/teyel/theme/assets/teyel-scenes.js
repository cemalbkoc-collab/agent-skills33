/* TEYEL sahneleri. Kaydırma motoru (scrollcraft.js) değiştirilmez; buradaki her şey
   sayfaya özeldir ve motorun her sahneye yazdığı --sc-p ilerleme değerini okur.
   İmza hareket: askıda iğne mavi teyel ipliğini her parçanın içinden geçirir,
   askının sonunda iplik gerilir ve kesik teyel kesintisiz dikişe dönüşür. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
  const progress = (el) => parseFloat(el.style.getPropertyValue('--sc-p')) || 0;
  const NS = 'http://www.w3.org/2000/svg';
  let api = null;
  let frame = 0;
  const scenes = [];

  /* ---------- açılış: işaretçiye çok hafif tepki (yalnızca ince işaretçi) ---------- */
  function hero(root) {
    const stage = root.querySelector('[data-ah-stage]');
    if (!stage || reduce) return null;
    let tx = 0, ty = 0, x = 0, y = 0;
    const onMove = (e) => {
      if (!fine.matches) return;
      const r = stage.getBoundingClientRect();
      tx = clamp((e.clientX - r.left) / r.width) * 2 - 1;
      ty = clamp((e.clientY - r.top) / r.height) * 2 - 1;
    };
    const onLeave = () => { tx = 0; ty = 0; };
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerleave', onLeave);
    return {
      tick() {
        x += (tx - x) * 0.08; y += (ty - y) * 0.08;
        stage.style.setProperty('--mx', x.toFixed(3));
        stage.style.setProperty('--my', y.toFixed(3));
      },
      destroy() { stage.removeEventListener('pointermove', onMove); stage.removeEventListener('pointerleave', onLeave); },
    };
  }

  /* ---------- askı: iğne ve teyel ipliği ---------- */
  function rack(root) {
    const rail = root.querySelector('[data-sc-pan]');
    const items = [...root.querySelectorAll('[data-rack-item]')];
    const back = root.querySelector('[data-thread-back]');
    const front = root.querySelector('[data-thread-front]');
    const needle = root.querySelector('[data-needle]');
    const links = [...root.querySelectorAll('[data-rack-jump]')];
    let lastBest = -1;
    const intro = root.querySelector('[data-rack-intro]');
    const end = root.querySelector('[data-rack-end]');
    if (!rail || !items.length || !back || !front) return null;

    const backPath = document.createElementNS(NS, 'path');
    const frontPath = document.createElementNS(NS, 'path');
    const backClip = document.createElementNS(NS, 'clipPath');
    const frontClip = document.createElementNS(NS, 'clipPath');
    const uid = 'rk' + Math.random().toString(36).slice(2, 7);
    backClip.id = uid + 'b'; frontClip.id = uid + 'f';
    back.append(backClip, backPath); front.append(frontClip, frontPath);
    backPath.setAttribute('clip-path', `url(#${backClip.id})`);
    frontPath.setAttribute('clip-path', `url(#${frontClip.id})`);
    const holes = document.createElementNS(NS, 'g');
    holes.setAttribute('class', 'rk__holes');
    front.append(holes);

    let geo = null;
    const layout = () => {
      const W = rail.scrollWidth; const H = rail.offsetHeight;
      back.setAttribute('viewBox', `0 0 ${W} ${H}`); front.setAttribute('viewBox', `0 0 ${W} ${H}`);
      back.style.width = front.style.width = W + 'px';
      const pts = items.map((it) => {
        const m = it.querySelector('[data-rack-media]') || it;
        const left = it.offsetLeft + m.offsetLeft; const w = m.offsetWidth;
        const y = it.offsetTop + m.offsetTop + m.offsetHeight * 0.52;
        return { a: left + w * 0.3, b: left + w * 0.7, l: left, r: left + w, y };
      });
      const y0 = pts[0].y;
      const x0 = intro ? intro.offsetLeft + intro.offsetWidth * 0.55 : pts[0].l - 120;
      const x1 = end ? end.offsetLeft + 24 : pts[pts.length - 1].r + 120;
      holes.textContent = '';
      pts.forEach((p) => [p.a, p.b].forEach((hx) => {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', hx.toFixed(1)); c.setAttribute('cy', p.y.toFixed(1)); c.setAttribute('r', '2.6');
        holes.append(c);
      }));
      geo = { pts, x0, x1, y0, W };
    };

    const build = (sag) => {
      const { pts, x0, x1, y0 } = geo;
      let d = `M${x0.toFixed(1)} ${y0.toFixed(1)}`;
      let px = x0, py = y0;
      pts.forEach((p) => {
        d += ` Q${((px + p.a) / 2).toFixed(1)} ${(Math.max(py, p.y) + sag).toFixed(1)} ${p.a.toFixed(1)} ${p.y.toFixed(1)} L${p.b.toFixed(1)} ${p.y.toFixed(1)}`;
        px = p.b; py = p.y;
      });
      d += ` Q${((px + x1) / 2).toFixed(1)} ${(py + sag).toFixed(1)} ${x1.toFixed(1)} ${y0.toFixed(1)}`;
      return d;
    };
    const rects = (clip, ranges, H) => {
      clip.textContent = '';
      ranges.forEach(([a, b]) => {
        if (b <= a) return;
        const r = document.createElementNS(NS, 'rect');
        r.setAttribute('x', a.toFixed(1)); r.setAttribute('y', '0'); r.setAttribute('width', (b - a).toFixed(1)); r.setAttribute('height', H);
        clip.append(r);
      });
    };

    const yAt = (x, sag) => {
      const { pts, x0, x1, y0 } = geo;
      let px = x0;
      for (const p of pts) {
        if (x < p.a) { const t = clamp((x - px) / Math.max(p.a - px, 1)); return p.y + sag * 4 * t * (1 - t) * 0.5; }
        if (x <= p.b) return p.y;
        px = p.b;
      }
      const t = clamp((x - px) / Math.max(x1 - px, 1)); return y0 + sag * 4 * t * (1 - t) * 0.5;
    };

    const onJump = (e) => {
      const i = links.indexOf(e.currentTarget);
      const it = items[i]; if (!it) return;
      e.preventDefault();
      if (reduce) { it.scrollIntoView({ block: 'nearest', inline: 'center' }); it.querySelector('a')?.focus({ preventScroll: true }); return; }
      const over = rail.scrollWidth - innerWidth;
      const extra = over * (parseFloat(rail.getAttribute('data-sc-pan')) || 0);
      const target = clamp((it.offsetLeft + it.offsetWidth / 2 - innerWidth / 2) / (over + extra));
      const top = root.getBoundingClientRect().top + scrollY;
      scrollTo({ top: top + target * (root.offsetHeight - innerHeight), behavior: 'smooth' });
      it.querySelector('a')?.focus({ preventScroll: true });
    };
    links.forEach((l) => l.addEventListener('click', onJump));
    // Klavyeyle askıdaki bir ürüne gelinince sahne onu görünür yere taşır.
    const onFocus = (e) => {
      const it = e.target.closest('[data-rack-item]'); if (!it || reduce) return;
      const r = it.getBoundingClientRect();
      if (r.left < 0 || r.right > innerWidth) onJump({ currentTarget: links[items.indexOf(it)], preventDefault() {} });
    };
    rail.addEventListener('focusin', onFocus);

    layout();
    const ro = new ResizeObserver(() => layout());
    ro.observe(rail);
    let lastKey = '';

    return {
      tick() {
        if (!geo) return;
        const r = root.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;
        const p = progress(root);
        const t = reduce ? 1 : smooth((p - 0.8) / 0.17);
        const sag = 34 * (1 - t);
        const railLeft = rail.getBoundingClientRect().left;
        const head = reduce ? geo.x1 : clamp(innerWidth * 0.6 - railLeft + t * innerWidth, geo.x0, geo.x1);
        const key = `${head.toFixed(0)}|${t.toFixed(3)}`;
        if (key !== lastKey) {
          lastKey = key;
          const d = build(sag);
          backPath.setAttribute('d', d); frontPath.setAttribute('d', d);
          const H = rail.offsetHeight;
          rects(backClip, [[0, head]], H);
          const ranges = []; let from = 0;
          geo.pts.forEach((pt) => { ranges.push([from, Math.min(pt.a, head)]); from = pt.b; });
          ranges.push([from, head]);
          rects(frontClip, ranges, H);
          const gap = (8 * (1 - t)).toFixed(2);
          [backPath, frontPath].forEach((el) => el.setAttribute('stroke-dasharray', `${(12 + 8 * t).toFixed(2)} ${gap}`));
          root.classList.toggle('is-sewn', t > 0.98);
          if (needle) {
            const y = yAt(head, sag); const y2 = yAt(head - 30, sag);
            const ang = Math.atan2(y - y2, 30) * 180 / Math.PI;
            needle.style.transform = `translate3d(${head.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${ang.toFixed(2)}deg)`;
            needle.style.opacity = (head >= geo.x1 - 2 ? 0 : 1).toString();
          }
        }
        // Parçalar sırayla yerine oturur; ilki zaten yerindedir.
        if (!reduce) {
          items.forEach((it, i) => {
            if (i === 0) return;
            const x = it.getBoundingClientRect().left;
            const s = smooth((innerWidth - x) / (innerWidth * 0.32));
            it.style.setProperty('--settle', s.toFixed(3));
          });
        }
        // Dizinde şu an ortadaki parça işaretlenir.
        let best = 0, bd = Infinity;
        items.forEach((it, i) => { const b = it.getBoundingClientRect(); const d = Math.abs(b.left + b.width / 2 - innerWidth / 2); if (d < bd) { bd = d; best = i; } });
        links.forEach((l, i) => (i === best ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current')));
        if (best !== lastBest) {
          lastBest = best;
          const ol = links[best] && links[best].closest('ol');
          if (ol && ol.scrollWidth > ol.clientWidth) { const l = links[best]; ol.scrollLeft = l.offsetLeft - (ol.clientWidth - l.offsetWidth) / 2; }
        }
      },
      destroy() { ro.disconnect(); links.forEach((l) => l.removeEventListener('click', onJump)); rail.removeEventListener('focusin', onFocus); },
    };
  }

  /* ---------- kapanış plakası: geçerli e-posta yazılınca kenar dikişe döner ---------- */
  function plate(root) {
    const input = root.querySelector('input[type="email"]');
    if (!input) return null;
    const onInput = () => root.classList.toggle('is-sewn', input.validity.valid && input.value.trim() !== '');
    input.addEventListener('input', onInput);
    onInput();
    return { destroy() { input.removeEventListener('input', onInput); } };
  }

  function loop() {
    scenes.forEach((s) => s && s.tick && s.tick());
    frame = requestAnimationFrame(loop);
  }

  function mount() {
    if (!window.ScrollCraft) return;
    api = window.ScrollCraft.mount(document.body);
    document.querySelectorAll('[data-scene="hero"]').forEach((el) => scenes.push(hero(el)));
    document.querySelectorAll('[data-scene="rack"]').forEach((el) => scenes.push(rack(el)));
    document.querySelectorAll('[data-scene="plate"]').forEach((el) => scenes.push(plate(el)));
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(loop);
  }
  function unmount() {
    cancelAnimationFrame(frame);
    scenes.splice(0).forEach((s) => s && s.destroy && s.destroy());
    if (api) { api.destroy(); api = null; }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  // Tema düzenleyicisinde bölüm eklenince ya da değişince sahneler yeniden kurulur.
  document.addEventListener('shopify:section:load', () => { unmount(); mount(); });
  document.addEventListener('shopify:section:unload', () => { unmount(); setTimeout(mount, 0); });
})();
