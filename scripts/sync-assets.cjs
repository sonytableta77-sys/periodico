const fs = require('fs');
const path = require('path');

if (fs.existsSync('dist/assets')) {
  fs.mkdirSync('assets', { recursive: true });
  fs.cpSync('dist/assets', 'assets', { recursive: true });
  
  const files = fs.readdirSync('dist/assets');
  const mainJs = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
  if (mainJs) {
    fs.copyFileSync(path.join('dist/assets', mainJs), path.join('assets', 'index.js'));
    console.log('✅ assets/index.js actualizado para Hostinger.');
  }
  
  const mainCss = files.find(f => f.startsWith('index-') && f.endsWith('.css'));
  if (mainCss) {
    fs.copyFileSync(path.join('dist/assets', mainCss), path.join('assets', 'index.css'));
    console.log('✅ assets/index.css actualizado para Hostinger.');
  }
}
