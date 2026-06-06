'use client'
import { useEffect, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useContentStore, type ContentItem } from '@/store/useContentStore'
import { useUIStore } from '@/store/useUIStore'

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */

interface Zone {
  /** Left bound, 0–1 fraction of canvas width */
  x0: number
  /** Right bound, 0–1 fraction of canvas width */
  x1: number
  /** Top bound, 0–1 fraction of canvas height */
  y0: number
  /** Bottom bound, 0–1 fraction of canvas height */
  y1: number
}

interface HitRegion {
  x: number
  y: number
  w: number
  h: number
  type: string
  id: string
  label: string
  sublabel: string
}

/* ═══════════════════════════════════════════════════════════════
   ZONES (% of canvas W/H matching hero illustration regions)
═══════════════════════════════════════════════════════════════ */

const ZONES: Record<string, Zone> = {
  canopy:   { x0: 0.02, x1: 0.42, y0: 0.00, y1: 0.65 },
  branch:   { x0: 0.05, x1: 0.40, y0: 0.15, y1: 0.55 },
  roots:    { x0: 0.10, x1: 0.40, y0: 0.60, y1: 0.80 },
  sky:      { x0: 0.45, x1: 1.00, y0: 0.00, y1: 0.50 },
  skyHigh:  { x0: 0.45, x1: 1.00, y0: 0.00, y1: 0.30 },
  path:     { x0: 0.40, x1: 0.65, y0: 0.65, y1: 0.90 },
}

/* ═══════════════════════════════════════════════════════════════
   GOLDEN-RATIO SPIRAL PLACEMENT
   Deterministic: same position every render for the same index.
═══════════════════════════════════════════════════════════════ */

function goldenSpiralPos(
  index: number,
  count: number,
  zone: Zone,
  W: number,
  H: number
): { x: number; y: number } {
  const GOLDEN_ANGLE = 137.508 * (Math.PI / 180)
  const angle = index * GOLDEN_ANGLE
  const spread = Math.sqrt(index / Math.max(count, 1))

  const zW = (zone.x1 - zone.x0) * W
  const zH = (zone.y1 - zone.y0) * H
  const cx = (zone.x0 + (zone.x1 - zone.x0) * 0.5) * W
  const cy = (zone.y0 + (zone.y1 - zone.y0) * 0.5) * H
  // Use 40% of half-width/height as max radius so objects cluster naturally
  const rx = zW * 0.4
  const ry = zH * 0.4

  const x = cx + Math.cos(angle) * spread * rx
  const y = cy + Math.sin(angle) * spread * ry

  // Clamp to zone bounds with a small margin
  const margin = 12
  return {
    x: Math.max(zone.x0 * W + margin, Math.min(zone.x1 * W - margin, x)),
    y: Math.max(zone.y0 * H + margin, Math.min(zone.y1 * H - margin, y)),
  }
}

/* ═══════════════════════════════════════════════════════════════
   DRAW HELPERS
═══════════════════════════════════════════════════════════════ */

