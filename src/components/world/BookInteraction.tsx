'use client'
/**
 * BookInteraction — memories escaping from a magical journal.
 *
 * KEY ARCHITECTURE:
 * BookJourney uses a FIXED anchor at exactly 50vw / 55vh (viewport centre-low).
 * The book starts visually at the artwork book position via an initial x/y offset,
 * then animates to x:0, y:0 — which is always the exact viewport centre.
 * This is the only correct way to guarantee the final position is pixel-perfect.
 *
 * Components:
 *   BookAmbient   z-12  idle shimmer/particles over the artwork book
 *   BookHitZone   z-14  transparent click overlay over the artwork book
 *   BookJourney   z-20  magic-book.png that lifts + settles at 50vw/55vh
 *   ThreadCanvas  z-21  particle threads from book → ring objects
 *   MemoryRing    z-22  organic floating PNG objects + backdrop
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useUIStore, type RightPanelType, type CreateType } from '@/store/useUIStore'
import { useContentStore, type ContentItem } from '@/store/useContentStore'

/* ─────────────────────────────────────────────────────────────────────
   LAYOUT CONSTANTS
───────────────────────────────────────────────────────────────────── */

// Physical book in the hero artwork — hit zone
const BOOK_LEFT = 24   // % from left
const BOOK_TOP  = 82   // % from top
const BOOK_W    = 10   // % viewport width
const BOOK_H    =  7   // % viewport height

// Final resting position of the opened book — viewport relative, non-negotiable
const OPEN_LEFT = 50   // vw  → left: 50%
const OPEN_TOP  = 55   // vh  → top:  55%

/* ─────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────── */

interface Pos { x: number; y: number }

// Computes how far the artwork book is from the viewport centre anchor.
// Called on the client only (uses window).
function artworkOffset(): Pos {
  const vw = window.innerWidth
  const vh = window.innerHeight
  // Centre of the artwork book in px
  const artX = vw * (BOOK_LEFT + BOOK_W / 2) / 100
  const artY = vh * (BOOK_TOP  + BOOK_H  / 2) / 100
  // Centre anchor in px
  const ancX = vw * OPEN_LEFT / 100
  const ancY = vh * OPEN_TOP  / 100
  return { x: artX - ancX, y: artY - ancY }
}

/* ─────────────────────────────────────────────────────────────────────
   ORGANIC RING POSITIONS
   Hand-tuned angles + varied radii. Not a uniform circle.
───────────────────────────────────────────────────────────────────── */

// [angle_deg_from_3oclock, radius_px]
const ORGANIC: Array<[number, number]> = [
  [  -92, 300 ],  // Poems     — top, moderate distance
  [  -42, 365 ],  // Wishes    — upper-right
  [   22, 345 ],  // Places    — right
  [  138, 295 ],  // Memories  — lower-left
  [ -155, 355 ],  // Songs     — upper far-left, separated from Poems
  [   75, 318 ],  // Letters   — lower-right
]

// MAX_RADIUS is the largest radius in ORGANIC — used to derive the mobile scale factor
const MAX_RADIUS = 365

function organicPos(i: number, scale: number): Pos {
  const [deg, r] = ORGANIC[i] ?? [-90, 320]
  const rad = (deg * Math.PI) / 180
  return { x: Math.cos(rad) * r * scale, y: Math.sin(rad) * r * 0.8 * scale }
}

// Computes how much to shrink radii so nothing overflows a narrow viewport.
// Returns 1.0 on anything ≥850 px wide (desktop/tablet), scales down below that.
function computeRingScale(vw: number): number {
  return Math.min(1, (vw * 0.43) / MAX_RADIUS)
}

/* ─────────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────────── */

interface RingItem {
  readonly type: RightPanelType
  readonly asset: string
  readonly label: string
  readonly accent: string
  readonly floatDur: number
  readonly floatAmp: number
  readonly floatDelay: number
}

