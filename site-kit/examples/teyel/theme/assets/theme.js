/* TEYEL tema betiği. Kütüphane yok; her özellik küçük ve bağımsız. */
(() => {
  'use strict';
  const T = window.theme || { routes: {}, strings: {} };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* özel pencere */ } },
  };

  function money(cents) {
    const fmt = T.moneyFormat || '{{amount_no_decimals_with_comma_separator}} TL';
    const n = cents / 100;
    const group = (v, sep) => v.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    const parts = n.toFixed(2).split('.');
    const map = {
      amount: `${group(parts[0], ',')}.${parts[1]}`,
      amount_no_decimals: group(Math.round(n).toString(), ','),
      amount_with_comma_separator: `${group(parts[0], '.')},${parts[1]}`,
      amount_no_decimals_with_comma_separator: group(Math.round(n).toString(), '.'),
    };
    return fmt.replace(/\{\{\s*(\w+)\s*\}\}/, (_, k) => map[k] ?? map.amount);
  }

  function toast(message) {
    const el = $('.toast');
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => { el.hidden = true; }, 2600);
  }

  /* ---------- pencereler ve çekmeceler ---------- */
  function openDialog(id, opener) {
    const d = document.getElementById(id);
    if (!d || d.open) return d;
    d.showModal();
    d._opener = opener || document.activeElement;
    if (opener) opener.setAttribute('aria-expanded', 'true');
    return d;
  }
  document.addEventListener('click', (e) => {
    const open = e.target.closest('[data-dialog-open],[data-drawer-open]');
    if (open) {
      const id = open.dataset.dialogOpen || open.dataset.drawerOpen;
      if (document.getElementById(id)) {
        e.preventDefault();
        openDialog(id, open);
        if (id === 'search-dialog') $('#search-input')?.focus();
      }
      return;
    }
    if (e.target.closest('[data-dialog-close]')) { e.target.closest('dialog')?.close(); return; }
    if (e.target instanceof HTMLDialogElement) {
      const r = e.target.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close();
    }
  });
  document.addEventListener('close', (e) => {
    const d = e.target;
    if (d._opener) { d._opener.setAttribute?.('aria-expanded', 'false'); d._opener.focus?.(); }
  }, true);

  /* ---------- üst menü: aşağı kayarken gizle ---------- */
  const header = $('[data-header]');
  if (header) {
    let last = 0;
    addEventListener('scroll', () => {
      const y = scrollY;
      header.classList.toggle('is-hidden', y > last && y > 240 && !header.matches(':focus-within'));
      last = y;
    }, { passive: true });
  }

  /* ---------- kaydırırken belirme ---------- */
  function reveal(root = document) {
    const els = $$('[data-reveal]:not(.is-in)', root);
    if (reduced || !('IntersectionObserver' in window) || !document.body.classList.contains('has-reveal')) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = reveal.io || (reveal.io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); reveal.io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' }));
    els.forEach((el, i) => { el.style.transitionDelay = `${Math.min(i % 4, 3) * 60}ms`; io.observe(el); });
  }

  /* ---------- geri sayım ---------- */
  function countdowns(root = document) {
    $$('[data-countdown]', root).forEach((el) => {
      const end = Date.parse(el.dataset.countdown);
      if (Number.isNaN(end)) { el.hidden = true; return; }
      const done = el.parentElement.querySelector('[data-countdown-done]');
      const tick = () => {
        const left = end - Date.now();
        if (left <= 0) { el.hidden = true; if (done) done.hidden = false; clearInterval(timer); return; }
        const v = { d: Math.floor(left / 864e5), h: Math.floor(left / 36e5) % 24, m: Math.floor(left / 6e4) % 60, s: Math.floor(left / 1e3) % 60 };
        Object.keys(v).forEach((k) => { const b = el.querySelector(`[data-cd="${k}"]`); if (b) b.textContent = String(v[k]).padStart(2, '0'); });
      };
      const timer = setInterval(tick, 1000);
      tick();
    });
  }

  /* ---------- sepet ---------- */
  async function refreshCart(sections) {
    const drawer = $('[data-cart-drawer]');
    const html = sections && sections['cart-drawer'];
    if (drawer && html) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const fresh = doc.querySelector('[data-cart-drawer]');
      if (fresh) { const wasOpen = drawer.open; drawer.innerHTML = fresh.innerHTML; if (wasOpen && !drawer.open) drawer.showModal(); }
    }
    const count = drawer ? ($('[data-cart-count-text]', drawer)?.textContent || '').replace(/\D/g, '') : '';
    $$('[data-cart-count]').forEach((el) => { el.textContent = count || '0'; el.hidden = !count || count === '0'; });
    document.dispatchEvent(new CustomEvent('cart:updated'));
  }
  async function cartRequest(url, body) {
    const drawer = $('[data-cart-drawer]');
    drawer?.classList.add('is-loading');
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...body, sections: 'cart-drawer', sections_url: location.pathname }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.description || data.message || T.strings.error);
      await refreshCart(data.sections);
      return data;
    } finally { drawer?.classList.remove('is-loading'); }
  }
  document.addEventListener('submit', async (e) => {
    const form = e.target.closest('[data-product-form]');
    if (!form) return;
    e.preventDefault();
    const btn = form.querySelector('[data-add]');
    btn?.setAttribute('aria-busy', 'true');
    try {
      await cartRequest(T.routes.cart_add, { items: [{ id: Number(form.querySelector('[name="id"]').value), quantity: 1 }] });
      form.closest('dialog')?.close();
      openDialog('cart-drawer', btn);
      toast(T.strings.added);
    } catch (err) { toast(err.message); } finally { btn?.removeAttribute('aria-busy'); }
  });
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-qty-change]');
    if (!btn) return;
    const line = btn.closest('[data-line]');
    if (!line) return;
    try { await cartRequest(T.routes.cart_change, { line: Number(line.dataset.line), quantity: Number(btn.dataset.qtyChange) }); } catch (err) { toast(err.message); }
  });

  /* ---------- ürün: renk/beden seçici ---------- */
  function initProduct(root) {
    if (!root || root._ready) return;
    root._ready = true;
    const dataEl = $('[data-variants]', root);
    if (!dataEl) return;
    const variants = JSON.parse(dataEl.textContent);
    const low = Number(root.dataset.low || 0);
    const inputs = $$('.picker__input', root);
    const isQuick = root.hasAttribute('data-quick');
    const setMedia = (id) => {
      if (!id) return;
      const items = $$('[data-media]', root);
      if (!items.some((i) => i.dataset.media === String(id))) return;
      items.forEach((i) => i.classList.toggle('is-active', i.dataset.media === String(id)));
      $$('[data-media-thumb]', root).forEach((t) => t.setAttribute('aria-current', String(t.dataset.mediaThumb === String(id))));
    };
    $$('[data-media-thumb]', root).forEach((t) => t.addEventListener('click', () => setMedia(t.dataset.mediaThumb)));
    const active = $('.gallery-stage__item.is-active', root);
    if (active) setMedia(active.dataset.media);

    const selected = () => {
      const opts = [];
      inputs.filter((i) => i.checked).forEach((i) => { opts[Number(i.dataset.optionIndex)] = i.value; });
      return opts;
    };
    const update = () => {
      const opts = selected();
      const v = variants.find((x) => x.options.every((o, i) => o === opts[i]));
      inputs.forEach((i) => {
        const idx = Number(i.dataset.optionIndex);
        const probe = opts.slice(); probe[idx] = i.value;
        const match = variants.find((x) => x.options.every((o, k) => o === probe[k]));
        i.classList.toggle('is-unavailable', !match || !match.available);
      });
      $$('.picker__group', root).forEach((g, i) => { const c = $('[data-option-current]', g); if (c && opts[i]) c.textContent = opts[i]; });
      const add = $('[data-add]', root); const label = $('[data-add-label]', root);
      const sticky = document.querySelector('[data-sticky-add]');
      if (!v) { if (add) add.disabled = true; return; }
      $('[data-variant-id]', root).value = v.id;
      if (add) add.disabled = !v.available;
      if (!isQuick && sticky) sticky.disabled = !v.available;
      if (label) label.textContent = v.available ? label.dataset.textAdd || label.textContent : label.dataset.textSold || label.textContent;
      const priceEl = $('[data-price]', root);
      if (priceEl) {
        priceEl.classList.toggle('price--sale', v.compare > v.price);
        priceEl.innerHTML = `${v.compare > v.price ? `<s class="price__compare">${money(v.compare)}</s>` : ''}<span class="price__now">${money(v.price)}</span>`;
      }
      $$('[data-add-price]', root).forEach((el) => { el.textContent = money(v.price); });
      if (!isQuick) $$('[data-sticky-price]').forEach((el) => { el.textContent = money(v.price); });
      const inst = $('[data-installment-amount]', root);
      if (inst) inst.textContent = money(Math.floor(v.price / (Number(inst.dataset.count) || 3)));
      const stock = $('[data-stock]', root);
      if (stock) {
        const show = v.available && v.qty !== null && v.qty > 0 && v.qty <= low;
        stock.hidden = !show;
        if (show) $('[data-stock-text]', stock).textContent = (stock.dataset.template || '').replace('[count]', v.qty);
      }
      const notify = $('[data-notify]', root);
      if (notify) { notify.hidden = v.available; const nv = $('[data-notify-variant]', notify); if (nv) nv.value = v.title; }
      setMedia(v.media);
      if (!isQuick && history.replaceState) { const u = new URL(location.href); u.searchParams.set('variant', v.id); history.replaceState({}, '', u); }
    };
    inputs.forEach((i) => i.addEventListener('change', update));
    if (inputs.length) update();

    if (!isQuick) {
      const recentEl = $('[data-recent]', root);
      if (recentEl) {
        const item = JSON.parse(recentEl.textContent);
        const list = store.get('teyel:recent', []).filter((x) => x.handle !== item.handle);
        list.unshift(item);
        store.set('teyel:recent', list.slice(0, 12));
      }
      const sticky = document.querySelector('[data-sticky-buy]');
      const buy = $('.buy', root);
      if (sticky && buy && 'IntersectionObserver' in window) {
        new IntersectionObserver(([en]) => { sticky.hidden = en.isIntersecting || en.boundingClientRect.top > 0; }).observe(buy);
      }
    }
  }

  /* ---------- hızlı bakış ---------- */
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-quick-view]');
    if (!btn) return;
    e.preventDefault();
    const body = $('[data-quick-view-body]');
    const dialog = openDialog('quick-view', btn);
    if (!body || !dialog) { location.href = btn.dataset.quickView; return; }
    body.innerHTML = `<p class="dialog__loading">…</p>`;
    try {
      const url = new URL(btn.dataset.quickView, location.origin);
      url.searchParams.set('section_id', 'quick-view');
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
      const quick = doc.querySelector('[data-quick]');
      if (!quick) throw new Error();
      body.replaceChildren(quick);
      initProduct(quick);
      wishlistSync(quick);
    } catch { location.href = btn.dataset.quickView; }
  });

  /* ---------- favoriler ---------- */
  const WISH = 'teyel:wishlist';
  function wishlistSync(root = document) {
    const list = store.get(WISH, []);
    $$('[data-wishlist-toggle]', root).forEach((b) => {
      const on = list.includes(b.dataset.wishlistToggle);
      b.setAttribute('aria-pressed', String(on));
    });
    $$('[data-wishlist-count]').forEach((el) => { el.textContent = list.length; el.hidden = list.length === 0; });
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-wishlist-toggle]');
    if (!b) return;
    const handle = b.dataset.wishlistToggle;
    let list = store.get(WISH, []);
    const on = list.includes(handle);
    list = on ? list.filter((h) => h !== handle) : [handle, ...list];
    store.set(WISH, list);
    wishlistSync();
    toast(on ? T.strings.wishlist_remove : T.strings.wishlist_add);
    document.dispatchEvent(new CustomEvent('wishlist:updated'));
  });

  /* ---------- istemci tarafı ürün kartı (son bakılanlar, favoriler) ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function miniCard(p) {
    return `<li><article class="card"><div class="card__media"><a class="card__link" href="${esc(p.url)}" aria-label="${esc(p.title)}">${p.image ? `<img class="card__img" src="${esc(p.image)}" width="600" height="600" loading="lazy" alt="${esc(p.title)}">` : ''}</a></div><div class="card__body"><div class="card__row"><h3 class="card__title"><a href="${esc(p.url)}">${esc(p.title)}</a></h3><div class="price"><span class="price__now">${esc(p.price)}</span></div></div></div></article></li>`;
  }
  function recentlyViewed() {
    const sec = $('[data-recently-viewed]');
    if (!sec) return;
    const current = $('[data-product]:not([data-quick])')?.dataset.handle;
    const items = store.get('teyel:recent', []).filter((x) => x.handle !== current).slice(0, Number(sec.dataset.limit || 4));
    if (!items.length) return;
    $('[data-recently-list]', sec).innerHTML = items.map(miniCard).join('');
    sec.hidden = false;
  }
  async function wishlistPage() {
    const wrap = $('[data-wishlist-list]');
    if (!wrap) return;
    const empty = $('[data-wishlist-empty]');
    const handles = store.get(WISH, []);
    if (!handles.length) { wrap.innerHTML = ''; if (empty) empty.hidden = false; return; }
    if (empty) empty.hidden = true;
    const results = await Promise.all(handles.map((h) => fetch(`${T.routes.root.replace(/\/$/, '')}/products/${h}.js`).then((r) => (r.ok ? r.json() : null)).catch(() => null)));
    wrap.innerHTML = results.filter(Boolean).map((p) => miniCard({ url: p.url, title: p.title, image: p.featured_image, price: money(p.price) })).join('');
  }
  document.addEventListener('wishlist:updated', wishlistPage);

  /* ---------- önerilen ürünler ---------- */
  function recommendations() {
    $$('[data-recommendations]').forEach(async (sec) => {
      if (sec.children.length || !sec.dataset.url) return;
      try {
        const res = await fetch(sec.dataset.url);
        const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
        const fresh = doc.querySelector('[data-recommendations]');
        if (fresh && fresh.innerHTML.trim()) { sec.innerHTML = fresh.innerHTML; wishlistSync(sec); }
      } catch { /* öneri yoksa bölüm boş kalır */ }
    });
  }

  /* ---------- koleksiyon: filtre ve sıralama ---------- */
  async function loadCollection(url, push = true) {
    const wrap = $('[data-collection]');
    if (!wrap) { location.href = url; return; }
    wrap.classList.add('is-loading');
    try {
      const u = new URL(url, location.origin);
      const fetchUrl = new URL(u); fetchUrl.searchParams.set('section_id', wrap.dataset.section);
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error();
      const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
      const fresh = doc.querySelector('[data-collection]');
      if (!fresh) throw new Error();
      const drawerOpen = $('#filter-drawer', wrap)?.open;
      wrap.innerHTML = fresh.innerHTML;
      if (push) history.pushState({}, '', u);
      if (drawerOpen) $('#filter-drawer', wrap)?.showModal();
      reveal(wrap); wishlistSync(wrap); countdowns(wrap);
    } catch { location.href = url; } finally { wrap.classList.remove('is-loading'); }
  }
  document.addEventListener('change', (e) => {
    if (e.target.matches('[data-sort]')) {
      const u = new URL(location.href); u.searchParams.set('sort_by', e.target.value); u.searchParams.delete('page');
      loadCollection(u.toString());
    } else if (e.target.closest('[data-facets]') && e.target.type === 'checkbox') {
      submitFacets(e.target.closest('[data-facets]'));
    }
  });
  function submitFacets(form) {
    const params = new URLSearchParams();
    new FormData(form).forEach((v, k) => { if (v !== '') params.append(k, v); });
    loadCollection(`${form.getAttribute('action')}?${params}`);
  }
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('[data-facets]');
    if (!form) return;
    e.preventDefault();
    submitFacets(form);
    form.closest('dialog')?.close();
  });
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-filter-link]');
    if (a && $('[data-collection]')) { e.preventDefault(); loadCollection(a.href); }
  });
  addEventListener('popstate', () => { if ($('[data-collection]')) loadCollection(location.href, false); });

  /* ---------- beden önerisi ---------- */
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('[data-size-finder]');
    if (!form) return;
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    const num = (v) => Number(String(v).replace(',', '.'));
    let size = null;
    switch (form.dataset.sizeFinder) {
      case 'ust': {
        const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        const bmi = num(f.weight) / (num(f.height) / 100) ** 2;
        let i = bmi < 19.5 ? 0 : bmi < 22 ? 1 : bmi < 24.5 ? 2 : bmi < 27 ? 3 : bmi < 30 ? 4 : 5;
        if (num(f.height) >= 188) i += 1; if (num(f.height) <= 162) i -= 1;
        size = sizes[Math.max(0, Math.min(5, i + num(f.fit)))];
        break;
      }
      case 'alt': {
        const sizes = ['28', '30', '32', '34', '36', '38'];
        const bmi = num(f.weight) / (num(f.height) / 100) ** 2;
        const i = bmi < 19.5 ? 0 : bmi < 22 ? 1 : bmi < 24.5 ? 2 : bmi < 27 ? 3 : bmi < 30 ? 4 : 5;
        size = sizes[Math.max(0, Math.min(5, i + num(f.fit)))];
        break;
      }
      case 'ayakkabi': { const eu = Math.round((num(f.foot) + 1.5) * 1.5 - 0.75); size = eu >= 36 && eu <= 45 ? String(eu) : null; break; }
      case 'yuzuk': { const s = Math.round((num(f.finger) - 40) / 2) * 2; size = s >= 10 && s <= 22 ? String(s) : null; break; }
      case 'bilezik': { const w = num(f.wrist); size = w <= 15.5 ? 'S' : w <= 17.5 ? 'M' : w <= 19.5 ? 'L' : null; break; }
    }
    const out = $('[data-size-result]', form);
    out.textContent = size ? T.strings.size_result.replace('[size]', size) : T.strings.size_none;
    out.hidden = false;
    if (size) {
      const input = $$('.picker__input').find((i) => i.value === size);
      if (input) { input.checked = true; input.dispatchEvent(new Event('change', { bubbles: true })); }
    }
  });

  /* ---------- çerez bandı ---------- */
  function cookieBanner() {
    const el = $('[data-cookie-banner]');
    if (!el) return;
    const saved = store.get('teyel:cookie', null);
    const api = window.Shopify && window.Shopify.customerPrivacy;
    if (saved === null && !(api && api.userCanBeTracked && api.currentVisitorConsent && api.currentVisitorConsent().marketing !== '')) el.hidden = false;
    const decide = (ok) => {
      store.set('teyel:cookie', ok);
      el.hidden = true;
      const set = () => window.Shopify.customerPrivacy.setTrackingConsent({ analytics: ok, marketing: ok, preferences: ok }, () => {});
      if (window.Shopify && window.Shopify.loadFeatures) window.Shopify.loadFeatures([{ name: 'consent-tracking-api', version: '0.1' }], (err) => { if (!err) set(); });
    };
    $('[data-cookie-accept]', el).addEventListener('click', () => decide(true));
    $('[data-cookie-decline]', el).addEventListener('click', () => decide(false));
  }

  /* ---------- bülten penceresi: rahatsız etmeyen ---------- */
  function newsletterPopup() {
    const d = $('[data-newsletter-popup]');
    if (!d) return;
    const until = store.get('teyel:popup', 0);
    if (Date.now() < until || location.search.includes('customer_posted')) return;
    const snooze = () => store.set('teyel:popup', Date.now() + 30 * 864e5);
    setTimeout(() => {
      const banner = $('[data-cookie-banner]');
      if (document.querySelector('dialog[open]') || (banner && !banner.hidden)) return;
      d.show();
    }, Number(d.dataset.delay || 20) * 1000);
    d.addEventListener('close', snooze);
    d.addEventListener('submit', snooze);
  }

  /* ---------- arama önerileri ---------- */
  function predictive() {
    const form = $('[data-predictive-form]');
    const out = $('[data-predictive-results]');
    if (!form || !out || !T.routes.predictive) return;
    let ctrl; let timer;
    form.q.addEventListener('input', () => {
      clearTimeout(timer);
      const q = form.q.value.trim();
      if (q.length < 2) { out.innerHTML = ''; return; }
      timer = setTimeout(async () => {
        ctrl?.abort(); ctrl = new AbortController();
        try {
          const res = await fetch(`${T.routes.predictive}?q=${encodeURIComponent(q)}&resources[type]=product,collection&resources[limit]=6&section_id=predictive-search`, { signal: ctrl.signal });
          if (!res.ok) return;
          const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
          out.innerHTML = doc.querySelector('[data-predictive]')?.innerHTML || '';
        } catch { /* yazmaya devam edildi */ }
      }, 220);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    reveal(); countdowns(); wishlistSync(); cookieBanner(); newsletterPopup(); predictive(); recommendations();
    $$('[data-product]').forEach(initProduct);
    recentlyViewed(); wishlistPage();
  });
})();
