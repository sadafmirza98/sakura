'use client'
import { useEffect, useRef } from 'react'

/**
 * CursorSparkles — a trail of small golden sparkles that follow the
 * pointer as it moves across the screen. Purely decorative: it never
 * intercepts clicks (pointerEvents: none) and sits above every other
 * layer so the trail is always visible.
 */

const ACCENT_RGB = '232,201,122'

interface Sparkle {
  x: number; y: number
  vx: number; vy: number
  size: number
  rot: number; vrot: number
  age: number
  life: number
}

function drawSparkle(ctx: CanvasRenderingContext2D, s: Sparkle) {
  const lifeFrac = s.age / s.life
  // Fade in fast, fade out slowly
  const alpha = lifeFrac < 0.18 ? lifeFrac / 0.18 : 1 - (lifeFrac - 0.18) / 0.82
  const scale = 0.5 + Math.sin(Math.min(lifeFrac, 1) * Math.PI) * 0.7
  const r = s.size * scale

  ctx.save()
  ctx.translate(s.x, s.y)
  ctx.rotate(s.rot)
  ctx.globalAlpha = Math.max(0, alpha)

  // Soft golden halo
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 3)
  glow.addColorStop(0, `rgba(${ACCENT_RGB},0.55)`)
  glow.addColorStop(1, `rgba(${ACCENT_RGB},0)`)
  ctx.fillStyle = glow
  ctx.beginPath(); ctx.arc(0, 0, r * 3, 0, Math.PI * 2); ctx.fill()

  // 4-pointed sparkle glyph
  ctx.beginPath()
  ctx.moveTo(0, -r)
  ctx.lineTo(r * 0.22, -r * 0.22)
  ctx.lineTo(r, 0)
  ctx.lineTo(r * 0.22, r * 0.22)
  ctx.lineTo(0, r)
  ctx.lineTo(-r * 0.22, r * 0.22)
  ctx.lineTo(-r, 0)
  ctx.lineTo(-r * 0.22, -r * 0.22)
  ctx.closePath()
  ctx.fillStyle = 'rgba(255,248,224,0.95)'
  ctx.fill()

  ctx.restore()
}

export default function CursorSparkles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)

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

    const MAX_SPARKLES = 36
    const SPAWN_DIST = 16 // min px moved before spawning another sparkle
    const sparkles: Sparkle[] = []
    let lastX = -9999, lastY = -9999
    let paused = false

    const spawn = (x: number, y: number) => {
      sparkles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.25 - Math.random() * 0.35,
        size: 2.6 + Math.random() * 2.2,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.05,
        age: 0,
        life: 42 + Math.random() * 22,
      })
      if (sparkles.length > MAX_SPARKLES) {
        sparkles.splice(0, sparkles.length - MAX_SPARKLES)
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY)
      if (dist >= SPAWN_DIST) {
        spawn(e.clientX, e.clientY)
        lastX = e.clientX
        lastY = e.clientY
      }
    }
    globalThis.addEventListener('pointermove', onPointerMove)

    const onVisibilityChange = () => { paused = document.hidden }
    document.addEventListener('visibilitychange', onVisibilityChange)

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop)
      if (paused) return
      ctx.clearRect(0, 0, W, H)

      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i]
        s.age++
        if (s.age >= s.life) { sparkles.splice(i, 1); continue }
        s.x += s.vx
        s.y += s.vy
        s.rot += s.vrot
        drawSparkle(ctx, s)
      }
    }
    loop()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      globalThis.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'block',
        pointerEvents: 'none',
        width: '100vw',
        height: '100vh',
      }}
    />
  )
}