/** Draw a 5-petal blossom centred at (cx, cy) */
function drawBlossom(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string,
  rotation = 0
) {
  for (let p = 0; p < 5; p++) {
    const angle = (p / 5) * Math.PI * 2 + rotation
    const px = cx + Math.cos(angle) * radius * 0.65
    const py = cy + Math.sin(angle) * radius * 0.65
    ctx.beginPath()
    ctx.ellipse(px, py, radius * 0.54, radius * 0.30, angle, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
  }
  // Centre dot
  ctx.beginPath()
  ctx.arc(cx, cy, radius * 0.20, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,242,247,0.9)'
  ctx.fill()
}

/** Draw a hanging lantern centred at (cx, cy) */
function drawLantern(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: [number, number, number],
  glowIntensity: number
) {
  const [r, g, b] = color
  // String
  ctx.beginPath()
  ctx.moveTo(cx, cy - size * 0.82)
  ctx.lineTo(cx, cy - size * 2.0)
  ctx.strokeStyle = 'rgba(170,142,72,0.4)'
  ctx.lineWidth = 0.9
  ctx.stroke()
  // Glow
  const lg = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 3)
  lg.addColorStop(0, `rgba(${r},${g},${b},${glowIntensity * 0.55})`)
  lg.addColorStop(1, `rgba(${r},${g},${b},0)`)
  ctx.fillStyle = lg
  ctx.fillRect(cx - size * 3.2, cy - size * 3.2, size * 6.4, size * 6.4)
  // Body
  ctx.beginPath()
  ctx.ellipse(cx, cy, size * 0.58, size * 0.82, 0, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(${r},${g},${b},0.90)`
  ctx.fill()
  // Inner glow
  ctx.beginPath()
  ctx.ellipse(cx, cy, size * 0.30, size * 0.42, 0, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(255,242,200,${0.5 + glowIntensity * 0.4})`
  ctx.fill()
  // Caps
  ctx.fillStyle = 'rgba(48,30,8,0.92)'
  ctx.beginPath()
  ctx.ellipse(cx, cy - size * 0.82, size * 0.48, size * 0.16, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx, cy + size * 0.82, size * 0.48, size * 0.16, 0, 0, Math.PI * 2)
  ctx.fill()
}

/** Draw a paper crane centred at (cx, cy) */
function drawCrane(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  rotation: number,
  locked: boolean
) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rotation)

  const glowColor = locked ? 'rgba(180,200,255,0.9)' : 'rgba(232,201,122,0.9)'
  const bodyColor = locked ? 'rgba(200,215,255,0.88)' : 'rgba(248,238,200,0.92)'

  // Wing body (triangle shape)
  ctx.beginPath()
  ctx.moveTo(0, -size)
  ctx.lineTo(size * 0.7, size * 0.5)
  ctx.lineTo(0, size * 0.2)
  ctx.lineTo(-size * 0.7, size * 0.5)
  ctx.closePath()
  ctx.fillStyle = bodyColor
  ctx.fill()

  // Wing vein lines
  ctx.strokeStyle = locked ? 'rgba(160,180,220,0.4)' : 'rgba(200,170,100,0.4)'
  ctx.lineWidth = 0.6
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(size * 0.7, size * 0.5); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-size * 0.7, size * 0.5); ctx.stroke()

  // Glow halo
  const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2.2)
  halo.addColorStop(0, glowColor.replace('0.9)', '0.22)'))
  halo.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.globalAlpha = 0.7
  ctx.fillStyle = halo
  ctx.beginPath(); ctx.arc(0, 0, size * 2.2, 0, Math.PI * 2); ctx.fill()
  ctx.globalAlpha = 1

  ctx.restore()
}

/** Draw a wish bud or bloom centred at (cx, cy) */
function drawWishBud(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  bloomProgress: number // 0 = full bud, 1 = full bloom
) {
  if (bloomProgress < 0.5) {
    // Green teardrop bud
    ctx.save()
    ctx.translate(cx, cy)
    ctx.beginPath()
    ctx.moveTo(0, -size * 1.3)
    ctx.bezierCurveTo(size, -size * 0.7, size * 0.85, size * 0.55, 0, size)
    ctx.bezierCurveTo(-size * 0.85, size * 0.55, -size, -size * 0.7, 0, -size * 1.3)
    ctx.fillStyle = `rgba(185,240,155,${0.7 + bloomProgress * 0.3})`
    ctx.fill()
    ctx.restore()
  } else {
    // Full blossom (warm cream — completed wish)
    drawBlossom(ctx, cx, cy, size * 1.4, 'rgba(248,234,208,0.92)')
  }
  // Stem
  ctx.beginPath()
  ctx.moveTo(cx, cy + size)
  ctx.lineTo(cx, cy + size * 2.5)
  ctx.strokeStyle = 'rgba(100,168,72,0.5)'
  ctx.lineWidth = 1
  ctx.stroke()
}

/** Draw a 4-pointed star at (cx, cy) */
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  brightness: number,
  twinkle: number
) {
  const r = radius * (0.8 + twinkle * 0.2)
  const color = `rgba(255,240,180,${brightness})`
  ctx.save()
  ctx.translate(cx, cy)

  // 4-pointed star using two overlapping triangles
  ctx.beginPath()
  ctx.moveTo(0, -r)
  ctx.lineTo(r * 0.25, -r * 0.25)
  ctx.lineTo(r, 0)
  ctx.lineTo(r * 0.25, r * 0.25)
  ctx.lineTo(0, r)
  ctx.lineTo(-r * 0.25, r * 0.25)
  ctx.lineTo(-r, 0)
  ctx.lineTo(-r * 0.25, -r * 0.25)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()

  // Soft outer glow
  if (brightness > 0.4) {
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 3)
    glow.addColorStop(0, `rgba(255,240,180,${brightness * 0.35})`)
    glow.addColorStop(1, 'rgba(255,240,180,0)')
    ctx.fillStyle = glow
    ctx.beginPath(); ctx.arc(0, 0, r * 3, 0, Math.PI * 2); ctx.fill()
  }

  ctx.restore()
}

