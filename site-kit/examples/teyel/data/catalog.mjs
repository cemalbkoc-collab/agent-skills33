// TEYEL demo kataloğu. Tek kaynak: önizleme, Shopify CSV ve rehber buradan üretilir.
const C = {
  kirik: ["Kırık Beyaz", "#ECE8DF"], lacivert: ["Lacivert", "#1B2440"], tas: ["Taş Grisi", "#A9ABA8"],
  kobalt: ["Kobalt", "#2947D6"], siyah: ["Siyah", "#1A1B1D"], antrasit: ["Antrasit", "#3A3D42"],
  gri: ["Gri Melanj", "#9A9EA3"], indigo: ["Ham İndigo", "#2C3A5C"], kum: ["Kum", "#CFC4B0"],
  gumus: ["Gümüş", "#C9CDD1"], altin: ["Altın", "#D4B26A"], oksit: ["Oksitli Gümüş", "#4A4C50"],
  roz: ["Roz Altın", "#D9A893"], inci: ["İnci", "#EFEDE6"], koyugri: ["Koyu Gri", "#5A5D61"],
};
const SIZES = {
  ust: ["XS", "S", "M", "L", "XL", "XXL"], alt: ["28", "30", "32", "34", "36", "38"],
  ayakkabi: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
  yuzuk: ["10", "12", "14", "16", "18", "20", "22"], bilezik: ["S", "M", "L"],
  kolye: ["45 cm", "50 cm", "60 cm"], sapka: ["S/M", "L/XL"], tek: ["Tek Beden"],
};
const CARE = {
  giyim: "30°C'de ters çevirip yıka. Ağartıcı kullanma. Kurutma makinesine atma.",
  ayakkabi: "Nemli bezle sil. Makinede yıkama. Gölgede, kendi hâlinde kurut.",
  taki: "Parfüm ve deniz suyundan uzak tut. Kuru, yumuşak bezle sil. Kutusunda sakla.",
  aksesuar: "Nemli bezle sil ya da 30°C'de elde yıka. Gölgede kurut.",
};
export const groups = [
  { handle: "giyim", title: "Giyim" }, { handle: "ayakkabi", title: "Ayakkabı" }, { handle: "taki-aksesuar", title: "Takı ve Aksesuar" },
];
export const categories = [
  { key: "tisort", handle: "tisort", title: "Tişört", group: "giyim", size: "ust", care: "giyim" },
  { key: "kazak", handle: "kazak", title: "Kazak", group: "giyim", size: "ust", care: "giyim" },
  { key: "sweat", handle: "sweatshirt", title: "Sweatshirt", group: "giyim", size: "ust", care: "giyim" },
  { key: "pantolon", handle: "pantolon", title: "Pantolon", group: "giyim", size: "alt", care: "giyim" },
  { key: "esofman", handle: "esofman-takimi", title: "Eşofman Takımı", group: "giyim", size: "ust", care: "giyim" },
  { key: "ceket", handle: "ceket", title: "Ceket", group: "giyim", size: "ust", care: "giyim" },
  { key: "sneaker", handle: "sneaker", title: "Sneaker", group: "ayakkabi", size: "ayakkabi", care: "ayakkabi" },
  { key: "bot", handle: "bot", title: "Bot", group: "ayakkabi", size: "ayakkabi", care: "ayakkabi" },
  { key: "gunluk", handle: "gunluk-ayakkabi", title: "Günlük Ayakkabı", group: "ayakkabi", size: "ayakkabi", care: "ayakkabi" },
  { key: "bilezik", handle: "bilezik", title: "Bilezik", group: "taki-aksesuar", size: "bilezik", care: "taki" },
  { key: "kolye", handle: "kolye", title: "Kolye", group: "taki-aksesuar", size: "kolye", care: "taki" },
  { key: "yuzuk", handle: "yuzuk", title: "Yüzük", group: "taki-aksesuar", size: "yuzuk", care: "taki" },
  { key: "sapka", handle: "sapka", title: "Şapka", group: "taki-aksesuar", size: "sapka", care: "aksesuar" },
  { key: "canta", handle: "canta", title: "Çanta", group: "taki-aksesuar", size: "tek", care: "aksesuar" },
];
// [kategori, görsel no | "v", ad, fiyat, indirimli fiyat | 0, renk(ler), malzeme, açıklama, etiketler]
const R = [
  ["tisort", 1, "Pens Tişört", 890, 0, "kirik", "%100 pamuk, 240 g/m² süprem", "Kutu kesim, kalın yaka. Yıkadıkça yumuşar, formunu bırakmaz.", "cok-satan"],
  ["tisort", 2, "Biye Tişört", 890, 690, "lacivert", "%100 pamuk, 240 g/m² süprem", "Yakası biyeli, omzu düşük. Her gün giymek için dikildi.", ""],
  ["tisort", 3, "Verev Oversize Tişört", 990, 0, "gri", "%100 pamuk, 260 g/m², yıkamalı", "Bol kalıp, yıkanmış doku. İlk günden eskimiş gibi rahat.", "yeni"],
  ["tisort", 4, "Fitil Uzun Kollu", 1090, 0, "kobalt", "%100 pamuk, iplik boyalı çizgi", "Kobalt çizgi boyanmaz, dokunur. Solmaz, kaymaz.", "drop yeni"],
  ["tisort", "v", "Düz Dikiş Tişört", 790, 0, "kirik lacivert tas kobalt", "%100 organik pamuk, 200 g/m²", "Dolabın temeli. Dört renk, tek kalıp, sıfır süs.", "cok-satan"],
  ["kazak", 1, "Reçme Balıkçı Yaka Kazak", 2490, 0, "kirik", "%80 yün, %20 poliamid, kalın saç örgü", "Kalın saç örgü, yüksek yaka. Kaban istemeyen günler için.", "sezon yeni"],
  ["kazak", 2, "Nervür Kazak", 2190, 1690, "lacivert", "%100 pamuk, fitilli örgü", "Fitilli örgü vücuda oturur, sarmaz. Gömlek üstüne de olur.", "sezon"],
  ["kazak", 3, "Çima Hırka", 2690, 0, "tas", "%70 yün, %30 alpaka", "Beş düğme, yumuşak omuz. Ceket yerine geçer.", "sezon"],
  ["kazak", 4, "Masura Yelek", 1790, 0, "kobalt", "%100 merinos yünü", "Kobalt örme yelek. Tişörtün üstüne, ceketin altına.", "drop"],
  ["kazak", "v", "İlmek Kazak", 1990, 0, "kirik lacivert tas kobalt", "%100 ince merinos yünü", "İnce merinos, bisiklet yaka. Kaşındırmaz, terletmez.", "cok-satan sezon"],
  ["sweat", 1, "Astar Kapüşonlu", 1890, 0, "tas", "%100 pamuk, 420 g/m² üç iplik", "Ağır kumaş, çift kat kapüşon. İpi yok, sallanmaz.", "cok-satan"],
  ["sweat", 2, "Tela Sweatshirt", 1590, 0, "kirik", "%100 pamuk, 380 g/m² üç iplik", "Bisiklet yaka, geniş ribana. Sade, ağır, dayanıklı.", ""],
  ["sweat", 3, "Patlet Yarım Fermuarlı", 1990, 1490, "lacivert", "%100 pamuk, metal fermuar", "Dik yaka, yarım fermuar. Açık da kapalı da iyi durur.", ""],
  ["sweat", 4, "Kopça Fermuarlı Kapüşonlu", 2090, 0, "antrasit", "%100 pamuk, 420 g/m², çift yönlü fermuar", "Çift yönlü fermuar, gizli cep. Katman olarak çalışır.", "yeni"],
  ["sweat", "v", "Kanca Kapüşonlu", 1690, 0, "kirik lacivert tas kobalt", "%100 pamuk, 360 g/m² üç iplik", "Klasik kanguru cep, tok kumaş. Dört renkte.", ""],
  ["pantolon", 1, "Pili Pantolon", 2290, 0, "kum", "%64 polyester, %34 viskon, %2 elastan", "Çift pili, geniş paça. Yürürken dökülür.", "cok-satan sezon"],
  ["pantolon", 2, "Paça Kargo", 2490, 0, "koyugri", "%100 pamuk ripstop", "Yan cepler körüklü, paça ayarlı. Dolu cep sarkmaz.", "yeni"],
  ["pantolon", 3, "Regola Denim", 2790, 0, "indigo", "%100 pamuk, 14 oz ham denim", "Ham indigo, düz kesim. İlk altı ay yıkama, sana göre şekil alsın.", ""],
  ["pantolon", 4, "Kırma Chino", 1990, 1590, "lacivert", "%98 pamuk, %2 elastan gabardin", "Düz kalıp, kırma cep. Ofise de hafta sonuna da gider.", ""],
  ["pantolon", "v", "Düz Paça Pantolon", 1890, 0, "kirik lacivert tas siyah", "%100 pamuk gabardin", "Bel oturur, paça düz iner. Dört renk, tek kalıp.", ""],
  ["esofman", 1, "Bobin Takım", 3290, 0, "gri", "%100 pamuk, 380 g/m² üç iplik", "Kapüşonlu üst, jogger alt. Ayrı da giyilir.", "cok-satan"],
  ["esofman", 2, "Lastik Takım", 2990, 2390, "lacivert", "%100 pamuk, 340 g/m² iki iplik", "Bisiklet yaka üst, dar paça alt. Hafif ve derli toplu.", ""],
  ["esofman", 3, "Fisto Takım", 3290, 0, "kirik", "%100 pamuk, 380 g/m² üç iplik", "Kırık beyaz takım. Evde de dışarıda da temiz durur.", "yeni"],
  ["esofman", 4, "Rigalin Teknik Takım", 3790, 0, "siyah", "%100 geri dönüştürülmüş naylon, file astar", "Su itici naylon, fermuarlı ceket. Yağmurda da çalışır.", ""],
  ["esofman", "v", "Makara Takım", 3090, 0, "kirik lacivert tas kobalt", "%100 pamuk, 360 g/m² üç iplik", "Fermuarlı üst, düz paça alt. Dört renkte takım.", ""],
  ["ceket", 1, "Kalıp Ceket", 3990, 0, "lacivert", "%100 pamuk kanvas, 12 oz", "Atölye ceketi: üç yama cep, tok kanvas. Yıllandıkça güzelleşir.", "cok-satan sezon yeni"],
  ["ceket", 2, "Makas Bomber", 4490, 0, "siyah", "%100 naylon, hafif elyaf dolgu", "Kısa boy, ribanalı bel. Rüzgârı keser, hacim yapmaz.", ""],
  ["ceket", 3, "Mezura Kaban", 6990, 5490, "tas", "%80 yün, %20 poliamid, tam astar", "Uzun boy, düşük omuz. Takımın da kazağın da üstüne.", "sezon"],
  ["ceket", 4, "Verev Denim Ceket", 3690, 0, "indigo", "%100 pamuk, 13 oz denim", "Klasik kesim, metal düğme. Regola Denim ile takım olur.", ""],
  ["ceket", "v", "Çift Cep Ceket", 3290, 0, "kirik lacivert tas siyah", "%100 pamuk gabardin", "Gömlek gibi giyilir, ceket gibi durur. Dört renk.", "yeni"],
  ["sneaker", 1, "Punteriz Low", 3490, 0, "kirik", "Tam damla deri saya, kauçuk taban", "Düz beyaz deri, dikişli taban. Her şeyle gider.", "cok-satan"],
  ["sneaker", 2, "Zincir Runner", 3990, 0, "gri", "Süet ve file saya, EVA ara taban", "Gri süet, kobalt taban. Uzun yürüyüş için yumuşak.", "drop yeni"],
  ["sneaker", 3, "Overlok High", 2990, 2290, "siyah", "Pamuk kanvas saya, vulkanize taban", "Bilekli kanvas. Yıprandıkça karakter kazanır.", ""],
  ["sneaker", 4, "Sürfile Court", 3290, 0, "kirik", "Deri saya, lacivert topuk, kauçuk taban", "Kort tipi, lacivert topuk detayı. Sade ama fark edilir.", ""],
  ["sneaker", "v", "Kanvas Low", 1990, 0, "kirik lacivert tas kobalt", "Pamuk kanvas saya, kauçuk taban", "Hafif kanvas, düz taban. Dört renkte yazlık.", ""],
  ["bot", 1, "Agraf Chelsea", 5490, 0, "siyah", "Tam damla deri, deri astar, kauçuk taban", "Yandan lastikli, bağcıksız. On saniyede giyilir.", "cok-satan sezon"],
  ["bot", 2, "Kopça Bağcıklı Bot", 5990, 0, "siyah", "Mat deri, dikişli kösele taban", "Dikişli taban, yenilenebilir. Uzun yıllar için.", "sezon"],
  ["bot", 3, "Çıtçıt Süet Bot", 4990, 3990, "tas", "Süet saya, kauçuk taban", "Bilek boyu süet. Kumaş pantolonla en iyi hâlinde.", ""],
  ["bot", 4, "Pervaz Kalın Taban Bot", 6490, 0, "siyah", "Deri saya, dişli kauçuk taban", "Dişli kalın taban. Yağmurda, çamurda kaymaz.", "yeni"],
  ["bot", "v", "Krep Bot", 4490, 0, "kum lacivert tas siyah", "Süet saya, krep taban", "Krep taban sessiz ve yumuşak. Dört renk süet.", ""],
  ["gunluk", 1, "İlik Loafer", 3990, 0, "siyah", "Deri saya, deri taban", "Klasik maskaret. Çorapla da çorapsız da.", "cok-satan"],
  ["gunluk", 2, "Manşet Derby", 4290, 0, "siyah", "Deri saya, kauçuk taban", "Dört delik bağcık, yuvarlak burun. Ofisin sneaker'ı.", ""],
  ["gunluk", 3, "Bant Slip-on", 1990, 1490, "lacivert", "Pamuk kanvas saya, vulkanize taban", "Bağcıksız kanvas. Ayağına geçir, çık.", ""],
  ["gunluk", 4, "Koltuk Sabo", 2490, 0, "gri", "Süet saya, mantar iç taban", "Arkası açık süet. Evden atölyeye, atölyeden kahveye.", "yeni"],
  ["gunluk", "v", "Süet Loafer", 3290, 0, "kum lacivert tas siyah", "Süet saya, esnek kauçuk taban", "Astarsız, yumuşak süet. Dört renk.", ""],
  ["bilezik", 1, "Zincir Bilezik", 1290, 0, "gumus", "925 ayar gümüş", "Kalın halka zincir. Tek başına yeter.", "cok-satan"],
  ["bilezik", 2, "İlik Kelepçe", 1490, 0, "gumus", "925 ayar gümüş, el dövmesi", "Açık uçlu kelepçe. Bileğine göre hafifçe ayarlanır.", ""],
  ["bilezik", 3, "Fitil Örgü Bilezik", 690, 490, "lacivert", "Mumlu pamuk ip, 925 ayar gümüş kilit", "Örgü ip, gümüş kilit. Saatin yanına yakışır.", "drop"],
  ["bilezik", 4, "Punto Bilezik", 1190, 0, "gumus", "925 ayar gümüş bilye, çelik tel", "Gümüş bilyeler, tek sıra. Hafif ve sessiz.", "yeni"],
  ["bilezik", "v", "İplik Bilezik", 590, 0, "kirik lacivert tas kobalt", "Örgü pamuk ip, 925 ayar gümüş kilit", "Atölyedeki ipliklerden. Dört renkte.", ""],
  ["kolye", 1, "Teyel Kolye", 1590, 0, "gumus", "925 ayar gümüş", "Halkaları teyel dikişi gibi kesik kesik. Markanın imzası.", "cok-satan yeni"],
  ["kolye", 2, "İğne Kolye", 1390, 0, "gumus", "925 ayar gümüş, ince zincir", "İnce zincir, iğne formunda uç. Sade bir çizgi.", ""],
  ["kolye", 3, "Düğme Kolye", 1690, 1290, "gumus", "925 ayar gümüş", "Dört delikli düğme madalyon. Yakından bakan anlar.", ""],
  ["kolye", 4, "Masura Kolye", 1890, 0, "inci", "Tatlı su incisi, 925 ayar gümüş kilit", "Küçük tatlı su incileri. Tişörtle giy, ciddiyetini al.", ""],
  ["kolye", "v", "Çubuk Kolye", 1190, 0, "gumus altin oksit roz", "925 ayar gümüş, 18 ayar altın kaplama seçenekli", "İnce zincir, yatay çubuk. Dört metal tonu.", ""],
  ["yuzuk", 1, "Yüksük Yüzük", 990, 0, "gumus", "925 ayar gümüş", "Terzi yüksüğünün dokusuyla. Geniş ve tok.", "yeni"],
  ["yuzuk", 2, "İlik Yüzük", 890, 0, "gumus", "925 ayar gümüş", "Açık uçlu ince halka. Yarım ölçü oynar.", ""],
  ["yuzuk", 3, "Mühür Yüzük", 1490, 1190, "gumus", "925 ayar gümüş, dolu döküm", "Düz yüzeyli mühür. İstersen üstüne harf kazıtırsın.", "cok-satan"],
  ["yuzuk", 4, "Çift Dikiş Yüzük", 1090, 0, "gumus", "925 ayar gümüş, iki halka", "İki ince halka, birlikte ya da ayrı takılır.", ""],
  ["yuzuk", "v", "Düz Halka Yüzük", 790, 0, "gumus altin oksit roz", "925 ayar gümüş, 18 ayar altın kaplama seçenekli", "Yuvarlak kesit düz halka. Dört metal tonu.", ""],
  ["sapka", 1, "Siper Şapka", 790, 0, "lacivert", "%100 pamuk gabardin, metal toka", "Altı panel, kavisli siper. Arkadan ayarlanır.", "drop cok-satan"],
  ["sapka", 2, "Reçme Bere", 590, 450, "tas", "%100 merinos yünü, fitilli örgü", "Çift kat kıvrım. Kulağı örter, kaşındırmaz.", "sezon"],
  ["sapka", 3, "Kıvrım Balıkçı Şapka", 890, 0, "kirik", "%100 pamuk kanvas", "Yumuşak kenar, katlanır. Çantada yer tutmaz.", ""],
  ["sapka", 4, "Panel Şapka", 850, 0, "siyah", "%100 pamuk kanvas, beş panel", "Beş panel, düz siper. Alçak ve sade.", "yeni"],
  ["sapka", "v", "Yumuşak Siper Şapka", 690, 0, "kirik lacivert tas kobalt", "%100 yıkanmış pamuk", "Astarsız, yıkanmış pamuk. Dört renkte.", ""],
  ["canta", 1, "Kalıp Tote", 1290, 0, "kirik", "%100 pamuk kanvas, 16 oz", "Ağır kanvas, iç cep. Kalıp kâğıdı bile sığar.", "cok-satan"],
  ["canta", 2, "Askı Çapraz Çanta", 1690, 0, "siyah", "Geri dönüştürülmüş naylon, su itici", "Ayarlı askı, iki bölme. Telefon, cüzdan, anahtar.", "yeni"],
  ["canta", 3, "Kemer Çanta", 1190, 890, "lacivert", "Geri dönüştürülmüş naylon", "Bele ya da çapraz. Eller boşta kalsın.", "drop"],
  ["canta", 4, "Atölye Sırt Çantası", 2890, 0, "siyah", "Geri dönüştürülmüş naylon, 18 L", "16 inç bilgisayar bölmesi, gizli sırt cebi.", ""],
  ["canta", "v", "Fermuarlı Tote", 1490, 0, "kirik lacivert tas kobalt", "Naylon, fermuarlı ağız, iç astar", "Fermuarı var, yağmurda açık kalmaz. Dört renk.", ""],
];
const tr = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", İ: "i", Ç: "c", Ğ: "g", Ö: "o", Ş: "s", Ü: "u", â: "a" };
export const handleize = (s) => s.replace(/[çğıöşüİÇĞÖŞÜâ]/g, (m) => tr[m]).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const catBy = Object.fromEntries(categories.map((c) => [c.key, c]));
const TAGS = { "cok-satan": "Çok Satan", yeni: "Yeni", sezon: "Kış 26", drop: "Drop 01" };

