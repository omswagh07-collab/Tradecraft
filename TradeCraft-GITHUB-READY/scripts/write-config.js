const fs = require('fs');
const path = require('path');
const value = String(process.env.TRADECRAFT_API_BASE || 'PASTE_YOUR_RENDER_BACKEND_URL_HERE').trim().replace(/\/$/, '');
const out = `// Generated at build time.\nwindow.TRADECRAFT_API_BASE = ${JSON.stringify(value)};\n`;
fs.writeFileSync(path.join(__dirname, '..', 'public', 'config.js'), out);
console.log(`TradeCraft API configured as: ${value}`);
