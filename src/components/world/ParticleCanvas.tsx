'use client'
import { useEffect, useRef } from 'react'

/**
 * ParticleCanvas — ambient life layer only. No scenery drawing.
 *
 * Renders:
 *  • Sakura petals   — 15–25 active, hue 334–362, wobble via sin(t + wobble_phase)
 *  • Fireflies       — 10–18 active, lower-left region (x: 0–40%, y: 55–80%)
 *  • Shooting star   — one at a time, random interval 200–600 frames
 *  • Star twinkle    — 60 small stars over sky region, individual twinkle rates
 *
 * Performance:
 *  • Paused when document.hidden === true
 *  • Particle cap: 150 desktop / 60 mobile
 *    (mobile = navigator.hardwareConcurrency < 4 or viewport width < 768)
 *
 * z-index: 1 — sits above HeroBg (z-0), below WorldCanvas (z-10)
 */

/* ─── helpers ─────────────────────────────────────────────── */

function isMobile(): boolean {
  return (
    window.innerWidth < 768 ||
    navigator.hardwareConcurrency < 4
  )
}

/* ─── types ───────────────────────────────────────────────── */

interface Petal {
  x: number; y: number
  vx: number; vy: number
  r: number
  rot: number; vrot: number
  a: number
  hue: number
  wobble: number  // wobble phase offset for sin(t + wobble)
}

interface Firefly {
  x: number; y: number
  r: number
  phase: number
  spd: number
  vx: number; vy: number
}

interface TwinkleStar {
  x: number; y: number
  r: number
  base: number     // base opacity
  rate: number     // individual twinkle rate
  off: number      // phase offset
  warm: boolean    // warm vs cool tint
}

interface ShootStar {
  active: boolean
  x: number; y: number
  timer: number
  nextAt: number   // frame number at which next one fires
}

