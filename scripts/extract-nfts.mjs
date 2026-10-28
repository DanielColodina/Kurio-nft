import path from 'node:path'
import { mkdir, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const source = 'C:/Users/danie/OneDrive/Área de Trabalho/Jungle/Frontend Challenge/Desktop/Início.png'
const output = path.resolve('public/assets/nfts')
const crops = [
  { id: 'emerald-ape-042', name: 'Emerald Ape #042', left: 480, top: 724 },
  { id: 'sage-nomad-009', name: 'Sage Nomad #009', left: 774, top: 724 },
  { id: 'neon-vessel-552', name: 'Neon Vessel #552', left: 1067, top: 724 },
  { id: 'cosmic-bloom-118', name: 'Cosmic Bloom #118', left: 480, top: 1129 },
  { id: 'violet-nomad-314', name: 'Violet Nomad #314', left: 774, top: 1129 },
  { id: 'ivory-baron-088', name: 'Ivory Baron #088', left: 1067, top: 1129 },
  { id: 'golden-beat-207', name: 'Golden Beat #207', left: 480, top: 1533 },
  { id: 'golden-signal-160', name: 'Golden Signal #160', left: 1067, top: 1533 },
]

await mkdir(output, { recursive: true })
for (const crop of crops) {
  await sharp(source)
    .extract({ left: crop.left, top: crop.top, width: 252, height: 252 })
    .resize(720, 720, { kernel: sharp.kernel.lanczos3 })
    .webp({ quality: 94 })
    .toFile(path.join(output, `${crop.id}.webp`))
}
await writeFile(path.join(output, 'manifest.json'), JSON.stringify(crops.map(({ id, name }) => ({ id, name, src: `/assets/nfts/${id}.webp`, source })), null, 2))
console.log(`Extracted ${crops.length} NFT assets to ${output}`)
