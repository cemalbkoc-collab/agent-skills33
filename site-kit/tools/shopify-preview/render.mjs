// Yerel önizleme: tema Liquid dosyalarını örnek verilerle statik HTML'e çevirir (Shopify olmadan bakabilmek için).
import { Liquid } from "liquidjs";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const HERE = path.dirname(new URL(import.meta.url).pathname);
const EX = path.resolve(HERE, "../../examples/teyel");
const DATA = process.env.CATALOG || path.join(EX, "data/catalog.mjs");
const { products: RAW, collections: COLS, categories, groups } = await import(pathToFileURL(path.resolve(DATA)).href);

const THEME = path.resolve(process.env.THEME_DIR || path.join(EX, "theme"));
const OUT = path.resolve(process.env.OUT_DIR || path.join(HERE, "preview"));
const read = (p) => fs.readFileSync(path.join(THEME, p), "utf8");
const locale = JSON.parse(read("locales/tr.default.json"));
const settingsSchema = JSON.parse(read("config/settings_schema.json"));
const settings = {};
for (const g of settingsSchema) for (const s of g.settings || []) if (s.id && s.default !== undefined) settings[s.id] = s.default;
Object.assign(settings, JSON.parse(read("config/settings_data.json")).current);
settings.social_instagram = "https://instagram.com/";

const IMG = (file, alt = "", w = 1000, h = 1000) => ({ src: `img/${file}`, alt, width: w, height: h, aspect_ratio: +(w / h).toFixed(4), id: Math.abs(hash(file)) });
function hash(s) { let a = 7; for (const c of s) a = (a * 31 + c.charCodeAt(0)) | 0; return a; }
const fmt = (cents) => `${Math.round(cents / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} TL`;
const PAGES = new Set(["kalip-ceket", "ilmek-kazak", "muhur-yuzuk"]);

let vid = 1000;
const products = RAW.map((p) => {
  const media = p.colors.map((c) => IMG(c.image, `${p.title}, ${c.name}`));
  const variants = p.variants.map((v) => ({
    id: ++vid, title: `${v.color} / ${v.size}`, options: [v.color, v.size], available: v.qty > 0,
    price: p.price * 100, compare_at_price: p.compareAt ? p.compareAt * 100 : null,
    inventory_management: "shopify", inventory_quantity: v.qty, featured_media: media[p.colors.findIndex((c) => c.name === v.color)],
  }));
  const first = variants.find((v) => v.available) || variants[0];
  const opts = [{ name: "Renk", position: 1, values: p.colors.map((c) => c.name), selected_value: first.options[0] }, { name: "Beden", position: 2, values: p.sizes, selected_value: first.options[1] }];
  return {
    id: Math.abs(hash(p.handle)), handle: p.handle, title: p.title, type: p.type, vendor: "TEYEL", tags: p.tags, _raw: p,
    url: PAGES.has(p.handle) ? `urun-${p.handle}.html` : "urun-kalip-ceket.html",
    price: p.price * 100, compare_at_price: p.compareAt ? p.compareAt * 100 : null, price_varies: false, available: variants.some((v) => v.available),
    featured_media: media[0], media, variants, selected_or_first_available_variant: first, has_only_default_variant: false,
    options_with_values: opts, options_by_name: { Renk: opts[0], Beden: opts[1] },
    description: `<p>${p.desc}</p>`,
    metafields: { custom: { material: { value: p.material }, care: { value: p.care }, complete_the_look: { value: null } }, reviews: { rating: { value: null } } },
  };
});
const bySlug = Object.fromEntries(products.map((p) => [p.handle, p]));
bySlug["kalip-ceket"].metafields.custom.complete_the_look.value = ["pili-pantolon", "recme-balikci-yaka-kazak", "agraf-chelsea", "zincir-bilezik"].map((h) => bySlug[h]);

