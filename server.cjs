const http = require('http'), fs = require('fs'), path = require('path');
const root = __dirname;
http.createServer((q, s) => {
  // آپلود مدل جدید
  if (q.method === 'POST' && q.url === '/upload') {
    const chunks = [];
    q.on('data', c => chunks.push(c));
    q.on('end', () => {
      const buf = Buffer.concat(chunks);
      if (!buf.length || buf[0] !== 0x67) { s.statusCode = 400; s.end('bad file'); return; } // باید 'g'(glTF) باشد
      const dest = path.join(root, 'opt1.glb');
      const bak = path.join(root, 'opt1-backup-' + Date.now() + '.glb');
      if (fs.existsSync(dest)) fs.copyFileSync(dest, bak);
      fs.writeFileSync(dest, buf);
      s.end(JSON.stringify({ ok: true, size: buf.length, backup: path.basename(bak) }));
    });
    return;
  }
  let u = decodeURIComponent(q.url.split('?')[0]);
  if (u === '/') u = '/index.html';
  const fp = path.join(root, u);
  fs.readFile(fp, (e, d) => {
    if (e) { s.statusCode = 404; s.end('404'); return; }
    const ext = path.extname(fp).toLowerCase();
    const m = { '.html': 'text/html; charset=utf-8', '.glb': 'model/gltf-binary', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };
    s.setHeader('Content-Type', m[ext] || 'application/octet-stream');
    s.end(d);
  });
}).listen(8123, () => console.log('server up on http://localhost:8123'));