export const products = R.map(([ck, n, title, price, sale, cols, material, desc, tags]) => {
  const cat = catBy[ck];
  const handle = handleize(title);
  const colors = cols.split(" ").map((k, i) => ({ name: C[k][0], hex: C[k][1], image: `${ck}-${n === "v" ? "v" + (i + 1) : n}.jpg` }));
  const sizes = SIZES[cat.size];
  const h = hash(handle);
  const variants = [];
  colors.forEach((c, ci) => sizes.forEach((s, si) => {
    const k = (h + ci * 7 + si * 13) % 11;
    const qty = sizes.length === 1 ? 14 : k === 0 ? 0 : k === 1 ? 2 : k === 2 ? 4 : 12 + (k % 5) * 3;
    variants.push({ color: c.name, size: s, qty, image: c.image, sku: `TY-${handle.slice(0, 10).toUpperCase()}-${ci + 1}${String(si + 1).padStart(2, "0")}` });
  }));
  return {
    handle, title, cat: cat.key, type: cat.title, group: cat.group, sizeKind: cat.size,
    price: sale || price, compareAt: sale ? price : null,
    colors, sizes, variants, material, care: CARE[cat.care], desc,
    tags: tags.split(" ").filter(Boolean).map((t) => TAGS[t]),
    rating: 4.4 + (h % 6) / 10, reviews: 8 + (h % 57),
  };
});