/** Draw a leaf shape via bezier at (cx, cy) */
function drawLeaf(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  rotation: number,
  hueShift: number
) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rotation)

  ctx.beginPath()
  ctx.moveTo(0, -size)
  ctx.bezierCurveTo(size * 0.85, -size * 0.52, size * 0.90, size * 0.46, 0, size)
  ctx.bezierCurveTo(-size * 0.90, size * 0.46, -size * 0.85, -size * 0.52, 0, -size)

  const r = 90 + hueShift * 15
  const g = 185 - hueShift * 8
  const bl = 75 + hueShift * 10
  ctx.fillStyle = `rgba(${r},${g},${bl},0.80)`
  ctx.fill()

  // Central vein
  ctx.beginPath()
  ctx.moveTo(0, -size * 0.8)
  ctx.lineTo(0, size * 0.8)
  ctx.strokeStyle = `rgba(${r - 20},${g + 10},${bl - 20},0.35)`
  ctx.lineWidth = 0.6
  ctx.stroke()

  ctx.restore()
}

/* ═══════════════════════════════════════════════════════════════
   TREE GROWTH OVERLAY
   Draws extra branch segments + blossoms on top of the
   illustrated tree using globalCompositeOperation = 'multiply'.
═══════════════════════════════════════════════════════════════ */