const RING_ITEMS: RingItem[] = [
  { type: 'poem',   asset: '/assets/ui/letter.png',   label: 'Poems',    accent: '#c9bfe8', floatDur: 5.2, floatAmp:  9, floatDelay: 0   },
  { type: 'wish',   asset: '/assets/ui/lantern.png',  label: 'Wishes',   accent: '#a8d8a0', floatDur: 4.1, floatAmp:  6, floatDelay: 0.8 },
  { type: 'place',  asset: '/assets/ui/map.png',      label: 'Places',   accent: '#ffe890', floatDur: 6.8, floatAmp: 11, floatDelay: 1.6 },
  { type: 'memory', asset: '/assets/ui/memories.png', label: 'Memories', accent: '#f2a8b8', floatDur: 4.8, floatAmp:  7, floatDelay: 2.3 },
  { type: 'song',   asset: '/assets/ui/petal.png',    label: 'Songs',    accent: '#ffb450', floatDur: 5.9, floatAmp: 13, floatDelay: 0.4 },
  { type: 'letter', asset: '/assets/ui/letter.png',   label: 'Letters',  accent: '#d4aaff', floatDur: 3.7, floatAmp:  8, floatDelay: 1.1 },
]

/* ─────────────────────────────────────────────────────────────────────
   CONTENT PREVIEW
   Maps each ring item to its content-store collection and the field
   that best represents "what was added", so hovering a ring object
   shows the most recently saved item instead of just the type name.
───────────────────────────────────────────────────────────────────── */

const COLLECTION_KEY = {
  poem: 'poems',
  wish: 'wishes',
  place: 'places',
  memory: 'memories',
  song: 'songs',
  letter: 'letters',
} as const

const PREVIEW_FIELD = {
  poem: 'title',
  wish: 'wish',
  place: 'place',
  memory: 'title',
  song: 'title',
  letter: 'openWhen',
} as const

type PreviewableType = keyof typeof COLLECTION_KEY

