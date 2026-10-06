// TinyWebP static site generator: `node build.js` -> ./dist
const fs = require('fs'), path = require('path');
const BASE = 'https://tinywebp.online';
// name|home|conv|sub|drop|btn|dl|from|to|how|p1|p2|p3|ft1|ft2   ({a},{b} = formats)
const L = {
en:'English|WebP Converter|{a} to {b} Converter|Free, private and instant. Your files never leave your device.|Drop images here or click to select|Convert|Download|From|To|How to convert {a} to {b}|Select or drop your {a} files, choose the output format and press Convert. Then download your {b} files.|Conversion runs entirely in your browser, so your files stay private and nothing is uploaded. Convert many files at once.|WebP files are usually 25–35% smaller than JPG and PNG at similar quality, which makes websites faster and helps SEO.|Convert to WebP|Convert from WebP',
de:'Deutsch|WebP Konverter|{a} zu {b} Konverter|Kostenlos, privat und sofort. Deine Dateien verlassen nie dein Gerät.|Bilder hierher ziehen oder klicken|Konvertieren|Herunterladen|Von|Nach|So konvertierst du {a} zu {b}|Wähle oder ziehe deine {a}-Dateien hierher, wähle das Zielformat und klicke auf Konvertieren. Lade danach die {b}-Dateien herunter.|Die Konvertierung läuft komplett im Browser. Deine Dateien bleiben privat und nichts wird hochgeladen. Mehrere Dateien gleichzeitig möglich.|WebP-Dateien sind bei ähnlicher Qualität meist 25–35 % kleiner als JPG und PNG. Das macht Websites schneller und hilft bei SEO.|Zu WebP konvertieren|Von WebP konvertieren',
es:'Español|Convertidor WebP|Convertidor de {a} a {b}|Gratis, privado e instantáneo. Tus archivos nunca salen de tu dispositivo.|Suelta imágenes aquí o haz clic para elegir|Convertir|Descargar|De|A|Cómo convertir {a} a {b}|Selecciona o suelta tus archivos {a}, elige el formato de salida y pulsa Convertir. Después descarga tus archivos {b}.|La conversión se hace en tu navegador, así que tus archivos son privados y no se suben. Convierte varios archivos a la vez.|Los archivos WebP suelen pesar entre un 25 y un 35 % menos que JPG y PNG con calidad similar, lo que acelera tu web y ayuda al SEO.|Convertir a WebP|Convertir desde WebP',
fr:'Français|Convertisseur WebP|Convertisseur {a} en {b}|Gratuit, privé et instantané. Vos fichiers ne quittent jamais votre appareil.|Déposez des images ici ou cliquez pour choisir|Convertir|Télécharger|De|Vers|Comment convertir {a} en {b}|Sélectionnez ou déposez vos fichiers {a}, choisissez le format de sortie puis cliquez sur Convertir. Téléchargez ensuite vos fichiers {b}.|La conversion s’effectue dans votre navigateur : vos fichiers restent privés et rien n’est envoyé. Convertissez plusieurs fichiers à la fois.|Les fichiers WebP sont généralement 25 à 35 % plus légers que JPG et PNG à qualité égale, ce qui accélère votre site et aide le SEO.|Convertir en WebP|Convertir depuis WebP',
id:'Indonesia|Konverter WebP|Konverter {a} ke {b}|Gratis, privat, dan instan. File Anda tidak pernah keluar dari perangkat.|Letakkan gambar di sini atau klik untuk memilih|Konversi|Unduh|Dari|Ke|Cara mengonversi {a} ke {b}|Pilih atau letakkan file {a} Anda, pilih format keluaran, lalu tekan Konversi. Setelah itu unduh file {b} Anda.|Konversi berjalan sepenuhnya di browser, jadi file tetap privat dan tidak diunggah. Konversi banyak file sekaligus.|File WebP biasanya 25–35% lebih kecil dari JPG dan PNG dengan kualitas serupa, sehingga situs lebih cepat dan membantu SEO.|Konversi ke WebP|Konversi dari WebP',
it:'Italiano|Convertitore WebP|Convertitore da {a} a {b}|Gratuito, privato e istantaneo. I tuoi file non lasciano mai il tuo dispositivo.|Trascina qui le immagini o clicca per selezionarle|Converti|Scarica|Da|A|Come convertire {a} in {b}|Seleziona o trascina i tuoi file {a}, scegli il formato di output e premi Converti. Poi scarica i file {b}.|La conversione avviene nel browser: i file restano privati e nulla viene caricato. Converti più file contemporaneamente.|I file WebP sono in genere più leggeri del 25–35% rispetto a JPG e PNG a parità di qualità, rendendo i siti più veloci e migliorando la SEO.|Converti in WebP|Converti da WebP',
ja:'日本語|WebP変換|{a}から{b}への変換|無料・安全・即時。ファイルはお使いの端末から外に出ません。|画像をドロップ、またはクリックして選択|変換|ダウンロード|変換元|変換先|{a}を{b}に変換する方法|{a}ファイルを選択またはドロップし、出力形式を選んで「変換」を押します。その後、{b}ファイルをダウンロードしてください。|変換はすべてブラウザ内で行われ、ファイルはアップロードされません。複数ファイルを一括変換できます。|WebPは同程度の画質でJPGやPNGより通常25〜35%小さく、サイトの高速化とSEOに役立ちます。|WebPに変換|WebPから変換',
ko:'한국어|WebP 변환기|{a}를 {b}로 변환|무료, 안전, 즉시 변환. 파일이 기기 밖으로 나가지 않습니다.|이미지를 여기에 놓거나 클릭하여 선택|변환|다운로드|변환 전|변환 후|{a}를 {b}로 변환하는 방법|{a} 파일을 선택하거나 끌어다 놓고 출력 형식을 고른 뒤 변환을 누르세요. 그런 다음 {b} 파일을 다운로드하세요.|변환은 브라우저에서 모두 처리되어 파일이 업로드되지 않습니다. 여러 파일을 한 번에 변환할 수 있습니다.|WebP는 비슷한 화질에서 JPG, PNG보다 보통 25~35% 작아 웹사이트 속도와 SEO에 도움이 됩니다.|WebP로 변환|WebP에서 변환',
nl:'Nederlands|WebP Converter|{a} naar {b} Converter|Gratis, privé en direct. Je bestanden verlaten nooit je apparaat.|Sleep afbeeldingen hierheen of klik om te kiezen|Converteren|Downloaden|Van|Naar|Zo converteer je {a} naar {b}|Selecteer of sleep je {a}-bestanden, kies het uitvoerformaat en klik op Converteren. Download daarna je {b}-bestanden.|De conversie draait volledig in je browser, dus je bestanden blijven privé en er wordt niets geüpload. Converteer meerdere bestanden tegelijk.|WebP-bestanden zijn bij vergelijkbare kwaliteit meestal 25–35% kleiner dan JPG en PNG, waardoor sites sneller laden en beter scoren in SEO.|Converteren naar WebP|Converteren van WebP',
pl:'Polski|Konwerter WebP|Konwerter {a} na {b}|Za darmo, prywatnie i natychmiast. Twoje pliki nigdy nie opuszczają urządzenia.|Upuść obrazy tutaj lub kliknij, aby wybrać|Konwertuj|Pobierz|Z|Na|Jak przekonwertować {a} na {b}|Wybierz lub upuść pliki {a}, wybierz format docelowy i kliknij Konwertuj. Następnie pobierz pliki {b}.|Konwersja odbywa się w przeglądarce, więc pliki pozostają prywatne i nic nie jest wysyłane. Konwertuj wiele plików naraz.|Pliki WebP są zwykle o 25–35% mniejsze niż JPG i PNG przy podobnej jakości, co przyspiesza strony i pomaga w SEO.|Konwertuj do WebP|Konwertuj z WebP',
pt:'Português|Conversor WebP|Conversor de {a} para {b}|Grátis, privado e instantâneo. Seus arquivos nunca saem do seu dispositivo.|Solte imagens aqui ou clique para selecionar|Converter|Baixar|De|Para|Como converter {a} para {b}|Selecione ou solte seus arquivos {a}, escolha o formato de saída e clique em Converter. Depois baixe seus arquivos {b}.|A conversão acontece no seu navegador, então seus arquivos ficam privados e nada é enviado. Converta vários arquivos de uma vez.|Arquivos WebP costumam ser 25–35% menores que JPG e PNG com qualidade semelhante, deixando sites mais rápidos e ajudando no SEO.|Converter para WebP|Converter de WebP',
ru:'Русский|Конвертер WebP|Конвертер {a} в {b}|Бесплатно, приватно и мгновенно. Ваши файлы не покидают устройство.|Перетащите изображения сюда или нажмите для выбора|Конвертировать|Скачать|Из|В|Как конвертировать {a} в {b}|Выберите или перетащите файлы {a}, укажите выходной формат и нажмите «Конвертировать». Затем скачайте файлы {b}.|Конвертация выполняется прямо в браузере: файлы остаются приватными и никуда не загружаются. Можно обрабатывать сразу много файлов.|Файлы WebP обычно на 25–35% меньше JPG и PNG при схожем качестве, что ускоряет сайты и помогает SEO.|Конвертировать в WebP|Конвертировать из WebP',
tr:'Türkçe|WebP Dönüştürücü|{a} - {b} Dönüştürücü|Ücretsiz, gizli ve anında. Dosyalarınız cihazınızdan asla çıkmaz.|Görselleri buraya bırakın veya seçmek için tıklayın|Dönüştür|İndir|Kaynak|Hedef|{a} dosyası {b} formatına nasıl dönüştürülür|{a} dosyalarınızı seçin veya bırakın, çıktı formatını belirleyin ve Dönüştür\'e basın. Ardından {b} dosyalarınızı indirin.|Dönüştürme tamamen tarayıcınızda çalışır; dosyalarınız gizli kalır ve hiçbir şey yüklenmez. Birden fazla dosyayı aynı anda dönüştürün.|WebP dosyaları benzer kalitede JPG ve PNG\'den genellikle %25–35 daha küçüktür; siteleri hızlandırır ve SEO\'ya yardımcı olur.|WebP\'ye dönüştür|WebP\'den dönüştür',
uk:'Українська|Конвертер WebP|Конвертер {a} у {b}|Безкоштовно, приватно й миттєво. Ваші файли не залишають пристрій.|Перетягніть зображення сюди або натисніть для вибору|Конвертувати|Завантажити|З|У|Як конвертувати {a} у {b}|Виберіть або перетягніть файли {a}, оберіть вихідний формат і натисніть «Конвертувати». Потім завантажте файли {b}.|Конвертація відбувається у браузері: файли залишаються приватними й нікуди не завантажуються. Можна обробляти багато файлів одразу.|Файли WebP зазвичай на 25–35% менші за JPG і PNG за подібної якості, що пришвидшує сайти та допомагає SEO.|Конвертувати у WebP|Конвертувати з WebP',
vi:'Tiếng Việt|Công cụ chuyển đổi WebP|Chuyển đổi {a} sang {b}|Miễn phí, riêng tư và tức thì. Tệp của bạn không bao giờ rời khỏi thiết bị.|Thả ảnh vào đây hoặc nhấp để chọn|Chuyển đổi|Tải xuống|Từ|Sang|Cách chuyển {a} sang {b}|Chọn hoặc thả tệp {a}, chọn định dạng đầu ra rồi nhấn Chuyển đổi. Sau đó tải xuống các tệp {b}.|Quá trình chuyển đổi chạy hoàn toàn trong trình duyệt nên tệp được giữ riêng tư và không bị tải lên. Có thể chuyển nhiều tệp cùng lúc.|Tệp WebP thường nhỏ hơn JPG và PNG khoảng 25–35% với chất lượng tương đương, giúp web nhanh hơn và tốt cho SEO.|Chuyển sang WebP|Chuyển từ WebP',
zh:'中文|WebP 转换器|{a} 转 {b} 转换器|免费、私密、即时。文件不会离开您的设备。|将图片拖到此处或点击选择|转换|下载|从|转为|如何将 {a} 转换为 {b}|选择或拖入 {a} 文件，选择输出格式并点击“转换”，然后下载 {b} 文件。|转换完全在浏览器中进行，文件保持私密且不会上传。支持批量转换。|在画质相近的情况下，WebP 通常比 JPG 和 PNG 小 25–35%，可加快网站速度并有利于 SEO。|转换为 WebP|从 WebP 转换'
};
const K = 'name,home,conv,sub,drop,btn,dl,from,to,how,p1,p2,p3,ft1,ft2'.split(',');
const T = {}; for (const c in L) { const v = L[c].split('|'); T[c] = Object.fromEntries(K.map((k, i) => [k, v[i]])); }
const langs = Object.keys(L);
const F = ['png', 'jpg', 'gif', 'jpeg', 'pdf', 'svg', 'avif'];
const slugs = ['', ...F.map(f => f + '-to-webp'), ...F.map(f => 'webp-to-' + f)];
const lb = f => f === 'webp' ? 'WebP' : f.toUpperCase();
const pre = l => l === 'en' ? '' : '/' + l;
const url = (l, s) => BASE + pre(l) + (s ? '/' + s : '') || BASE;
const fill = (s, a, b) => s.replace(/\{a\}/g, a).replace(/\{b\}/g, b);
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function page(l, slug) {
  const t = T[l], home = !slug;
  const [a, , b] = home ? ['', '', ''] : slug.split('-');
  const A = home ? 'JPG, PNG, GIF' : lb(a), B = home ? 'WebP' : lb(b);
  const h1 = home ? t.home : fill(t.conv, A, B);
  const title = `${h1} – TinyWebP`;
  const desc = `${h1}. ${t.sub}`;
  const hrefl = langs.map(c => `<link rel="alternate" hreflang="${c}" href="${url(c, slug)}">`).join('\n') +
    `\n<link rel="alternate" hreflang="x-default" href="${url('en', slug)}">`;
  const opts = langs.map(c => `<option value="${pre(c)}/${slug}"${c === l ? ' selected' : ''}>${T[c].name}</option>`).join('');
  const fl = (s, txt) => `<li><a href="${pre(l)}/${s}">${txt}</a></li>`;
  const col = (h, pat) => `<div><h3>${h}</h3><ul>${F.map(f => { const s = pat(f); const [x, , y] = s.split('-'); return fl(s, fill(t.conv, lb(x), lb(y))); }).join('')}</ul></div>`;
  const ld = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'TinyWebP', url: url(l, slug), applicationCategory: 'MultimediaApplication', operatingSystem: 'Any', inLanguage: l, description: desc, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } };
  return `<!DOCTYPE html>
<html lang="${l}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url(l, slug)}">
${hrefl}
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url(l, slug)}"><meta property="og:type" content="website"><meta name="twitter:card" content="summary">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%232563eb'/%3E%3Ctext x='16' y='22' font-size='16' text-anchor='middle' fill='white' font-family='Arial' font-weight='700'%3EW%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="/assets/style.css">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head><body>
<header><div class="wrap bar"><a class="logo" href="${pre(l) || '/'}">Tiny<span>WebP</span></a>
<select id="lang" aria-label="Language">${opts}</select></div></header>
<main><section class="hero"><div class="wrap">
<h1>${esc(h1)}</h1><p class="sub">${esc(t.sub)}</p>
<div class="tool" id="tool" data-from="${home ? 'any' : a}" data-to="${home ? 'webp' : b}" data-prefix="${pre(l)}" data-dl="${esc(t.dl)}" data-home="${home ? 1 : 0}">
<div class="sels"><label>${t.from}<select id="from"></select></label><span class="arrow">→</span><label>${t.to}<select id="to"></select></label></div>
<label class="drop" id="drop"><input type="file" id="file" multiple hidden><strong>${esc(t.drop)}</strong></label>
<button id="go" class="btn" disabled>${esc(t.btn)}</button>
<ul id="out" class="out"></ul></div></div></section>
<section class="seo"><div class="wrap">
<h2>${esc(fill(t.how, A, B))}</h2>
<p>${esc(fill(t.p1, A, B))}</p><p>${esc(fill(t.p2, A, B))}</p><p>${esc(fill(t.p3, A, B))}</p>
</div></section></main>
<footer><div class="wrap"><div class="cols">${col(t.ft1, f => f + '-to-webp')}${col(t.ft2, f => 'webp-to-' + f)}</div>
<p class="copy"><a href="${pre(l) || '/'}">TinyWebP</a> · ${esc(t.home)} · © ${new Date().getFullYear()}</p></div></footer>
<script src="/assets/app.js" defer></script></body></html>`;
}

const out = path.join(__dirname, 'dist'); fs.rmSync(out, { recursive: true, force: true });
const w = (p, c) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, c); };
let sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
for (const l of langs) for (const s of slugs) {
  w(path.join(out, l === 'en' ? '' : l, s, 'index.html'), page(l, s));
  sm += `<url><loc>${url(l, s)}</loc>` + langs.map(c => `<xhtml:link rel="alternate" hreflang="${c}" href="${url(c, s)}"/>`).join('') + `<xhtml:link rel="alternate" hreflang="x-default" href="${url('en', s)}"/></url>\n`;
}
w(path.join(out, 'sitemap.xml'), sm + '</urlset>');
w(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`);
for (const f of ['style.css', 'app.js']) w(path.join(out, 'assets', f), fs.readFileSync(path.join(__dirname, f)));
console.log('Built', langs.length * slugs.length, 'pages');