/* ─── component ───────────────────────────────────────────── */

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const mobile = isMobile()
    // particle caps per spec
    const MAX_PARTICLES = mobile ? 60 : 150

    // target petal / firefly counts, clamped to mobile budget
    const TARGET_PETALS     = mobile ? 12 : 20    // 15–25 → pick midpoint 20
    const TARGET_FIREFLIES  = mobile ? 8  : 14    // 10–18 → pick midpoint 14
    const STAR_COUNT        = mobile ? 30 : 60

    let W = 0, H = 0

    const resize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
      initTwinkleStars()
      initFireflies()
      initPetals()
    }

    /* ── Sakura petals ──────────────────────────── */
    let petals: Petal[] = []

    const mkPetal = (): Petal => ({
      x:      Math.random() * W,
      y:      -20 - Math.random() * 60,
      vx:     -0.5 + Math.random(),
      vy:     0.28 + Math.random() * 0.55,
      r:      3 + Math.random() * 6,           // 3–9 px
      rot:    Math.random() * Math.PI * 2,
      vrot:   (Math.random() - 0.5) * 0.036,
      a:      0.35 + Math.random() * 0.45,
      hue:    334 + Math.random() * 28,         // 334–362
      wobble: Math.random() * Math.PI * 2,
    })

    const initPetals = () => {
      petals = Array.from({ length: TARGET_PETALS }, () => {
        const p = mkPetal()
        // scatter initial y across the whole screen so it doesn't start empty
        p.y = Math.random() * H
        return p
      })
    }

    const updateDrawPetals = (t: number) => {
      // Spawn to maintain TARGET_PETALS (15–25 range)
      const minPetals = mobile ? 8  : 15
      const maxPetals = mobile ? 15 : 25
      if (petals.length < minPetals && Math.random() < 0.08) {
        petals.push(mkPetal())
      }
      if (petals.length > maxPetals) {
        petals.splice(0, petals.length - maxPetals)
      }

      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i]
        // wobble horizontal drift via sin(t + wobble_phase)
        p.x   += p.vx + Math.sin(t * 0.007 + p.wobble) * 0.38
        p.y   += p.vy
        p.rot += p.vrot

        if (p.y > H + 30) {
          petals[i] = mkPetal()
          continue
        }

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = p.a

        const pg = ctx.createRadialGradient(0, 0, 0, 0, 0, p.r)
        pg.addColorStop(0,    `hsla(${p.hue},80%,86%,1)`)
        pg.addColorStop(0.65, `hsla(${p.hue},70%,78%,0.7)`)
        pg.addColorStop(1,    `hsla(${p.hue},60%,72%,0)`)

        ctx.beginPath()
        ctx.ellipse(0, 0, p.r, p.r * 0.42, 0, 0, Math.PI * 2)
        ctx.fillStyle = pg
        ctx.fill()

        // Subtle midrib vein
        ctx.beginPath()
        ctx.moveTo(-p.r * 0.5, 0)
        ctx.lineTo(p.r * 0.5, 0)
        ctx.strokeStyle = `hsla(${p.hue},50%,90%,0.22)`
        ctx.lineWidth = 0.5
        ctx.stroke()

        ctx.restore()
      }
    }

    /* ── Fireflies ──────────────────────────────── */
    let fireflies: Firefly[] = []

    const mkFirefly = (): Firefly => ({
      // lower-left region: x 0–40%, y 55–80%
      x:     W * (Math.random() * 0.4),
      y:     H * (0.55 + Math.random() * 0.25),
      r:     1.2 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      spd:   0.006 + Math.random() * 0.01,
      vx:    0,
      vy:    0,
    })

    const initFireflies = () => {
      fireflies = Array.from({ length: TARGET_FIREFLIES }, mkFirefly)
    }

    const updateDrawFireflies = (t: number) => {
      const minFF = mobile ? 5  : 10
      const maxFF = mobile ? 10 : 18

      // Maintain count
      while (fireflies.length < minFF) {
        fireflies.push(mkFirefly())
      }
      if (fireflies.length > maxFF) fireflies.length = maxFF

      fireflies.forEach(f => {
        // Organic damped velocity
        f.vx += Math.sin(t * f.spd + f.phase) * 0.18
        f.vy += Math.cos(t * f.spd * 0.72 + f.phase) * 0.14
        f.vx *= 0.96
        f.vy *= 0.96
        f.x  += f.vx
        f.y  += f.vy

        // Soft boundary — nudge back if leaving the lower-left region
        if (f.x < 0)          f.vx += 0.3
        if (f.x > W * 0.45)   f.vx -= 0.3
        if (f.y < H * 0.5)    f.vy += 0.3
        if (f.y > H * 0.84)   f.vy -= 0.3

        const gv = 0.05 + 0.92 * Math.abs(Math.sin(t * f.spd * 1.9 + f.phase))

        // Outer soft glow (only when bright enough — saves fillRect calls)
        if (gv > 0.22) {
          const fg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 10)
          // soft green-yellow: rgba(180,240,120,α) per spec
          fg.addColorStop(0, `rgba(180,240,120,${gv * 0.55})`)
          fg.addColorStop(1, 'rgba(180,240,120,0)')
          ctx.fillStyle = fg
          ctx.fillRect(f.x - f.r * 11, f.y - f.r * 11, f.r * 22, f.r * 22)
        }

        ctx.beginPath()
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(185,255,148,${gv})`
        ctx.fill()
      })
    }

    /* ── Shooting star ──────────────────────────── */
    const shoot: ShootStar = {
      active: false,
      x: 0, y: 0,
      timer: 0,
      nextAt: 200 + Math.random() * 400,  // first fire: 200–600 frames
    }

    const updateDrawShootingStar = (t: number) => {
      if (!shoot.active && t >= shoot.nextAt) {
        shoot.active = true
        shoot.x      = 60 + Math.random() * W * 0.55
        shoot.y      = 10 + Math.random() * H * 0.22
        shoot.timer  = 0
      }

      if (!shoot.active) return

      shoot.timer++
      shoot.x += 8.5
      shoot.y += 3.2

      const a = Math.max(0, 1 - shoot.timer / 55)
      if (a <= 0) {
        shoot.active = false
        // next interval: 200–600 frames after current frame
        shoot.nextAt = t + 200 + Math.random() * 400
        return
      }

      // Gradient trail: transparent → white
      const sg = ctx.createLinearGradient(shoot.x, shoot.y, shoot.x - 200, shoot.y - 75)
      sg.addColorStop(0,   `rgba(255,252,255,${a})`)
      sg.addColorStop(0.3, `rgba(220,200,255,${a * 0.6})`)
      sg.addColorStop(1,   'rgba(200,180,255,0)')
      ctx.beginPath()
      ctx.moveTo(shoot.x, shoot.y)
      ctx.lineTo(shoot.x - 200, shoot.y - 75)
      ctx.strokeStyle = sg
      ctx.lineWidth   = 1.8
      ctx.stroke()

      // Bright head dot
      const head = ctx.createRadialGradient(shoot.x, shoot.y, 0, shoot.x, shoot.y, 5)
      head.addColorStop(0, `rgba(255,255,255,${a})`)
      head.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = head
      ctx.beginPath()
      ctx.arc(shoot.x, shoot.y, 5, 0, Math.PI * 2)
      ctx.fill()
    }

    /* ── Star twinkle overlay ───────────────────── */
    let twinkleStars: TwinkleStar[] = []

    const initTwinkleStars = () => {
      // Stars confined to sky region: x 45–100%, y 0–50% (per spec)
      twinkleStars = Array.from({ length: STAR_COUNT }, () => ({
        x:    W * (0.45 + Math.random() * 0.55),
        y:    Math.random() * H * 0.5,
        r:    0.3 + Math.random() * 1.4,
        base: 0.08 + Math.random() * 0.6,
        rate: 0.28 + Math.random() * 2,   // individual twinkle rates
        off:  Math.random() * Math.PI * 2,
        warm: Math.random() < 0.28,
      }))
    }

    const drawTwinkleStars = (t: number) => {
      twinkleStars.forEach(s => {
        const brightness = s.base + s.base * 0.55 * Math.sin(t * 0.012 * s.rate + s.off)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = s.warm
          ? `rgba(255,240,210,${brightness})`
          : `rgba(210,205,255,${brightness})`
        ctx.fill()

        // Cross-sparkle on the brightest stars
        if (brightness > 0.72 && s.r > 1) {
          const len = s.r * 3.2
          ctx.strokeStyle = s.warm
            ? `rgba(255,240,210,${brightness * 0.32})`
            : `rgba(210,205,255,${brightness * 0.32})`
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(s.x - len, s.y)
          ctx.lineTo(s.x + len, s.y)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(s.x, s.y - len)
          ctx.lineTo(s.x, s.y + len)
          ctx.stroke()
        }
      })
    }

    /* ── Total particle guard ───────────────────── */
    const totalParticles = () =>
      petals.length + fireflies.length + (shoot.active ? 1 : 0) + twinkleStars.length

    /* ── Animation loop ─────────────────────────── */
    let frame = 0
    let paused = false

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop)
      if (paused) return

      frame++
      ctx.clearRect(0, 0, W, H)

      drawTwinkleStars(frame)
      updateDrawShootingStar(frame)
      // Draw particles; the cap controls spawning inside update fns
      updateDrawPetals(frame)
      updateDrawFireflies(frame)
      // Enforce hard cap by trimming if needed
      if (totalParticles() > MAX_PARTICLES) {
        const excess = totalParticles() - MAX_PARTICLES
        petals.splice(0, Math.min(excess, petals.length))
      }
    }

    /* ── Visibility pause ───────────────────────── */
    const onVisibilityChange = () => {
      paused = document.hidden
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    /* ── Resize ─────────────────────────────────── */
    window.addEventListener('resize', resize)
    resize()
    loop()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      // eslint-disable-next-line jsx-a11y/no-aria-hidden-on-focusable
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        display: 'block',
        pointerEvents: 'none',
        width: '100vw',
        height: '100vh',
      }}
    />
  )
}
