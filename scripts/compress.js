// Generates public/artworks/sm/ — resized copies for gallery display.
// Originals in public/artworks/ are untouched.
// Usage: node scripts/compress.js

import sharp from 'sharp'
import { readdir, mkdir } from 'fs/promises'
import { join } from 'path'

const SRC  = 'public/artworks'
const DEST = 'public/artworks/sm'

await mkdir(DEST, { recursive: true })

const files = (await readdir(SRC)).filter(f => /\.(jpg|jpeg|JPG|JPEG)$/.test(f))

console.log(`Compressing ${files.length} images → ${DEST}/\n`)

for (const file of files) {
  const outName = file.toLowerCase().replace(/\.jpeg$/, '.jpg')
  await sharp(join(SRC, file))
    .resize({ width: 900, withoutEnlargement: true })
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(join(DEST, outName))
  console.log(`  ✓  ${file}  →  ${outName}`)
}

console.log('\nDone.')