function drawTreeGrowthOverlay(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  blossomCount: number,
  tick: number
) {
  const n = blossomCount

  // Growth stages
  const extraBranches =
    n < 20  ? 1 :
    n < 100 ? 2 + Math.floor((n - 20) / 26) : // 2–5
    n < 300 ? 4 + Math.floor((n - 100) / 50) : // 4–8
              6 + Math.floor(n / 100)           // 6+

  const numBranches = Math.min(extraBranches, 10)

  // Anchor to the tree in the hero image — roughly left 35% of the canvas
  const treeBaseX = W * 0.22
  const treeBaseY = H * 0.78
  const trunkTopX = W * 0.22
  const trunkTopY = H * 0.15

  const branchColor = 'rgba(80,40,20,0.4)'
  const blossomColor = 'rgba(242,168,184,0.55)'

  ctx.save()
  ctx.globalCompositeOperation = 'multiply'

  for (let i = 0; i < numBranches; i++) {
    // Deterministic start positions along the trunk
    const t_frac = 0.2 + (i / numBranches) * 0.8
    const startX = treeBaseX + (trunkTopX - treeBaseX) * t_frac
    const startY = treeBaseY + (trunkTopY - treeBaseY) * t_frac

    // Alternate left/right branches
    const side = i % 2 === 0 ? -1 : 1
    const angle = -Math.PI / 2 + side * (0.5 + (i / numBranches) * 0.4)
    const branchLen = W * 0.08 * (0.6 + Math.random() * 0.4)

    // Slow sway
    const sway = Math.sin(tick * 0.006 + i * 0.8) * 0.06

    const endX = startX + Math.cos(angle + sway) * branchLen
    const endY = startY + Math.sin(angle + sway) * branchLen

    // Branch line
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.quadraticCurveTo(
      startX + (endX - startX) * 0.5 + side * 8,
      startY + (endY - startY) * 0.5 - 10,
      endX,
      endY
    )
    ctx.strokeStyle = branchColor
    ctx.lineWidth = Math.max(1, 4 - i * 0.3)
    ctx.lineCap = 'round'
    ctx.stroke()

    // Sub-branches on mature trees
    if (n >= 100 && i < numBranches - 2) {
      const subAngle = angle + sway - side * 0.3
      const subLen = branchLen * 0.55
      const subEndX = endX + Math.cos(subAngle) * subLen
      const subEndY = endY + Math.sin(subAngle) * subLen

      ctx.beginPath()
      ctx.moveTo(endX, endY)
      ctx.lineTo(subEndX, subEndY)
      ctx.strokeStyle = branchColor
      ctx.lineWidth = 1.2
      ctx.stroke()

      // Tiny blossom at sub-branch tip
      if (n >= 50) {
        ctx.globalCompositeOperation = 'source-over'
        ctx.save()
        ctx.globalAlpha = 0.45
        drawBlossom(ctx, subEndX, subEndY, 5, blossomColor)
        ctx.restore()
        ctx.globalCompositeOperation = 'multiply'
      }
    }

    // Blossom cluster at branch tip
    ctx.globalCompositeOperation = 'source-over'
    ctx.save()
    ctx.globalAlpha = 0.5 + 0.2 * Math.sin(tick * 0.018 + i)
    drawBlossom(ctx, endX, endY, 6 + (n / 50), blossomColor)
    ctx.restore()
    ctx.globalCompositeOperation = 'multiply'
  }

  ctx.restore()
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */

export default function WorldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef(0)
  const tickRef   = useRef(0)

  // Per-frame mutable state stored in refs (not React state, avoid re-renders)
  const hitRegionsRef = useRef<HitRegion[]>([])

  // Bloom animations: key = wish id, value = start tick (or -1 if not animating)
  const bloomAniRef = useRef<Map<string, number>>(new Map())

  // Store selectors
  const blossomCount           = useAppStore((s) => s.blossomCount)
  const relationshipStartDate  = useAppStore((s) => s.relationshipStartDate)
  // Keep the latest value accessible inside the RAF closure without re-mounting the loop
  const startDateRef = useRef(relationshipStartDate)
  useEffect(() => { startDateRef.current = relationshipStartDate }, [relationshipStartDate])

  const memories  = useContentStore((s) => s.memories)
  const songs     = useContentStore((s) => s.songs)
  const poems     = useContentStore((s) => s.poems)
  const whispers  = useContentStore((s) => s.whispers)
  const letters   = useContentStore((s) => s.letters)
  const wishes    = useContentStore((s) => s.wishes)
  const places    = useContentStore((s) => s.places)
  const evenings  = useContentStore((s) => s.evenings)
  const dreams    = useContentStore((s) => s.dreams)

  const openRightPanel = useUIStore((s) => s.openRightPanel)
  const setHover       = useUIStore((s) => s.setHover)
  const toggleBloom    = useUIStore((s) => s.toggleBloom)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let W = 0, H = 0

    const resize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    /* ── Anniversary helper ─────────────────── */
    const isAnniversary = (): boolean => {
      const today = new Date()
      const start = new Date(startDateRef.current)
      return today.getMonth() === start.getMonth() && today.getDate() === start.getDate()
    }

    /* ── Animation loop ─────────────────────── */
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop)
      if (document.hidden) return

      const t = ++tickRef.current
      ctx.clearRect(0, 0, W, H)

      // Check anniversary once per frame (cheap — two date comparisons)
      const anniversary = isAnniversary()

      // Fresh hit regions each frame
      const hitRegions: HitRegion[] = []

      /* ─────────────────────────────────────────
         1. MEMORY BLOSSOMS — canopy zone
      ───────────────────────────────────────── */
      const memCount = memories.length

      // Identify the 3 most recently added memories for anniversary gold treatment.
      // We use position in the array (last 3) as a proxy for "most recent" since
      // Firestore listeners append in chronological order. If items have createdAt,
      // sort a copy to find the real 3 most recent.
      const recentMemoryIds: Set<string> = new Set()
      if (anniversary && memCount > 0) {
        const sorted = [...memories].sort((a, b) => {
          const ta = a.createdAt ? new Date(a.createdAt as string).getTime() : 0
          const tb = b.createdAt ? new Date(b.createdAt as string).getTime() : 0
          // If no createdAt, fall back to array order (index stored in id is not reliable,
          // but we at least get a stable sort)
          if (ta === tb) return memories.indexOf(b) - memories.indexOf(a)
          return tb - ta
        })
        sorted.slice(0, 3).forEach((m) => recentMemoryIds.add(m.id))
      }

      memories.forEach((mem, i) => {
        const { x, y } = goldenSpiralPos(i, memCount, ZONES.canopy, W, H)
        const bob = Math.sin(t * 0.03 + i) * 2
        const bx = x, by = y + bob

        const type = (mem.type as string) ?? 'default'
        const baseColor =
          type === 'trip'      ? '#a8d0e8' :
          type === 'milestone' ? '#e8c97a' :
          type === 'dream'     ? '#c9bfe8' :
                                 '#f2a8b8'

        // Anniversary: override the 3 most recent blossoms to gold
        const isGold = anniversary && recentMemoryIds.has(mem.id)
        const color  = isGold ? '#e8c97a' : baseColor

        const radius = 10 + (i % 3) * 1.5   // 10–13px
        // Anniversary: expand glow radius by 1.5× for gold blossoms
        const glowRadius = isGold ? radius * 2.8 * 1.5 : radius * 2.8

        // Hover glow & scale
        const isHovered = isHit(hitRegionsRef.current, bx, by, 'memory', mem.id)
        if (isHovered || isGold) {
          ctx.save()
          const glowColor = isGold ? `rgba(232,201,122,${isGold ? 0.45 : 0.33})` : `${color}55`
          const gl = ctx.createRadialGradient(bx, by, 0, bx, by, glowRadius)
          gl.addColorStop(0, glowColor)
          gl.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = gl
          ctx.beginPath(); ctx.arc(bx, by, glowRadius, 0, Math.PI * 2); ctx.fill()
          ctx.restore()
        }

        ctx.save()
        if (isHovered) ctx.scale(1.15, 1.15)  // scale around (0,0) — translate first
        drawBlossom(ctx, bx, by, radius, color + 'E0', i * 0.15)
        ctx.restore()

        const hitR = radius + 4
        hitRegions.push({
          x: bx - hitR, y: by - hitR, w: hitR * 2, h: hitR * 2,
          type: 'memory', id: mem.id,
          label: `🌸 ${(mem.title as string) ?? 'Memory'}`,
          sublabel: (mem.date as string) ? `${mem.date as string} · Click to revisit` : 'Click to revisit',
        })
      })

      /* ─────────────────────────────────────────
         2. SONG LANTERNS — branch zone
      ───────────────────────────────────────── */
      const LANTERN_MOODS: Record<string, [number, number, number]> = {
        love:       [242, 168, 184],
        comfort:    [130, 162, 255],
        dreams:     [180, 132, 255],
        milestones: [232, 201, 122],
        default:    [255, 240, 200],
      }
      const songCount = songs.length
      songs.forEach((song, i) => {
        const { x, y } = goldenSpiralPos(i, songCount, ZONES.branch, W, H)
        const sway = Math.sin(t * 0.02 + i * 1.15) * 3
        const lx = x + sway
        const ly = y
        const size = 12
        const mood = (song.mood as string) ?? 'default'
        const color = LANTERN_MOODS[mood] ?? LANTERN_MOODS.default
        const gv = 0.42 + 0.28 * Math.sin(t * 0.020 + i * 0.9)

        ctx.save()
        const isHov = isHit(hitRegionsRef.current, lx, ly, 'song', song.id)
        if (isHov) ctx.scale(1.12, 1.12) // approximate scale effect
        drawLantern(ctx, lx, ly, size * (isHov ? 1.05 : 1), color, gv)
        ctx.restore()

        const hw = 18, hh = 28
        hitRegions.push({
          x: lx - hw, y: ly - hh, w: hw * 2, h: hh * 2,
          type: 'song', id: song.id,
          label: `🏮 ${(song.title as string) ?? 'Song'}`,
          sublabel: (song.artist as string) ? `${song.artist as string} · Click to listen` : 'Click to listen',
        })
      })

      /* ─────────────────────────────────────────
         3. POEM PETALS — sky zone, low altitude
      ───────────────────────────────────────── */
      const poemCount = poems.length
      poems.forEach((poem, i) => {
        const base = goldenSpiralPos(i, poemCount, ZONES.sky, W, H)
        // Orbit slowly around its position
        const orbitR = 18
        const orbitT = t * 0.0048 + i * 0.698
        const px = base.x + Math.cos(orbitT) * orbitR
        const py = base.y + Math.sin(orbitT * 0.78) * orbitR * 0.5
        const ps = 8

        const isHov = isHit(hitRegionsRef.current, px, py, 'poem', poem.id)

        ctx.save()
        ctx.translate(px, py)
        ctx.rotate(orbitT * 0.65)
        if (isHov) {
          // Freeze rotation + scale 1.5
          ctx.setTransform(1.5, 0, 0, 1.5, px, py)
        }
        ctx.globalAlpha = 0.55 + 0.12 * Math.sin(t * 0.012 + i)
        ctx.beginPath()
        ctx.ellipse(0, 0, ps, ps * 0.38, 0, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${258 + (i % 8) * 8},55%,82%,0.9)`
        ctx.fill()
        ctx.restore()

        hitRegions.push({
          x: px - ps * 2, y: py - ps * 2, w: ps * 4, h: ps * 4,
          type: 'poem', id: poem.id,
          label: `🪷 ${(poem.title as string) ?? 'Poem'}`,
          sublabel: 'Click to read',
        })
      })

      /* ─────────────────────────────────────────
         4. WHISPER LEAVES — lower branch fringe
      ───────────────────────────────────────── */
      // Lower fringe = bottom of canopy / top of roots
      const whisperZone: Zone = { x0: 0.05, x1: 0.42, y0: 0.48, y1: 0.68 }
      const whisperCount = whispers.length
      whispers.forEach((whisper, i) => {
        const { x, y } = goldenSpiralPos(i, whisperCount, whisperZone, W, H)
        const sway = Math.sin(t * 0.008 + i) * 0.50
        const ls = 8

        const isHov = isHit(hitRegionsRef.current, x, y, 'whisper', whisper.id)
        const scale = isHov ? 1.15 : 1

        ctx.save()
        ctx.translate(x, y)
        ctx.scale(scale, scale)
        ctx.translate(-x, -y)
        ctx.globalAlpha = 0.5 + 0.1 * Math.sin(t * 0.011 + i)
        drawLeaf(ctx, x, y, ls, sway, i % 8)
        ctx.restore()

        hitRegions.push({
          x: x - ls * 2, y: y - ls * 2, w: ls * 4, h: ls * 4,
          type: 'whisper', id: whisper.id,
          label: `🍃 ${(whisper.title as string) ?? 'Whisper'}`,
          sublabel: 'Click to read',
        })
      })

      /* ─────────────────────────────────────────
         5. LETTER CRANES — mid branch zone
      ───────────────────────────────────────── */
      const craneZone: Zone = { x0: 0.05, x1: 0.40, y0: 0.15, y1: 0.45 }
      const letterCount = letters.length
      letters.forEach((letter, i) => {
        const { x, y } = goldenSpiralPos(i, letterCount, craneZone, W, H)
        const rotation = (t * 0.003 + i * 0.8) % (Math.PI * 2)
        const locked = isLetterLocked(letter)
        const cs = 10

        ctx.save()
        ctx.globalAlpha = 0.7 + 0.2 * Math.sin(t * 0.02 + i)
        drawCrane(ctx, x, y, cs, rotation, locked)
        ctx.restore()

        hitRegions.push({
          x: x - cs * 2, y: y - cs * 2, w: cs * 4, h: cs * 4,
          type: 'letter', id: letter.id,
          label: locked ? `🕊️ Sealed Letter` : `🕊️ ${(letter.title as string) ?? 'Letter'}`,
          sublabel: locked ? `Opens ${(letter.unlockDate as string) ?? 'later'}` : 'Click to open',
        })
      })

      /* ─────────────────────────────────────────
         6. WISH BUDS — near roots
      ───────────────────────────────────────── */
      const wishCount = wishes.length
      wishes.forEach((wish, i) => {
        const { x, y } = goldenSpiralPos(i, wishCount, ZONES.roots, W, H)
        const completed = !!(wish.completed as boolean)
        const budSize = 7

        // Bloom animation: track start tick
        if (completed) {
          if (!bloomAniRef.current.has(wish.id)) {
            bloomAniRef.current.set(wish.id, t)
          }
        }
        const bloomStart = bloomAniRef.current.get(wish.id)
        const bloomProgress = bloomStart !== undefined
          ? Math.min(1, (t - bloomStart) / 72) // 72 frames ≈ 1200ms @ 60fps
          : 0

        ctx.save()
        ctx.globalAlpha = 0.82
        drawWishBud(ctx, x, y, budSize, bloomProgress)
        ctx.restore()

        hitRegions.push({
          x: x - budSize * 2, y: y - budSize * 3, w: budSize * 4, h: budSize * 5,
          type: 'wish', id: wish.id,
          label: `⭐ ${(wish.text as string) ?? (wish.title as string) ?? 'Wish'}`,
          sublabel: completed ? 'Completed · Click to revisit' : 'Click to view',
        })
      })

      /* ─────────────────────────────────────────
         7. PLACE STONES — path zone
      ───────────────────────────────────────── */
      const placeCount = places.length
      places.forEach((place, i) => {
        const { x, y } = goldenSpiralPos(i, placeCount, ZONES.path, W, H)
        const isHov = isHit(hitRegionsRef.current, x, y, 'place', place.id)
        const sw = 16, sh = 10

        // Stone ellipse
        ctx.beginPath()
        ctx.ellipse(x, y, sw, sh, 0, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(180,175,200,0.7)'
        ctx.fill()
        // Stone shading
        ctx.beginPath()
        ctx.ellipse(x - 3, y - 2, sw * 0.5, sh * 0.4, -0.3, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(220,215,235,0.25)'
        ctx.fill()

        // Hover label
        if (isHov) {
          const label = (place.name as string) ?? (place.place as string) ?? 'Place'
          ctx.save()
          ctx.font = '11px Inter, sans-serif'
          ctx.fillStyle = 'rgba(232,228,248,0.92)'
          ctx.textAlign = 'center'
          ctx.fillText(label, x, y - sh - 6)
          ctx.restore()
        }

        hitRegions.push({
          x: x - sw, y: y - sh, w: sw * 2, h: sh * 2,
          type: 'place', id: place.id,
          label: `📍 ${(place.name as string) ?? (place.place as string) ?? 'Place'}`,
          sublabel: (place.country as string) ? `${place.country as string} · Click to visit` : 'Click to visit',
        })
      })

      /* ─────────────────────────────────────────
         8. EVENING STARS — sky zone, high altitude
      ───────────────────────────────────────── */
      const eveningCount = evenings.length
      evenings.forEach((evening, i) => {
        const { x, y } = goldenSpiralPos(i, eveningCount, ZONES.skyHigh, W, H)
        const watched = !!(evening.watched as boolean)
        const brightness = watched ? 1.0 : 0.4
        const twinkle = Math.sin(t * 0.015 * (1 + (i % 5) * 0.3) + i * 0.7) * 0.5 + 0.5
        const starR = 4

        drawStar(ctx, x, y, starR, brightness, twinkle)

        hitRegions.push({
          x: x - starR * 3, y: y - starR * 3, w: starR * 6, h: starR * 6,
          type: 'evening', id: evening.id,
          label: `✨ ${(evening.title as string) ?? 'Evening'}`,
          sublabel: watched ? 'Watched · Click to revisit' : 'Planned · Click to view',
        })
      })

      /* ─────────────────────────────────────────
         9. DREAM CONSTELLATIONS — sky zone, high
      ───────────────────────────────────────── */
      const dreamCount = dreams.length
      // Group dreams: each dream is a constellation node
      // Draw connecting lines between consecutive dream nodes
      if (dreamCount > 0) {
        const dreamPositions: Array<{ x: number; y: number; dream: ContentItem }> = []

        dreams.forEach((dream, i) => {
          const pos = goldenSpiralPos(i, dreamCount, ZONES.skyHigh, W, H)
          // Offset slightly from evening stars to avoid overlap
          pos.x += 20
          pos.y += 15
          dreamPositions.push({ x: pos.x, y: pos.y, dream })
        })

        // Draw constellation lines first (behind nodes)
        if (dreamCount > 1) {
          ctx.save()
          ctx.strokeStyle = 'rgba(255,240,140,0.25)'
          ctx.lineWidth = 0.8
          for (let i = 0; i < dreamPositions.length - 1; i++) {
            const a = dreamPositions[i]
            const b = dreamPositions[i + 1]
            // Only connect if reasonably close (avoid long ugly cross-screen lines)
            const dist = Math.hypot(b.x - a.x, b.y - a.y)
            if (dist < W * 0.3) {
              ctx.beginPath()
              ctx.moveTo(a.x, a.y)
              ctx.lineTo(b.x, b.y)
              ctx.stroke()
            }
          }
          ctx.restore()
        }

        // Draw dream star nodes
        dreamPositions.forEach(({ x, y, dream }, i) => {
          const goals = (dream.goals as unknown[]) ?? []
          const achieved = goals.some(
            (g) => typeof g === 'object' && g !== null && !!(g as Record<string, unknown>).completed
          )
          const nodeR = 4 + (dreamCount > 3 ? 1 : 0)
          const twinkle = Math.sin(t * 0.014 + i * 1.1) * 0.5 + 0.5
          const brightness = achieved ? 1.0 : 0.55

          if (achieved) {
            // Gold pulse for achieved goals
            const pulse = 0.15 + 0.15 * Math.sin(t * 0.04 + i)
            ctx.save()
            const glow = ctx.createRadialGradient(x, y, 0, x, y, nodeR * 5)
            glow.addColorStop(0, `rgba(232,201,122,${pulse})`)
            glow.addColorStop(1, 'rgba(232,201,122,0)')
            ctx.fillStyle = glow
            ctx.beginPath(); ctx.arc(x, y, nodeR * 5, 0, Math.PI * 2); ctx.fill()
            ctx.restore()
          }

          ctx.beginPath()
          ctx.arc(x, y, nodeR * (0.8 + twinkle * 0.3), 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,240,140,${brightness})`
          ctx.fill()

          hitRegions.push({
            x: x - nodeR * 3, y: y - nodeR * 3, w: nodeR * 6, h: nodeR * 6,
            type: 'dream', id: dream.id,
            label: `🌙 ${(dream.title as string) ?? 'Dream'}`,
            sublabel: achieved ? 'Achieved · Click to revisit' : 'Click to explore',
          })
        })
      }

      /* ─────────────────────────────────────────
         TREE GROWTH OVERLAY
      ───────────────────────────────────────── */
      drawTreeGrowthOverlay(ctx, W, H, blossomCount, t)

      /* ─────────────────────────────────────────
         ANNIVERSARY EFFECTS
         (runs after all content objects + tree
          overlay so it sits on top of everything
          except the HUD layer)
      ───────────────────────────────────────── */
      if (anniversary) {
        const cz = ZONES.canopy
        const czX0 = cz.x0 * W
        const czX1 = cz.x1 * W
        const czY0 = cz.y0 * H
        const czY1 = cz.y1 * H
        const czW  = czX1 - czX0
        const czH  = czY1 - czY0
        const czCx = czX0 + czW * 0.5
        const czCy = czY0 + czH * 0.5

        // 1. Faint golden shimmer over the canopy zone
        {
          const shimmerR = Math.max(czW, czH) * 0.7
          const grad = ctx.createRadialGradient(czCx, czCy, 0, czCx, czCy, shimmerR)
          grad.addColorStop(0, 'rgba(232,201,122,0.00)')
          grad.addColorStop(1, 'rgba(232,201,122,0.08)')
          ctx.save()
          ctx.fillStyle = grad
          ctx.fillRect(czX0, czY0, czW, czH)
          ctx.restore()
        }

        // 2. "✦ Happy Anniversary" — pulsing text near top of canopy zone
        {
          const textX  = czCx
          const textY  = czY0 + czH * 0.12
          const pulse  = 0.45 + 0.25 * Math.sin(t * 0.03)
          ctx.save()
          ctx.font      = "italic 15px 'Playfair Display', Georgia, serif"
          ctx.fillStyle = `rgba(232,201,122,${pulse * 0.7})` // spec: rgba(232,201,122,0.7) × pulse
          ctx.textAlign = 'center'
          ctx.fillText('✦ Happy Anniversary', textX, textY)
          ctx.restore()
        }
      }

      /* ─────────────────────────────────────────
         Store hit regions for mouse handlers
      ───────────────────────────────────────── */
      hitRegionsRef.current = hitRegions
    }

    loop()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [
    blossomCount,
    memories, songs, poems, whispers, letters,
    wishes, places, evenings, dreams,
    // relationshipStartDate is intentionally excluded — it flows via startDateRef
    // so the canvas loop is not re-mounted when the date changes mid-session.
  ])

  /* ─── Mouse handlers ──────────────────────── */

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    const hit = findHit(hitRegionsRef.current, mx, my)
    if (hit) {
      canvas.style.cursor = 'pointer'
      setHover({ x: e.clientX, y: e.clientY, label: hit.label, sublabel: hit.sublabel })
    } else {
      canvas.style.cursor = 'default'
      setHover(null)
    }
  }

  const handleMouseLeave = () => {
    const canvas = canvasRef.current
    if (canvas) canvas.style.cursor = 'default'
    setHover(null)
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    const hit = findHit(hitRegionsRef.current, mx, my)
    setHover(null)

    if (hit) {
      openRightPanel(hit.type as Parameters<typeof openRightPanel>[0], { id: hit.id })
    } else {
      // Empty click in canopy zone — open the bloom ring (tree navigation)
      const W = canvas.width
      const H = canvas.height
      const z = ZONES.canopy
      if (mx >= z.x0 * W && mx <= z.x1 * W && my >= z.y0 * H && my <= z.y1 * H) {
        toggleBloom()
      }
    }
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 10,
        pointerEvents: 'auto',
        display: 'block',
        background: 'transparent',
      }}
      aria-label="Sakura World — click objects to explore"
    />
  )
}

/* ═══════════════════════════════════════════════════════════════
   HIT-TEST UTILITIES
═══════════════════════════════════════════════════════════════ */

function findHit(regions: HitRegion[], mx: number, my: number): HitRegion | null {
  for (const r of regions) {
    if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
      return r
    }
  }
  return null
}

/** Used during drawing to check if something is hovered (previous frame's regions). */
function isHit(regions: HitRegion[], cx: number, cy: number, type: string, id: string): boolean {
  return regions.some(
    (r) => r.type === type && r.id === id &&
      cx >= r.x && cx <= r.x + r.w &&
      cy >= r.y && cy <= r.y + r.h
  )
}

/** Check if a letter is still locked based on unlockDate field. */
function isLetterLocked(letter: ContentItem): boolean {
  const unlockDate = letter.unlockDate as string | undefined
  if (!unlockDate) return false
  return new Date(unlockDate) > new Date()
}
