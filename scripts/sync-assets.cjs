const fs = require('fs');
const path = require('path');

if (fs.existsSync('dist/assets')) {
  // Limpiar assets antiguos para evitar acumulaciones obsoletas
  if (fs.existsSync('assets')) {
    fs.rmSync('assets', { recursive: true, force: true });
  }
  fs.mkdirSync('assets', { recursive: true });
  fs.cpSync('dist/assets', 'assets', { recursive: true });

  // Leer dist/index.html para obtener exactamente los archivos vinculados por Vite
  let distHtml = fs.readFileSync('dist/index.html', 'utf8');

  // Encontrar el bundle JavaScript principal exacto
  const jsMatch = distHtml.match(/src="(?:\.\/)?assets\/([^"]+\.js)"/);
  if (jsMatch && jsMatch[1]) {
    const mainJs = jsMatch[1];
    fs.copyFileSync(path.join('dist/assets', mainJs), path.join('assets', 'index.js'));
    console.log(`✅ assets/index.js vinculado al bundle real: ${mainJs}`);
    
    // Parchear el HTML para usar el nombre fijo y añadir cache busting
    distHtml = distHtml.replace(jsMatch[0], `src="./assets/index.js?v=${Date.now()}"`);
  }

  // Encontrar el bundle CSS principal exacto
  const cssMatch = distHtml.match(/href="(?:\.\/)?assets\/([^"]+\.css)"/);
  if (cssMatch && cssMatch[1]) {
    const mainCss = cssMatch[1];
    fs.copyFileSync(path.join('dist/assets', mainCss), path.join('assets', 'index.css'));
    console.log(`✅ assets/index.css vinculado a la hoja de estilo real: ${mainCss}`);
    
    // Parchear el HTML para usar el nombre fijo y añadir cache busting
    distHtml = distHtml.replace(cssMatch[0], `href="./assets/index.css?v=${Date.now()}"`);
  }

  // Escribir el index.html parcheado en la raíz para fácil despliegue
  fs.writeFileSync('index.html', distHtml);
  console.log('✅ index.html de raíz actualizado para producción en Hostinger');

  // Copiar robots.txt y sitemap.xml a la raíz para acceso directo
  if (fs.existsSync('public/robots.txt')) {
    fs.copyFileSync('public/robots.txt', 'robots.txt');
  }
  if (fs.existsSync('public/sitemap.xml')) {
    fs.copyFileSync('public/sitemap.xml', 'sitemap.xml');
  }

  // Copiar .htaccess optimizado para Apache/LiteSpeed
  if (fs.existsSync('public/.htaccess')) {
    fs.copyFileSync('public/.htaccess', '.htaccess');
  }
}