const SORTS = [["manual", "Önerilen"], ["best-selling", "Çok satanlar"], ["created-descending", "En yeni"], ["price-ascending", "Fiyat: düşükten yükseğe"], ["price-descending", "Fiyat: yüksekten düşüğe"]].map(([value, name]) => ({ value, name }));
const colUrl = (h) => (h === "drop-01-mavi-teyel" ? "drop.html" : h === "giyim" ? "koleksiyon.html" : "koleksiyon.html");
const collections = Object.fromEntries(COLS.map((c) => {
  const list = RAW.map((r, i) => [r, products[i]]).filter(([r]) => c.rule(r)).map(([, p]) => p);
  const count = (key) => { const m = new Map(); for (const p of list) for (const v of key(p)) m.set(v, (m.get(v) || 0) + 1); return [...m].map(([label, n]) => ({ label, value: label, count: n, active: false, param_name: "filter.v", url_to_remove: "#" })); };
  const lf = (label, values) => ({ label, type: "list", values, active_values: values.filter((v) => v.active) });
  const filters = [
    lf("Ürün türü", count((p) => [p.type])), lf("Renk", count((p) => p._raw.colors.map((x) => x.name))), lf("Beden", count((p) => p._raw.sizes)),
    { label: "Fiyat", type: "price_range", active_values: [], min_value: { param_name: "filter.v.price.gte", value: null }, max_value: { param_name: "filter.v.price.lte", value: null }, range_max: Math.max(...list.map((p) => p.price), 0), url_to_remove: "#" },
    lf("Malzeme", count((p) => [p._raw.material.split(",")[0].replace(/%\d+\s*/, "").trim()]).slice(0, 8)),
  ];
  return [c.handle, { handle: c.handle, title: c.title, description: c.desc ? `<p>${c.desc}</p>` : "", url: colUrl(c.handle), products: list, products_count: list.length, all_products_count: list.length, filters, sort_options: SORTS, sort_by: "manual", default_sort_by: "manual", image: c.handle.startsWith("drop") ? IMG("drop.jpg", "Drop 01 ürünleri", 650, 813) : null }];
}));

const L = (title, url, links = []) => ({ title, url, links, current: false });
const sub = (g) => categories.filter((c) => c.group === g).map((c) => L(c.title, "koleksiyon.html"));
const linklists = {
  "main-menu": { links: [L("Giyim", "koleksiyon.html", sub("giyim")), L("Ayakkabı", "koleksiyon.html", sub("ayakkabi")), L("Takı ve Aksesuar", "koleksiyon.html", sub("taki-aksesuar")), L("Drop", "drop.html"), L("İndirim", "koleksiyon.html"), L("Atölye", "hakkimizda.html")] },
  giyim: { links: sub("giyim") }, ayakkabi: { links: sub("ayakkabi") }, "taki-aksesuar": { links: sub("taki-aksesuar") },
  footer: { links: [L("Yeni Gelenler", "koleksiyon.html"), L("Çok Satanlar", "koleksiyon.html"), L("Drop", "drop.html"), L("İndirim", "koleksiyon.html")] },
  yardim: { links: [L("Sık sorulan sorular", "sss.html"), L("Kargo ve iade", "iade-kargo.html"), L("Lookbook", "lookbook.html"), L("İletişim", "iletisim.html")] },
  yasal: { links: [L("KVKK aydınlatma metni", "kvkk.html"), L("Çerez politikası", "cerez.html"), L("Mesafeli satış sözleşmesi", "mesafeli-satis.html")] },
};
const cartItems = ["kalip-ceket", "zincir-bilezik"].map((h, i) => { const p = bySlug[h]; const v = p.selected_or_first_available_variant; return { product: p, variant: v, url: p.url, image: p.featured_media, quantity: 1, final_line_price: v.price, key: i, url_to_remove: "#" }; });
const cart = { items: cartItems, item_count: cartItems.length, total_price: cartItems.reduce((a, i) => a + i.final_line_price, 0), currency: { iso_code: "TRY" } };
const previewImages = {
  "hero.image": IMG("hero.jpg", "Lacivert atölye ceketi ve bol pantolon giymiş, kalıp kâğıdına bakan model", 1500, 848), "hero.image_mobile": IMG("hero-m.jpg", "", 720, 848),
  "drop.image": IMG("drop.jpg", "Kobalt örme yelek, çizgili tişört ve koşu ayakkabısı", 650, 813), "jewelry.image": IMG("taki.jpg", "Gümüş zincir bilezik ve yüzükler takılı el", 650, 813),
  "story.image": IMG("atolye.jpg", "Terzi makası, iğnelik ve kobalt iplik makarası", 900, 605),
  "g1.image": IMG("atolye.jpg"), "g2.image": IMG("taki.jpg"), "g3.image": IMG("sezon.jpg"), "g4.image": IMG("drop.jpg"), "g5.image": IMG("hero-m.jpg"), "g6.image": IMG("kazak-1.jpg"),
  "c1.image": IMG("ceket-1.jpg"), "c2.image": IMG("bot-1.jpg"), "c3.image": IMG("yuzuk-3.jpg"),
  "hero.plate": IMG("katman-plaka.jpg", "", 2400, 1357), "hero.subject": IMG("katman-kisi.png", "Lacivert Kalıp Ceket ve Pili Pantolon giymiş, duvardaki kalıba bakan kişi", 2400, 1357),
  "rack.needle": IMG("igne.png", "", 505, 58),
  "p1.cutout": IMG("kesik-ceket-1.png", "", 760, 760), "p2.cutout": IMG("kesik-kazak-1.png", "", 760, 760), "p3.cutout": IMG("kesik-pantolon-1.png", "", 760, 760), "p4.cutout": IMG("kesik-tisort-1.png", "", 760, 760),
  "p5.cutout": IMG("kesik-sneaker-2.png", "", 760, 760), "p6.cutout": IMG("kesik-bot-1.png", "", 760, 760), "p7.cutout": IMG("kesik-bilezik-1.png", "", 760, 760), "p8.cutout": IMG("kesik-canta-1.png", "", 760, 760),
  "closeup.subject": IMG("katman-el.png", "Zincir bilezik, mühür yüzük ve ince halka takılı, tebeşir tutan el", 896, 1120),
};

