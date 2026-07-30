/**
 * Downloads every Commons photograph listed in src/data/images.js, resizes it
 * to the widths the site actually serves, and writes WebP plus a JPEG fallback
 * into public/photos/.
 *
 * Why vendor at all: Wikimedia rate-limits third-party hotlinking aggressively.
 * During sourcing, 30 of 36 HEAD requests to upload.wikimedia.org came back 429
 * at roughly one request per second. Hotlinked images would break for readers.
 *
 * Being a good citizen about it:
 *   - identifies itself with a real User-Agent, per Wikimedia's API etiquette
 *   - one request at a time, never parallel
 *   - a deliberate pause between requests
 *   - exponential backoff on 429/503 rather than hammering
 *   - skips anything already downloaded unless --force is passed
 *
 * Run:  npm run photos          (incremental)
 *       npm run photos -- --force
 */

import { mkdir, writeFile, readFile, access } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import sharp from 'sharp'
import { ALL_PHOTOS } from '../src/data/images.js'

const OUT_DIR = 'public/photos'
const MANIFEST = 'src/data/photo-manifest.json'
const WIDTHS = [640, 1280, 1920]
const FALLBACK_WIDTH = 1280
const PAUSE_MS = 1200
const USER_AGENT =
  'SkyboundCloudReference/1.0 (educational cloud study site; local build; https://commons.wikimedia.org)'

const force = process.argv.includes('--force')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const exists = (p) =>
  access(p).then(
    () => true,
    () => false,
  )

/**
 * Commons thumbnails are addressed by width. A requested width larger than the
 * original returns 400, so try descending widths and take the first that works.
 */
function candidateUrls(remote) {
  if (!remote.includes('/thumb/') || !/\/\d+px-/.test(remote)) return [remote]
  const urls = [1920, 1280, 960].map((w) => remote.replace(/\/\d+px-/, `/${w}px-`))
  return [...new Set(urls)]
}

async function fetchBuffer(url, attempt = 0) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'image/*,*/*' },
    redirect: 'follow',
  })

  if (res.status === 429 || res.status === 503) {
    if (attempt >= 5) throw new Error(`still rate limited after ${attempt} retries`)
    const retryAfter = Number(res.headers.get('retry-after')) * 1000
    const wait = retryAfter || Math.min(60_000, 5_000 * 2 ** attempt)
    process.stdout.write(` [${res.status}, waiting ${Math.round(wait / 1000)}s]`)
    await sleep(wait)
    return fetchBuffer(url, attempt + 1)
  }

  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

async function download(photo) {
  let lastErr
  for (const url of candidateUrls(photo.remote)) {
    try {
      return await fetchBuffer(url)
    } catch (err) {
      lastErr = err
      // A 400 means that width does not exist; try the next one down.
      if (!String(err.message).includes('HTTP 400')) throw err
    }
  }
  throw lastErr ?? new Error('no candidate URL succeeded')
}

async function process_(photo, manifest) {
  const done = manifest[photo.id]
  if (!force && done) {
    const allPresent = await Promise.all(
      done.widths.map((w) => exists(path.join(OUT_DIR, `${photo.id}-${w}.webp`))),
    )
    if (allPresent.every(Boolean)) {
      console.log(`skip  ${photo.id}`)
      return false
    }
  }

  process.stdout.write(`get   ${photo.id}`)
  const buf = await download(photo)

  const base = sharp(buf, { failOn: 'none' }).rotate()
  const meta = await base.metadata()
  if (!meta.width || !meta.height) throw new Error('could not read image dimensions')

  // Never upscale — cap the ladder at the source width.
  let widths = WIDTHS.filter((w) => w <= meta.width)
  if (widths.length === 0) widths = [meta.width]

  for (const w of widths) {
    await sharp(buf, { failOn: 'none' })
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(path.join(OUT_DIR, `${photo.id}-${w}.webp`))
  }

  // JPEG fallback for anything that cannot decode WebP.
  await sharp(buf, { failOn: 'none' })
    .rotate()
    .resize({ width: Math.min(FALLBACK_WIDTH, meta.width), withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(path.join(OUT_DIR, `${photo.id}.jpg`))

  // Tiny inline placeholder so the layout does not flash empty while loading.
  const lqipBuf = await sharp(buf, { failOn: 'none' })
    .rotate()
    .resize({ width: 24 })
    .webp({ quality: 40 })
    .toBuffer()

  manifest[photo.id] = {
    widths,
    width: meta.width,
    height: meta.height,
    aspect: Number((meta.width / meta.height).toFixed(4)),
    lqip: `data:image/webp;base64,${lqipBuf.toString('base64')}`,
    source: photo.page,
    artist: photo.artist,
    licence: photo.licence,
  }

  console.log(`  ok ${meta.width}×${meta.height} → ${widths.join('/')}`)
  return true
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  let manifest = {}
  try {
    manifest = JSON.parse(await readFile(MANIFEST, 'utf8'))
  } catch {
    /* first run */
  }

  console.log(`${ALL_PHOTOS.length} photos · ${force ? 'forced refresh' : 'incremental'}\n`)

  const failed = []
  for (const photo of ALL_PHOTOS) {
    try {
      const didFetch = await process_(photo, manifest)
      if (didFetch) await sleep(PAUSE_MS)
    } catch (err) {
      console.log(`\nFAIL  ${photo.id}: ${err.message}`)
      failed.push({ id: photo.id, reason: err.message, remote: photo.remote })
    }
  }

  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')

  console.log(`\nmanifest: ${Object.keys(manifest).length} entries → ${MANIFEST}`)
  if (failed.length) {
    console.log(`\n${failed.length} failed — these render as labelled placeholders:`)
    for (const f of failed) console.log(`  ${f.id}: ${f.reason}`)
    console.log('\nRe-run to retry just the missing ones.')
  } else {
    console.log('all photos vendored')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