function latestItem(items: ContentItem[]): ContentItem | undefined {
  if (items.length === 0) return undefined
  return [...items].sort((a, b) => {
    const aDate = typeof a.createdAt === 'string' ? a.createdAt : ''
    const bDate = typeof b.createdAt === 'string' ? b.createdAt : ''
    return bDate.localeCompare(aDate)
  })[0]
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).trimEnd()}…`
}

/* ─────────────────────────────────────────────────────────────────────
   BURST PARTICLES
───────────────────────────────────────────────────────────────────── */

interface Burst { id: number; angle: number; speed: number; size: number; color: string; delay: number }

const BURST: Burst[] = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  angle: (i / 32) * 360 + (i % 3 === 0 ? 6 : -4),
  speed: 55 + (i % 7) * 13,
  size:  2.5 + (i % 4) * 1,
  color: ['rgba(232,201,122,0.92)', 'rgba(242,168,184,0.82)', 'rgba(255,252,220,0.88)', 'rgba(201,191,232,0.75)'][i % 4],
  delay: (i % 9) * 0.05,
}))

/* ─────────────────────────────────────────────────────────────────────
   BOOK AMBIENT
   Idle magical effects sitting directly over the artwork book.
───────────────────────────────────────────────────────────────────── */

export function BookAmbient() {
  const { bloomOpen } = useUIStore()
  const [shimmer, setShimmer] = useState(false)

  useEffect(() => {
    if (bloomOpen) return
    const fire = () => {
      setShimmer(true)
      setTimeout(() => setShimmer(false), 1900)
    }
    fire()
    const id = setInterval(fire, 8000)
    return () => clearInterval(id)
  }, [bloomOpen])

  const DRIFT = [
    { ox: -22, delay: 0,   dur: 3.1 },
    { ox:   9, delay: 1.2, dur: 2.9 },
    { ox:  28, delay: 2.4, dur: 3.6 },
    { ox: -11, delay: 3.5, dur: 2.7 },
    { ox:  16, delay: 0.6, dur: 3.3 },
  ]

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: `${BOOK_LEFT + BOOK_W / 2}%`,
        top:  `${BOOK_TOP  + BOOK_H  / 2}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 12,
        pointerEvents: 'none',
        width:  `${BOOK_W}vw`,
        height: `${BOOK_H}vh`,
      }}
    >
      {/* Breathing glow */}
      <motion.div
        animate={{ opacity: [0.07, 0.18, 0.07], scale: [1, 1.07, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', inset: '-55% -38%', borderRadius: '50%',
          background: 'radial-gradient(ellipse 70% 50% at 50% 62%, rgba(232,201,122,0.32) 0%, rgba(242,168,184,0.09) 55%, transparent 100%)',
        }}
      />

      {/* Shimmer every 8 s */}
      <AnimatePresence>
        {shimmer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.65 }}
            animate={{ opacity: [0, 0.7, 0.42, 0], scale: [0.65, 1.25, 1.7, 2.1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.9, ease: 'easeOut' }}
            style={{
              position: 'absolute', inset: '-75% -55%', borderRadius: '50%', pointerEvents: 'none',
              background: 'radial-gradient(ellipse at 50% 62%, rgba(232,201,122,0.6) 0%, rgba(242,168,184,0.2) 42%, transparent 100%)',
            }}
          />
        )}
      </AnimatePresence>

      <BookSparkles />

      {DRIFT.map((p) => (
        <motion.div
          key={`d${p.ox}`}
          style={{
            position: 'absolute', bottom: '52%', left: `calc(50% + ${p.ox}px)`,
            width: 3, height: 3, borderRadius: '50%',
            background: 'rgba(232,201,122,0.72)', boxShadow: '0 0 5px 1px rgba(232,201,122,0.5)',
          }}
          animate={{ y: [0, -38, -58], opacity: [0, 0.75, 0], x: [0, p.ox * 0.18, p.ox * 0.32] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

function BookSparkles() {
  const SPARKS = [
    { x: -16, y:  -7, delay: 0,   sz: 5 },
    { x:  20, y:   5, delay: 1.5, sz: 4 },
    { x:   3, y: -13, delay: 2.9, sz: 6 },
    { x:  -9, y:  11, delay: 4.4, sz: 4 },
  ]
  return (
    <>
      {SPARKS.map((s) => (
        <motion.div
          key={`sp${s.x}${s.y}`}
          style={{ position: 'absolute', left: `calc(50% + ${s.x}px)`, top: `calc(50% + ${s.y}px)`, width: s.sz, height: s.sz, pointerEvents: 'none' }}
          animate={{ opacity: [0, 0.95, 0], scale: [0.15, 1, 0.15], rotate: [0, 45, 90] }}
          transition={{ duration: 1.1, delay: s.delay, repeat: Infinity, repeatDelay: 6.5, ease: 'easeInOut' }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,248,220,0.9)', boxShadow: '0 0 7px 2px rgba(232,201,122,0.85)', borderRadius: 1, transform: 'scaleX(0.16)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,248,220,0.9)', boxShadow: '0 0 7px 2px rgba(232,201,122,0.85)', borderRadius: 1, transform: 'scaleY(0.16)' }} />
        </motion.div>
      ))}
    </>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   BOOK HIT ZONE
   Transparent overlay precisely over the artwork book.
───────────────────────────────────────────────────────────────────── */

export function BookHitZone() {
  const { bloomOpen, toggleBloom, closeRightPanel, closeCreate } = useUIStore()
  const [hovering, setHovering] = useState(false)

  const handleClick = () => { closeRightPanel(); closeCreate(); toggleBloom() }

  return (
    <div
      style={{
        position: 'fixed',
        left: `${BOOK_LEFT}%`,
        top:  `${BOOK_TOP}%`,
        width:  `${BOOK_W}vw`,
        height: `${BOOK_H}vh`,
        zIndex: 14,
      }}
    >
      <button
        onClick={handleClick}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        aria-label={bloomOpen ? 'Close our story' : 'Open our story'}
        aria-expanded={bloomOpen}
        style={{
          width: '100%', height: '100%', background: 'transparent',
          border: 'none', cursor: bloomOpen ? 'default' : 'pointer', outline: 'none',
        }}
      />

      {/* Hover glow */}
      <motion.div
        aria-hidden="true"
        animate={{ opacity: hovering && !bloomOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute', inset: '-45% -38%', borderRadius: '50%', zIndex: -1, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 65% 50% at 50% 62%, rgba(232,201,122,0.35) 0%, rgba(242,168,184,0.12) 52%, transparent 100%)',
        }}
      />

      {/* "Open Our Story" label */}
      <AnimatePresence>
        {hovering && !bloomOpen && (
          <motion.div
            initial={{ opacity: 0, y: 9 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 7 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            style={{
              position: 'absolute', bottom: 'calc(100% + 1px)',
              left: '10%', transform: 'translateX(-50%)',
              pointerEvents: 'none', textAlign: 'center', whiteSpace: 'nowrap',
            }}
          >
            <span style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontStyle: 'italic', fontWeight: 200,
              fontSize: 'clamp(13px, 1.2vw, 13px)', letterSpacing: '0.05em',
              color: 'rgba(245,238,210,0.94)',
              textShadow: '0 0 30px rgba(232,201,122,0.85), 0 0 60px rgba(232,201,122,0.28), 0 2px 6px rgba(0,0,0,0.92)',
            }}>
              Add to our Story
            </span>
            <motion.div
              animate={{ scaleX: [0.35, 1, 0.35], opacity: [0.25, 0.65, 0.25] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ height: 1, marginTop: 5, background: 'linear-gradient(90deg, transparent, rgba(232,201,122,0.65), transparent)' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   BOOK JOURNEY
   The magic-book.png travels from the artwork to 50vw / 55vh.

   CRITICAL: The outer wrapper is FIXED at exactly left:50%, top:55%,
   transform:translate(-50%,-50%) and never moves. Only the inner
   motion.div animates x/y/scale/opacity. When x=0, y=0 the book
   is pixel-perfect at the viewport centre — no artwork offsets.
───────────────────────────────────────────────────────────────────── */

type Phase = 'idle' | 'lifting' | 'open' | 'closing'

export function BookJourney() {
  const { bloomOpen } = useUIStore()
  const [phase, setPhase] = useState<Phase>('idle')
  // Initial offset from viewport centre to artwork book (computed client-side)
  const [startOffset, setStartOffset] = useState<Pos>({ x: 0, y: 0 })
  const prevBloom = useRef(bloomOpen)

  useEffect(() => {
    const wasOpen = prevBloom.current
    prevBloom.current = bloomOpen

    if (bloomOpen && !wasOpen) {
      // Compute offset fresh each open (handles resize)
      const offset = artworkOffset()
      setStartOffset(offset)
      const t1 = setTimeout(() => setPhase('lifting'), 10)
      const t2 = setTimeout(() => setPhase('open'), 560)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }

    if (!bloomOpen && wasOpen) {
      setPhase('closing')
      const t = setTimeout(() => setPhase('idle'), 850)
      return () => clearTimeout(t)
    }
  }, [bloomOpen])

  // Per-phase animation target — x:0, y:0 = EXACTLY 50vw / 55vh
  let animTarget: { x: number; y: number; scale: number; opacity: number }
  let transitionCfg: object

  if (phase === 'open') {
    // ── Final position: dead centre of viewport ──
    animTarget   = { x: 0, y: 0, scale: 1, opacity: 1 }
    transitionCfg = { duration: 0.95, ease: [0.16, 1, 0.3, 1] }
  } else if (phase === 'lifting') {
    // Lift upward slightly from artwork position before flying
    animTarget   = { x: startOffset.x, y: startOffset.y - 40, scale: 0.7, opacity: 0.9 }
    transitionCfg = { duration: 0.45, ease: [0.4, 0, 0.2, 1] }
  } else if (phase === 'closing') {
    // Return to artwork
    animTarget   = { x: startOffset.x, y: startOffset.y, scale: 0.45, opacity: 0 }
    transitionCfg = { duration: 0.75, ease: [0.4, 0, 1, 1] }
  } else {
    animTarget   = { x: startOffset.x, y: startOffset.y, scale: 0.45, opacity: 0 }
    transitionCfg = { duration: 0 }
  }

  const isOpen = phase === 'open'

  return (
    /*
     * ANCHOR: This div never moves. It is always at exactly 50vw / 55vh.
     * The book inside uses x/y transforms to appear to come FROM the artwork.
     * z-index 24 — above the ring objects (z-22) so the book is always visible.
     */
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: '50%',
        top:  '55%',
        transform: 'translate(-50%, -50%)',
        zIndex: 24,
        pointerEvents: 'none',
        width: 0,
        height: 0,
      }}
    >
      <AnimatePresence>
        {phase !== 'idle' && (
          <motion.div
            key="book-inner"
            style={{ position: 'absolute', width: 'clamp(160px, 16vw, 240px)' }}
            transformTemplate={(_, generated) => `translate(-50%, -50%) ${generated}`}
            initial={{ x: startOffset.x, y: startOffset.y, scale: 0.45, opacity: 0 }}
            animate={animTarget}
            exit={{ x: startOffset.x, y: startOffset.y, scale: 0.45, opacity: 0, transition: { duration: 0.6 } }}
            transition={transitionCfg}
          >
            {/* magic-book.png — pure PNG, glow only */}
            <motion.div
              animate={{
                filter: isOpen
                  ? [
                      'drop-shadow(0 0 24px rgba(232,201,122,0.75)) drop-shadow(0 0 60px rgba(242,168,184,0.3)) brightness(1.08)',
                      'drop-shadow(0 0 42px rgba(232,201,122,1.0)) drop-shadow(0 0 90px rgba(242,168,184,0.5)) brightness(1.18)',
                      'drop-shadow(0 0 24px rgba(232,201,122,0.75)) drop-shadow(0 0 60px rgba(242,168,184,0.3)) brightness(1.08)',
                    ]
                  : ['drop-shadow(0 0 14px rgba(232,201,122,0.5)) brightness(0.95)'],
              }}
              transition={{ duration: isOpen ? 3 : 0.35, repeat: isOpen ? Infinity : 0, ease: 'easeInOut' }}
            >
              <Image
                src="/assets/ui/magic-book.png"
                alt="Our story"
                width={220}
                height={160}
                style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block' }}
                priority
              />
            </motion.div>

            {/* Burst particles on open */}
            <AnimatePresence>
              {isOpen && BURST.map((p) => {
                const rad = (p.angle * Math.PI) / 180
                return (
                  <motion.div
                    key={p.id}
                    initial={{ x: 0, y: 0, scale: 1, opacity: 0.9 }}
                    animate={{ x: Math.cos(rad) * p.speed, y: Math.sin(rad) * p.speed, scale: 0, opacity: 0 }}
                    transition={{ duration: 1.1 + p.delay, ease: 'easeOut', delay: p.delay }}
                    style={{
                      position: 'absolute', top: '40%', left: '50%',
                      width: p.size, height: p.size, borderRadius: '50%',
                      background: p.color, boxShadow: `0 0 ${p.size * 2.5}px ${p.color}`,
                      marginLeft: -p.size / 2, marginTop: -p.size / 2,
                      pointerEvents: 'none',
                    }}
                  />
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   THREAD CANVAS
   Particle threads from book centre → each ring object.
───────────────────────────────────────────────────────────────────── */

interface ThreadProps {
  readonly positions: Array<Pos | null>
  readonly bookX: number
  readonly bookY: number
}

function ThreadCanvas({ positions, bookX, bookY }: ThreadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef(0)
  const tickRef   = useRef(0)
  // Use refs for mutable values accessed inside the loop
  const posRef  = useRef(positions)
  const bxRef   = useRef(bookX)
  const byRef   = useRef(bookY)

  useEffect(() => { posRef.current = positions }, [positions])
  useEffect(() => { bxRef.current = bookX }, [bookX])
  useEffect(() => { byRef.current = bookY }, [bookY])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let W = 0, H = 0
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const ACCENT = [
      [201, 191, 232], [168, 216, 160], [255, 232, 144],
      [242, 168, 184], [255, 180,  80], [212, 170, 255],
    ]

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop)
      tickRef.current++
      const t = tickRef.current
      ctx.clearRect(0, 0, W, H)

      const visible = posRef.current.filter((p): p is Pos => p !== null)
      if (visible.length === 0 || bxRef.current === 0) return

      visible.forEach((pos, idx) => {
        const [r, g, b] = ACCENT[idx] ?? [232, 201, 122]
        const bx = bxRef.current
        const by = byRef.current
        const dx = pos.x - bx
        const dy = pos.y - by
        const dist = Math.hypot(dx, dy) || 1

        for (let j = 0; j < 4; j++) {
          const phase = (t * 0.008 + idx * 0.55 + j * 0.25) % 1
          const px = bx + dx * phase
          const py = by + dy * phase
          const drift = Math.sin(t * 0.04 + idx * 1.2 + j * 2.1) * 6
          const ppx = px + (-dy / dist) * drift
          const ppy = py + ( dx / dist) * drift
          const alpha = Math.min(phase * 4, 1) * Math.min((1 - phase) * 4, 1) * 0.7

          const grad = ctx.createRadialGradient(ppx, ppy, 0, ppx, ppy, 4)
          grad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`)
          grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
          ctx.beginPath()
          ctx.arc(ppx, ppy, 3.5, 0, Math.PI * 2)
          ctx.fillStyle = grad
          ctx.fill()
        }
      })
    }

    loop()
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      tabIndex={-1}
      style={{ position: 'fixed', inset: 0, zIndex: 21, pointerEvents: 'none', width: '100vw', height: '100vh' }}
    />
  )
}

/* ─────────────────────────────────────────────────────────────────────
   MEMORY RING
   Backdrop + ring objects anchored at the same 50vw/55vh point.
───────────────────────────────────────────────────────────────────── */

export default function MemoryRing() {
  const { bloomOpen, closeBloom, openCreate, createSelectorOpen, closeCreateSelector } = useUIStore()
  const content = useContentStore()

  const [objPositions, setObjPositions] = useState<Array<Pos | null>>(RING_ITEMS.map(() => null))
  const [bookScreenPos, setBookScreenPos] = useState<Pos>({ x: 0, y: 0 })
  const [ringScale, setRingScale] = useState(1)

  // Recompute scale on mount + every resize so ring always fits the viewport
  useEffect(() => {
    const update = () => setRingScale(computeRingScale(window.innerWidth))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const updatePos = useCallback((i: number, pos: Pos | null) => {
    setObjPositions((prev) => {
      const next = [...prev]
      next[i] = pos
      return next
    })
  }, [])

  // Book screen position = exactly 50vw / 55vh
  useEffect(() => {
    if (!bloomOpen) return
    const id = requestAnimationFrame(() => {
      setBookScreenPos({
        x: window.innerWidth  * OPEN_LEFT / 100,
        y: window.innerHeight * OPEN_TOP  / 100,
      })
    })
    return () => cancelAnimationFrame(id)
  }, [bloomOpen])

  const handleItemClick = useCallback((item: RingItem) => {
    if (createSelectorOpen) { closeCreateSelector(); return }
    openCreate(item.type as CreateType)
  }, [createSelectorOpen, closeCreateSelector, openCreate])

  const handleBackdrop = useCallback(() => {
    if (createSelectorOpen) { closeCreateSelector(); return }
    closeBloom()
  }, [createSelectorOpen, closeCreateSelector, closeBloom])

  useEffect(() => {
    if (!bloomOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (createSelectorOpen) closeCreateSelector()
        else closeBloom()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [bloomOpen, createSelectorOpen, closeBloom, closeCreateSelector])

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {bloomOpen && (
          <motion.div
            key="bloom-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.65 }}
            onClick={handleBackdrop}
            aria-hidden="true"
            style={{
              position: 'fixed', inset: 0, zIndex: 18,
              background: 'rgba(2,1,10,0.62)',
              backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Thread canvas */}
      <AnimatePresence>
        {bloomOpen && (
          <motion.div
            key="threads"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.85 }}
          >
            <ThreadCanvas positions={objPositions} bookX={bookScreenPos.x} bookY={bookScreenPos.y} />
          </motion.div>
        )}
      </AnimatePresence>

      {/*
       * RING ANCHOR — same fixed point as BookJourney: 50vw / 55vh.
       * Objects radiate outward via x/y offsets from this origin.
       */}
      <AnimatePresence>
        {bloomOpen && (
          <div
            key="bloom-ring"
            style={{
              position: 'fixed',
              left: '50%',
              top:  '55%',
              transform: 'translate(-50%, -50%)',
              zIndex: 22,
              pointerEvents: 'none',
              width: 0,
              height: 0,
              overflow: 'visible',   // ensure children outside 0×0 box are painted
            }}
          >
            {/* Magic book — centred in ring, always on top of ring objects */}
            <motion.div
              aria-hidden="true"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0, transition: { duration: 0.3 } }}
              transition={{ delay: 0.5, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              transformTemplate={(_, generated) => `translate(-50%, -50%) ${generated}`}
              style={{
                position: 'absolute',
                left: 0,
                top:  0,
                width: 'clamp(130px, 13vw, 185px)',
                zIndex: 26,          // above all ring items AND BookJourney (24)
                pointerEvents: 'none',
              }}
            >
              <motion.div
                animate={{
                  filter: [
                    'drop-shadow(0 0 18px rgba(232,201,122,0.55)) drop-shadow(0 0 45px rgba(242,168,184,0.22)) brightness(1.04)',
                    'drop-shadow(0 0 34px rgba(232,201,122,0.88)) drop-shadow(0 0 75px rgba(242,168,184,0.38)) brightness(1.13)',
                    'drop-shadow(0 0 18px rgba(232,201,122,0.55)) drop-shadow(0 0 45px rgba(242,168,184,0.22)) brightness(1.04)',
                  ],
                }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Image
                  src="/assets/ui/magic-book.png"
                  alt=""
                  aria-hidden="true"
                  width={180}
                  height={130}
                  style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                  priority
                />
              </motion.div>
            </motion.div>

            {/* Burst rings */}
            <motion.div
              aria-hidden="true"
              initial={{ scale: 0.1, opacity: 0.85 }} animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
              style={{ position: 'absolute', width: 110, height: 110, top: -55, left: -55, borderRadius: '50%', border: '1px solid rgba(232,201,122,0.65)', pointerEvents: 'none' }}
            />
            <motion.div
              aria-hidden="true"
              initial={{ scale: 0.1, opacity: 0.45 }} animate={{ scale: 3.2, opacity: 0 }}
              transition={{ duration: 1.6, ease: 'easeOut', delay: 0.78 }}
              style={{ position: 'absolute', width: 80, height: 80, top: -40, left: -40, borderRadius: '50%', border: '1px solid rgba(242,168,184,0.4)', pointerEvents: 'none' }}
            />

            {RING_ITEMS.map((item, i) => {
              const key = item.type as PreviewableType
              const items = content[COLLECTION_KEY[key]]
              const latest = latestItem(items)
              const previewVal = latest?.[PREVIEW_FIELD[key]]
              const preview = typeof previewVal === 'string' && previewVal.trim() ? previewVal.trim() : null

              return (
                <BloomObject
                  key={item.type as string}
                  item={item}
                  index={i}
                  preview={preview}
                  ringScale={ringScale}
                  onOpen={() => handleItemClick(item)}
                  onPositionChange={(pos) => updatePos(i, pos)}
                />
              )
            })}
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   BLOOM OBJECT
   Pure PNG, organic position, independent float rhythm. No backgrounds.
───────────────────────────────────────────────────────────────────── */

interface BloomObjectProps {
  readonly item: RingItem
  readonly index: number
  readonly preview: string | null
  readonly ringScale: number
  readonly onOpen: () => void
  readonly onPositionChange: (pos: Pos | null) => void
}

function BloomObject({ item, index, preview, ringScale, onOpen, onPositionChange }: BloomObjectProps) {
  const [hovering, setHovering] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const pos = organicPos(index, ringScale)
  const iconPx = Math.max(48, Math.round(72 * ringScale))
  const entryDelay = 0.72 + index * 0.09

  // Report screen position for thread canvas
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const id = setInterval(() => {
      const rect = el.getBoundingClientRect()
      if (rect.width === 0) { onPositionChange(null); return }
      onPositionChange({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    }, 80)
    return () => clearInterval(id)
  }, [onPositionChange])

  return (
    <motion.div
      ref={ref}
      style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'auto' }}
      transformTemplate={(_, generated) => `translate(-50%, -50%) ${generated}`}
      initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
      animate={{ x: pos.x, y: pos.y, scale: 1, opacity: 1 }}
      exit={{
        x: pos.x * 0.12, y: pos.y * 0.12, scale: 0, opacity: 0,
        transition: { delay: (RING_ITEMS.length - 1 - index) * 0.055, duration: 0.38, ease: [0.4, 0, 1, 1] },
      }}
      transition={{ delay: entryDelay, duration: 0.82, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Independent float — unique rhythm per object */}
      <motion.div
        animate={{
          y: [0, -item.floatAmp, item.floatAmp * 0.28, -item.floatAmp * 0.55, 0],
          rotate: [-1.2, 1.4, -0.7, 1.1, -1.2],
        }}
        transition={{
          duration: item.floatDur,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: item.floatDelay,
          times: [0, 0.28, 0.54, 0.78, 1],
        }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
      >
        <motion.button
          onClick={onOpen}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          aria-label={item.label}
          style={{
            background: 'transparent', border: 'none',
            cursor: 'pointer', outline: 'none', padding: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            position: 'relative',
          }}
          animate={{ scale: hovering ? 1.16 : 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 18 }}
          whileTap={{ scale: 0.8 }}
        >
          {/* Hover glow only — no background */}
          <motion.div
            aria-hidden="true"
            animate={{ opacity: hovering ? 1 : 0 }}
            transition={{ duration: 0.24 }}
            style={{
              position: 'absolute', inset: -28, borderRadius: '50%', pointerEvents: 'none',
              background: `radial-gradient(ellipse at 50% 52%, ${item.accent}50 0%, ${item.accent}1a 48%, transparent 72%)`,
            }}
          />

          {/* Pure PNG — no wrapper, no card */}
          <motion.div
            animate={{
              filter: hovering
                ? `drop-shadow(0 0 22px ${item.accent}f5) drop-shadow(0 6px 18px ${item.accent}aa) brightness(1.22)`
                : `drop-shadow(0 2px 14px rgba(0,0,0,0.7)) drop-shadow(0 0 5px ${item.accent}44) brightness(0.9)`,
            }}
            transition={{ duration: 0.24 }}
          >
            <Image
              src={item.asset}
              alt=""
              aria-hidden="true"
              width={iconPx}
              height={iconPx}
              style={{ width: iconPx, height: iconPx, objectFit: 'contain', display: 'block' }}
            />
          </motion.div>

          {/* Label */}
          <motion.span
            animate={{
              opacity: hovering ? 1 : 0.4,
              y: hovering ? 0 : 7,
              color: hovering ? item.accent : 'rgba(240,238,252,0.5)',
            }}
            transition={{ duration: 0.2 }}
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontStyle: 'italic', fontWeight: 300,
              fontSize: 12, letterSpacing: '0.07em',
              textShadow: '0 1px 14px rgba(0,0,0,0.98)',
              whiteSpace: 'nowrap', display: 'block',
            }}
          >
            {item.label}
          </motion.span>

          {/* Preview of the most recently added item — only while hovering */}
          <AnimatePresence>
            {hovering && preview && (
              <motion.span
                key="preview"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 0.9, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 300,
                  fontSize: 10.5,
                  letterSpacing: '0.02em',
                  color: item.accent,
                  textShadow: '0 1px 10px rgba(0,0,0,0.95)',
                  whiteSpace: 'nowrap',
                  display: 'block',
                  marginTop: -4,
                }}
              >
                “{truncate(preview, 28)}”
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