const engine = new Liquid({ root: [path.join(THEME, "snippets")], partials: [path.join(THEME, "snippets")], extname: ".liquid", cache: true });
const kw = (args) => Object.fromEntries(args.filter(Array.isArray));
engine.registerFilter("t", (key, ...args) => {
  let v = key.split(".").reduce((o, k) => (o ? o[k] : undefined), locale);
  if (v === undefined) { missing.add(key); return `[[${key}]]`; }
  for (const [k, val] of Object.entries(kw(args))) v = v.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), val);
  return v;
});
engine.registerFilter("asset_url", (n) => `assets/${n}`);
engine.registerFilter("stylesheet_tag", (u) => `<link href="${u}" rel="stylesheet">`);
engine.registerFilter("preload_tag", (u, ...a) => { const o = kw(a); return `<link rel="preload" href="${u}" as="${o.as}" type="${o.type || ""}" crossorigin>`; });
engine.registerFilter("image_url", (img) => (img && img.src) || img || "");
engine.registerFilter("money", (c) => fmt(Number(c) || 0));
engine.registerFilter("money_without_currency", (c) => String(Math.round(c / 100)));
engine.registerFilter("handleize", (s) => handle(s));
engine.registerFilter("handle", (s) => handle(s));
engine.registerFilter("placeholder_svg_tag", (n, cls) => `<svg class="${cls || ""}" viewBox="0 0 10 10"></svg>`);
engine.registerFilter("payment_type_svg_tag", () => "");
engine.registerFilter("structured_data", (p) => JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: p.title, offers: { "@type": "Offer", price: p.price / 100, priceCurrency: "TRY" } }));
engine.registerFilter("default_errors", () => "");
engine.registerFilter("format_address", () => "");
engine.registerFilter("url_encode", (v) => encodeURIComponent(v));
engine.registerFilter("payment_button", () => "");
function handle(s) { const m = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", İ: "i", Ç: "c", Ğ: "g", Ö: "o", Ş: "s", Ü: "u" }; return String(s || "").replace(/[çğıöşüİÇĞÖŞÜ]/g, (c) => m[c]).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
const missing = new Set();

const blockTag = (name, renderFn) => engine.registerTag(name, {
  parse(token, remaining) {
    this.args = token.args; this.tpls = [];
    const stream = this.liquid.parser.parseStream(remaining).on(`tag:end${name}`, () => stream.stop()).on("template", (t) => this.tpls.push(t)).on("end", () => { throw new Error(`${name} kapanmadı`); });
    stream.start();
  },
  *render(ctx, emitter) { yield* renderFn.call(this, ctx, emitter); },
});
engine.registerTag("schema", { parse(token, remaining) { const s = this.liquid.parser.parseStream(remaining).on("tag:endschema", () => s.stop()); s.start(); }, render() { return ""; } });
blockTag("style", function* (ctx, emitter) { emitter.write("<style>"); yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter); emitter.write("</style>"); });
blockTag("form", function* (ctx, emitter) {
  const type = (this.args.match(/^'([^']+)'/) || [])[1];
  const attr = async (k) => { const m = this.args.match(new RegExp(`${k}:\\s*('[^']*'|[\\w.]+)`)); return m ? await this.liquid.evalValue(m[1], ctx) : ""; };
  const id = yield attr("id"); const cls = yield attr("class");
  const extra = /data-product-form/.test(this.args) ? " data-product-form" : "";
  const action = type === "product" ? "/cart/add" : type === "customer" ? "/contact#contact_form" : "/contact";
  emitter.write(`<form method="post" action="${action}" id="${id}" class="${cls}"${extra} accept-charset="UTF-8">`);
  ctx.push({ form: { "posted_successfully?": false, errors: null } });
  yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter);
  ctx.pop(); emitter.write("</form>");
});
blockTag("paginate", function* (ctx, emitter) {
  const m = this.args.match(/^([\w.]+)\s+by\s+([\w.]+)/);
  const per = Number(yield this.liquid.evalValue(m[2], ctx)) || 24;
  const parts = m[1].split("."); const key = parts.pop();
  const col = ctx.getSync(parts) || {};
  const all = col[key] || []; const pages = Math.ceil(all.length / per);
  col[key] = all.slice(0, per);
  ctx.push({ paginate: { pages, current_page: 1, previous: null, next: pages > 1 ? { url: "#" } : null } });
  yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter);
  ctx.pop(); col[key] = all;
});

