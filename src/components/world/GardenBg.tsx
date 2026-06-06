'use client'
import { useEffect, useRef } from 'react'

/**
 * GardenBg — ambient particle canvas for non-home routes (AppShell, EntryScreen).
 *
 * All scenery drawing (sky, mountains, river, bridge, fog, moon, path,
 * garden lanterns, foreground) has been removed. The home route uses
 * HeroBg (CSS illustration) + ParticleCanvas instead.
 *
 * This component retains only:
 *  • Drifting sakura petals
 *  • Fireflies
 *
 * z-index: 0 — sits behind all UI layers.
 */
export default function GardenBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // alpha: false — opaque canvas, draws its own dark background
    const ctx = canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D

    let W = 0, H = 0
    const resize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
      initPetals()
      initFireflies()
    }

    /* ── petal system ───────────────────────────────────────────── */
    interface Petal {
      x: number; y: number; vx: number; vy: number
      r: number; rot: number; vrot: number; a: number
      hue: number; wobble: number
    }
    let petals: Petal[] = []
    const mkPetal = (): Petal => ({
      x:      Math.random() * W,
      y:      -20 - Math.random() * 60,
      vx:     -0.45 + Math.random() * 0.9,
      vy:     0.3 + Math.random() * 0.65,
      r:      3.5 + Math.random() * 6,
      rot:    Math.random() * Math.PI * 2,
      vrot:   (Math.random() - 0.5) * 0.038,
      a:      0.4 + Math.random() * 0.45,
      hue:    334 + Math.random() * 28,
      wobble: Math.random() * Math.PI * 2,
    })
    const initPetals = () => {
      petals = Array.from({ length: 22 }, () => {
        const p = mkPetal()
        p.y = Math.random() * H
        return p
      })
    }

    /* ── fireflies ──────────────────────────────────────────────── */
    interface Fly { x: number; y: number; r: number; phase: number; spd: number; dx: number; dy: number }
    let flies: Fly[] = []
    const initFireflies = () => {
      flies = Array.from({ length: 14 }, () => ({
        x:     W * 0.12 + Math.random() * W * 0.76,
        y:     H * 0.42 + Math.random() * H * 0.38,
        r:     1.3 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2,
        spd:   0.006 + Math.random() * 0.01,
        dx: 0, dy: 0,
      }))
    }

    window.addEventListener('resize', resize)
    resize()

    /* ── Main loop ──────────────────────────────────────────────── */
    let frame = 0
    const loop = () => {
      frame++

      // Dark background fill (no sky gradient — keep it simple)
      ctx.fillStyle = '#04060f'
      ctx.fillRect(0, 0, W, H)

      /* petals */
      if (Math.random() < 0.07) petals.push(mkPetal())
      if (petals.length > 28) petals.splice(0, petals.length - 28)

      petals.forEach(p => {
        p.x   += p.vx + Math.sin(frame * 0.008 + p.wobble) * 0.3
        p.y   += p.vy
        p.rot += p.vrot
        if (p.y > H + 30) { Object.assign(p, mkPetal()); return }

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = p.a

        const pg = ctx.createRadialGradient(0, 0, 0, 0, 0, p.r)
        pg.addColorStop(0,    `hsla(${p.hue},80%,85%,1)`)
        pg.addColorStop(0.65, `hsla(${p.hue},70%,78%,0.7)`)
        pg.addColorStop(1,    `hsla(${p.hue},60%,72%,0)`)
        ctx.beginPath()
        ctx.ellipse(0, 0, p.r, p.r * 0.42, 0, 0, Math.PI * 2)
        ctx.fillStyle = pg
        ctx.fill()

        ctx.beginPath()
        ctx.moveTo(-p.r * 0.5, 0)
        ctx.lineTo(p.r * 0.5, 0)
        ctx.strokeStyle = `hsla(${p.hue},50%,90%,0.25)`
        ctx.lineWidth = 0.5
        ctx.stroke()
        ctx.restore()
      })

      /* fireflies */
      flies.forEach(f => {
        f.dx += Math.sin(frame * f.spd + f.phase) * 0.22
        f.dy += Math.cos(frame * f.spd * 0.72 + f.phase) * 0.16
        f.dx *= 0.97; f.dy *= 0.97
        const gv = 0.06 + 0.9 * Math.abs(Math.sin(frame * f.spd * 1.9 + f.phase))
        const gx = f.x + f.dx, gy = f.y + f.dy

        if (gv > 0.25) {
          const fg = ctx.createRadialGradient(gx, gy, 0, gx, gy, f.r * 10)
          fg.addColorStop(0, `rgba(165,255,130,${gv * 0.65})`)
          fg.addColorStop(1, 'rgba(165,255,130,0)')
          ctx.fillStyle = fg
          ctx.fillRect(gx - f.r * 11, gy - f.r * 11, f.r * 22, f.r * 22)
        }
        ctx.beginPath()
        ctx.arc(gx, gy, f.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(185,255,148,${gv})`
        ctx.fill()
      })

      rafRef.current = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        display: 'block',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}
