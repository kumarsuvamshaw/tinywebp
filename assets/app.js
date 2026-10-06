(function () {
  const $ = id => document.getElementById(id);
  const tool = $('tool'), from = $('from'), to = $('to'), file = $('file'), drop = $('drop'), go = $('go'), out = $('out');
  const prefix = tool.dataset.prefix, isHome = tool.dataset.home === '1', dlTxt = tool.dataset.dl;
  const FM = ['png', 'jpg', 'jpeg', 'gif', 'pdf', 'svg', 'avif', 'webp'];
  const lb = f => f === 'webp' ? 'WebP' : f === 'any' ? 'JPG / PNG / GIF…' : f.toUpperCase();
  const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', avif: 'image/avif', svg: 'image/svg+xml', pdf: 'application/pdf', any: 'image/*' };
  const fill = (sel, list) => { sel.innerHTML = list.map(f => `<option value="${f}">${lb(f)}</option>`).join(''); };
  fill(from, (isHome ? ['any'] : []).concat(FM)); fill(to, FM);
  from.value = tool.dataset.from; to.value = tool.dataset.to;
  let files = [];
  const setAccept = () => { file.accept = from.value === 'any' ? 'image/*,.avif' : MIME[from.value] + (from.value === 'jpg' || from.value === 'jpeg' ? ',image/jpeg' : ''); };
  setAccept();

  // Changing From/To opens the matching page (one side is always WebP)
  function nav(changed) {
    if (changed === 'from') { if (from.value === 'webp' && to.value === 'webp') to.value = 'png'; else if (from.value !== 'webp') to.value = 'webp'; }
    else { if (to.value === 'webp' && from.value === 'webp') from.value = 'png'; else if (to.value !== 'webp') from.value = 'webp'; }
    location.href = (from.value === 'any' ? prefix + '/' : prefix + '/' + from.value + '-to-' + to.value);
  }
  from.onchange = () => nav('from'); to.onchange = () => nav('to');
  $('lang').onchange = e => { location.href = e.target.value || '/'; };

  const pick = fl => { files = [...fl]; go.disabled = !files.length; out.innerHTML = files.map(f => `<li>${f.name}</li>`).join(''); };
  file.onchange = () => pick(file.files);
  ['dragover', 'dragenter'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('on'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('on'); }));
  drop.addEventListener('drop', e => pick(e.dataTransfer.files));

  const loadScript = src => new Promise((r, j) => { const s = document.createElement('script'); s.src = src; s.onload = r; s.onerror = j; document.head.appendChild(s); });
  const blobTo = (c, type, q) => new Promise(r => c.toBlob(r, type, q));
  const isPdf = f => f.type === 'application/pdf' || /\.pdf$/i.test(f.name);

  async function toCanvas(f, flat) {
    let c = document.createElement('canvas'), ctx;
    if (isPdf(f)) {
      if (!window.pdfjsLib) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const pg = await (await pdfjsLib.getDocument({ data: await f.arrayBuffer() }).promise).getPage(1);
      const vp = pg.getViewport({ scale: 2 }); c.width = vp.width; c.height = vp.height; ctx = c.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
      await pg.render({ canvasContext: ctx, viewport: vp }).promise; return c;
    }
    const u = URL.createObjectURL(f), img = new Image();
    await new Promise((r, j) => { img.onload = r; img.onerror = () => j(new Error('Unsupported file')); img.src = u; });
    c.width = img.naturalWidth || 1024; c.height = img.naturalHeight || 1024; ctx = c.getContext('2d');
    if (flat) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); }
    ctx.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u); return c;
  }

  function pdfBlob(jpg, w, h) {
    const e = new TextEncoder(), parts = [], off = []; let len = 0;
    const add = p => { parts.push(p); len += p.length; }, s = t => add(e.encode(t));
    const o = (n, b) => { off[n] = len; s(n + ' 0 obj\n'); b(); s('\nendobj\n'); };
    s('%PDF-1.4\n');
    o(1, () => s('<</Type/Catalog/Pages 2 0 R>>')); o(2, () => s('<</Type/Pages/Kids[3 0 R]/Count 1>>'));
    o(3, () => s(`<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${w} ${h}]/Resources<</XObject<</I 4 0 R>>>>/Contents 5 0 R>>`));
    o(4, () => { s(`<</Type/XObject/Subtype/Image/Width ${w}/Height ${h}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ${jpg.length}>>\nstream\n`); add(jpg); s('\nendstream'); });
    const cs = `q ${w} 0 0 ${h} 0 0 cm /I Do Q`; o(5, () => s(`<</Length ${cs.length}>>\nstream\n${cs}\nendstream`));
    const x = len; s('xref\n0 6\n0000000000 65535 f \n');
    for (let i = 1; i < 6; i++) s(String(off[i]).padStart(10, '0') + ' 00000 n \n');
    s(`trailer\n<</Size 6/Root 1 0 R>>\nstartxref\n${x}\n%%EOF`);
    return new Blob(parts, { type: 'application/pdf' });
  }

  async function encode(c, fmt) {
    if (fmt === 'gif') {
      const g = await import('https://cdn.jsdelivr.net/npm/gifenc@1.0.3/dist/gifenc.esm.js');
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, pal = g.quantize(d, 256), enc = g.GIFEncoder();
      enc.writeFrame(g.applyPalette(d, pal), c.width, c.height, { palette: pal }); enc.finish();
      return new Blob([enc.bytes()], { type: 'image/gif' });
    }
    if (fmt === 'pdf') { const b = await blobTo(c, 'image/jpeg', .92); return pdfBlob(new Uint8Array(await b.arrayBuffer()), c.width, c.height); }
    if (fmt === 'svg') {
      const d = c.toDataURL('image/png');
      return new Blob([`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${c.width}" height="${c.height}" viewBox="0 0 ${c.width} ${c.height}"><image width="${c.width}" height="${c.height}" xlink:href="${d}"/></svg>`], { type: 'image/svg+xml' });
    }
    const b = await blobTo(c, MIME[fmt], .85);
    if (!b || b.type !== MIME[fmt]) throw new Error(fmt.toUpperCase() + ' export is not supported by this browser');
    return b;
  }

  const kb = n => (n / 1024).toFixed(1) + ' KB';
  go.onclick = async () => {
    go.disabled = true; out.innerHTML = '';
    const fmt = to.value;
    for (const f of files) {
      const li = document.createElement('li'); out.appendChild(li); li.textContent = f.name + ' …';
      try {
        const c = await toCanvas(f, ['jpg', 'jpeg', 'pdf'].includes(fmt));
        const b = await encode(c, fmt), name = f.name.replace(/\.[^.]+$/, '') + '.' + fmt;
        const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; a.textContent = dlTxt;
        li.textContent = `${name} (${kb(f.size)} → ${kb(b.size)}) `; li.appendChild(a);
      } catch (e) { li.className = 'err'; li.textContent = f.name + ': ' + e.message; }
    }
    go.disabled = false;
  };
})();