function resolveSetting(def, value, key) {
  if (def.type === "image_picker") return previewImages[key] || null;
  if (value === undefined) value = def.default;
  if (value === undefined || value === "") return value;
  if (def.type === "collection") return collections[value] || null;
  if (def.type === "product") return bySlug[value] || null;
  if (def.type === "product_list") return (value || []).map((h) => bySlug[h]).filter(Boolean);
  if (def.type === "page") return value === "favoriler" ? { url: "favoriler.html" } : null;
  if (def.type === "url" && typeof value === "string" && value.startsWith("shopify://")) { const [, kind, h] = value.match(/shopify:\/\/(\w+)\/(.+)/); return kind === "collections" ? collections[h]?.url || "koleksiyon.html" : ({ hakkimizda: "hakkimizda.html", iletisim: "iletisim.html" }[h] || "#"); }
  return value;
}
const sectionCache = {};
function loadSection(type) {
  if (sectionCache[type]) return sectionCache[type];
  const src = read(`sections/${type}.liquid`);
  const schema = JSON.parse((src.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/) || [, "{}"])[1]);
  return (sectionCache[type] = { tpl: engine.parse(src), schema });
}
async function renderSection(id, conf, scope) {
  const { tpl, schema } = loadSection(conf.type);
  const st = {};
  for (const d of schema.settings || []) if (d.id) st[d.id] = resolveSetting(d, conf.settings?.[d.id], `${id}.${d.id}`);
  const blocks = (conf.block_order || Object.keys(conf.blocks || {})).map((bid) => {
    const b = conf.blocks[bid]; const def = (schema.blocks || []).find((x) => x.type === b.type) || {}; const bs = {};
    for (const d of def.settings || []) if (d.id) bs[d.id] = resolveSetting(d, b.settings?.[d.id], `${bid}.${d.id}`);
    return { id: bid, type: b.type, settings: bs, shopify_attributes: "" };
  });
  const html = await engine.render(tpl, { ...scope, section: { id, settings: st, blocks } });
  return `<div id="shopify-section-${id}" class="shopify-section${schema.class ? " " + schema.class : ""}${scope.__group ? " shopify-section-group-" + scope.__group : ""}">${html}</div>`;
}
let currentScope = {};
engine.registerTag("section", { parse(t) { this.name = t.args.replace(/['"\s]/g, ""); }, async render() { return renderSection(this.name, { type: this.name }, currentScope); } });
engine.registerTag("sections", {
  parse(t) { this.name = t.args.replace(/['"\s]/g, ""); },
  async render() { const g = JSON.parse(read(`sections/${this.name}.json`)); let out = ""; for (const id of g.order) out += await renderSection(id, g.sections[id], { ...currentScope, __group: this.name }); return out; },
});

async function page(file, template, extra = {}) {
  const tplName = template.split(".")[0];
  const scope = {
    settings, shop: { name: "TEYEL", description: "Önce teyel, sonra dikiş.", money_format: "{{amount_no_decimals_with_comma_separator}} TL", customer_accounts_enabled: true, enabled_payment_types: [], checkout: { guest_login: false }, password_message: "" },
    routes: { root_url: "anasayfa.html", cart_url: "sepet.html", cart_add_url: "/cart/add", cart_change_url: "/cart/change", search_url: "#", predictive_search_url: "", product_recommendations_url: "", all_products_collection_url: "koleksiyon.html", collections_url: "koleksiyon.html", account_url: "giris.html", account_login_url: "giris.html", account_register_url: "giris.html", account_logout_url: "anasayfa.html", account_addresses_url: "#" },
    request: { locale: { iso_code: "tr" }, page_type: tplName, origin: "https://teyel.example" }, template: { name: tplName },
    linklists, collections, cart, canonical_url: "https://teyel.example/", page_title: extra.title || "TEYEL", page_description: "Giyim, ayakkabı ve takı. Önce teyel, sonra dikiş.", content_for_header: "", current_page: 1,
    recommendations: { performed: true, products_count: 4, products: extra.related || [] }, ...extra,
  };
  currentScope = scope;
  engine.options.globals = scope;
  const t = JSON.parse(read(`templates/${template}.json`));
  let body = "";
  for (const id of t.order) body += await renderSection(id, t.sections[id], scope);
  let html = await engine.render(engine.parse(read("layout/theme.liquid")), { ...scope, content_for_layout: body });
  html = html.replaceAll('href="/pages/kvkk-aydinlatma-metni"', 'href="kvkk.html"').replaceAll('href="/pages/iletisim"', 'href="iletisim.html"');
  html = html.replace("</head>", `<base href="./"><script>window.__preview=true;</script></head>`);
  fs.writeFileSync(path.join(OUT, file), html);
  console.log("ok", file, (html.length / 1024).toFixed(0) + "kB");
}

fs.mkdirSync(path.join(OUT, "assets"), { recursive: true });
for (const f of fs.readdirSync(path.join(THEME, "assets"))) fs.copyFileSync(path.join(THEME, "assets", f), path.join(OUT, "assets", f));
await page("anasayfa.html", "index");
for (const h of PAGES) { const p = bySlug[h]; await page(`urun-${h}.html`, "product", { product: p, title: p.title, related: collections["cok-satanlar"].products.filter((x) => x !== p).slice(0, 4) }); }
await page("koleksiyon.html", "collection", { collection: collections["giyim"], title: "Giyim" });
await page("drop.html", "collection.drop", { collection: collections["drop-01-mavi-teyel"], title: "Drop 01" });
const C = (f) => fs.readFileSync(path.join(process.env.PAGES_DIR || path.join(EX, "sayfa-metinleri"), `${f}.html`), "utf8");
await page("hakkimizda.html", "page.about", { page: { title: "Atölye", content: C("hakkimizda") }, title: "Atölye" });
await page("sss.html", "page.faq", { page: { title: "Sık sorulan sorular" }, title: "Sık sorulan sorular" });
await page("iletisim.html", "page.contact", { page: { title: "Bize yaz" }, title: "İletişim" });
for (const [f, slug, t] of [["kvkk.html", "kvkk-aydinlatma-metni", "KVKK aydınlatma metni"], ["cerez.html", "cerez-politikasi", "Çerez politikası"], ["mesafeli-satis.html", "mesafeli-satis-sozlesmesi", "Mesafeli satış sözleşmesi"], ["iade-kargo.html", "iade-ve-kargo", "Kargo ve iade"]])
  await page(f, "page.legal", { page: { title: t, content: C(slug) }, title: t });
await page("sepet.html", "cart", { title: "Sepet" });
await page("favoriler.html", "page.wishlist", { page: { title: "Favorilerin" }, title: "Favoriler" });
await page("giris.html", "customers/login", { title: "Giriş yap" });
await page("404.html", "404", { title: "Sayfa bulunamadı" });
const art = (t, img, ex, d) => ({ title: t, url: "lookbook.html", image: IMG(img, t, 1500, 848), excerpt: ex, published_at: d });
await page("lookbook.html", "blog", { blog: { title: "Lookbook", url: "lookbook.html", articles: [
  art("Ara katman: kış 26", "hero.jpg", "Ceketin altı, kazağın üstü. Bu sezon aradaki katmana bakıyoruz.", "2026-11-02"),
  art("Gümüşü her gün takmak", "taki.jpg", "Zincir, mühür ve ince halka. Üç parçayla kurulan bir takı dolabı.", "2026-10-18"),
  art("Drop 01: Mavi teyel", "drop.jpg", "Kobalt ipliğin hikâyesi ve sınırlı üretilen altı parça.", "2026-09-27"),
] }, title: "Lookbook" });
if (missing.size) console.log("EKSİK ÇEVİRİ:", [...missing].join(", "));
