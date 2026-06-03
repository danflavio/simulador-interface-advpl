/**
 * Script para gerar og-image.png a partir do og-image.svg
 * 
 * Requer: npm install sharp
 * Uso: node scripts/generate-og-image.js
 * 
 * Para ambientes sem 'sharp', use qualquer conversor SVG->PNG online
 * ou ferramentas como Inkscape CLI:
 *   inkscape --export-type=png --export-filename=public/og-image.png --export-width=1200 public/og-image.svg
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

async function main() {
  try {
    const sharp = (await import('sharp')).default;
    
    const svgPath = resolve(rootDir, 'public', 'og-image.svg');
    const pngPath = resolve(rootDir, 'public', 'og-image.png');
    
    const svgBuffer = readFileSync(svgPath);
    
    await sharp(svgBuffer)
      .resize(1200, 630)
      .png({ quality: 90 })
      .toFile(pngPath);
    
    console.log('✔ og-image.png gerado com sucesso em public/og-image.png');
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND' || err.message?.includes('Cannot find')) {
      console.log('⚠ Módulo "sharp" não instalado.');
      console.log('  Para gerar o PNG, instale com: npm install -D sharp');
      console.log('  Ou converta manualmente o SVG em public/og-image.svg para PNG (1200x630).');
    } else {
      console.error('Erro:', err.message);
    }
  }
}

main();