export const collections = [
  ...groups.map((g) => ({ handle: g.handle, title: g.title, rule: (p) => p.group === g.handle, desc: "" })),
  ...categories.map((c) => ({ handle: c.handle, title: c.title, rule: (p) => p.cat === c.key, desc: "" })),
  { handle: "yeni-gelenler", title: "Yeni Gelenler", rule: (p) => p.tags.includes("Yeni"), desc: "Atölyeden bu ay çıkanlar." },
  { handle: "cok-satanlar", title: "Çok Satanlar", rule: (p) => p.tags.includes("Çok Satan"), desc: "En çok tekrar alınan parçalar." },
  { handle: "indirim", title: "İndirim", rule: (p) => !!p.compareAt, desc: "Son bedenler, sezon sonu fiyatları." },
  { handle: "kis-26", title: "Kış 26: Ara Katman", rule: (p) => p.tags.includes("Kış 26"), desc: "Ceketin altı, kazağın üstü. Bu sezon aradaki katmana bakıyoruz." },
  { handle: "drop-01-mavi-teyel", title: "Drop 01: Mavi Teyel", rule: (p) => p.tags.includes("Drop 01"), desc: "Kobalt ve lacivert, sınırlı adet. Bitince tekrarı yok." },
];
export const sizeKinds = SIZES;
