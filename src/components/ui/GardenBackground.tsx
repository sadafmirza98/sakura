'use client'
import { useEffect, useRef } from 'react'
import SakuraPetals from './SakuraPetals'

export default function GardenBackground({ petalCount = 20 }: { petalCount?: number }) {
  return (
    <>
      {/* Multi-layer atmospheric sky */}
      <div className="fixed inset-0 z-0" aria-hidden="true" style={{ background: '#06091a' }} />

      {/* Deep space layer — subtle blue-violet */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 120% 60% at 20% 10%, rgba(72,52,140,0.35) 0%, transparent 60%),' +
            'radial-gradient(ellipse 80% 50% at 80% 5%, rgba(40,30,100,0.3) 0%, transparent 55%),' +
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(100,60,160,0.2) 0%, transparent 50%)',
        }}
      />

      {/* Aurora-like mid bands */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 90% 30% at 15% 35%, rgba(120,80,200,0.18) 0%, transparent 70%),' +
            'radial-gradient(ellipse 70% 25% at 85% 40%, rgba(80,120,200,0.14) 0%, transparent 60%)',
        }}
      />

      {/* Sakura bloom glow near horizon — warm pink/coral */}
      <div
        className="fixed bottom-0 left-0 right-0 z-0 pointer-events-none"
        aria-hidden="true"
        style={{
          height: '55%',
          background:
            'radial-gradient(ellipse 80% 50% at 30% 100%, rgba(220,120,150,0.22) 0%, transparent 65%),' +
            'radial-gradient(ellipse 60% 40% at 70% 100%, rgba(200,100,140,0.18) 0%, transparent 60%),' +
            'radial-gradient(ellipse 100% 30% at 50% 100%, rgba(180,80,120,0.12) 0%, transparent 50%)',
        }}
      />

      {/* Horizon mist — very subtle warm cream/gold line */}
      <div
        className="fixed left-0 right-0 z-0 pointer-events-none"
        aria-hidden="true"
        style={{
          bottom: '18%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(240,180,160,0.18) 20%, rgba(240,180,160,0.35) 50%, rgba(240,180,160,0.18) 80%, transparent 100%)',
          filter: 'blur(4px)',
        }}
      />

      {/* Ground mist */}
      <div
        className="fixed bottom-0 left-0 right-0 z-0 pointer-events-none"
        aria-hidden="true"
        style={{
          height: '22%',
          background: 'linear-gradient(0deg, rgba(10,8,28,0.9) 0%, rgba(10,8,28,0.5) 50%, transparent 100%)',
        }}
      />

      {/* Nebula cloud blobs */}
      <NebulaLayer />

      <SakuraPetals count={petalCount} />
    </>
  )
}

function NebulaLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let t = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      drawStatic()
    }

    // Static nebula blobs drawn once
    const drawStatic = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Stars
      for (let i = 0; i < 140; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height * 0.75
        const r = 0.4 + Math.random() * 1.4
        const alpha = 0.15 + Math.random() * 0.75
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        // Slight color variation — warm white, cool blue, pale pink
        const hue = [0, 200, 320][Math.floor(Math.random() * 3)]
        ctx.fillStyle = `hsla(${hue}, 40%, 95%, ${alpha})`
        ctx.fill()
      }
    }

    resize()
    window.addEventListener('resize', resize)

    // Animate only twinkling on top of static stars
    const twinkleStars: { x: number; y: number; r: number; base: number; speed: number; offset: number; hue: number }[] = []
    for (let i = 0; i < 60; i++) {
      twinkleStars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 0.7,
        r: 0.6 + Math.random() * 1.8,
        base: 0.2 + Math.random() * 0.5,
        speed: 0.3 + Math.random() * 1.5,
        offset: Math.random() * Math.PI * 2,
        hue: [0, 200, 320, 260][Math.floor(Math.random() * 4)],
      })
    }

    // Shooting star state
    let shootActive = false
    let sx = 0, sy = 0, stimer = 0, snextAt = 180 + Math.random() * 300

    const animate = () => {
      t++

      // Clear & redraw static every frame is wasteful — only redraw twinkling stars
      // Composite over static canvas with clearRect trick: use a 2nd canvas approach
      // Instead: just redraw full scene (fast at 140 points)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Static dim stars
      for (let i = 0; i < 80; i++) {
        // deterministic from seed-like index
        const x = ((i * 137.508 + 23) % 1) * canvas.width || (i * 0.618) % canvas.width
        const y = ((i * 97.3 + 11) % 0.75) * canvas.height || (i * 0.382) % (canvas.height * 0.75)
        ctx.beginPath()
        ctx.arc(
          ((i * 137.508) % canvas.width),
          ((i * 73.1) % (canvas.height * 0.75)),
          0.4 + (i % 3) * 0.5,
          0, Math.PI * 2
        )
        ctx.fillStyle = `rgba(220,218,240,${0.12 + (i % 5) * 0.08})`
        ctx.fill()
      }

      // Twinkling stars
      twinkleStars.forEach((s) => {
        const brightness = s.base + s.base * 0.7 * Math.sin(t * 0.015 * s.speed + s.offset)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${s.hue}, 50%, 92%, ${brightness})`
        ctx.fill()
      })

      // Shooting star
      if (!shootActive && t > snextAt) {
        shootActive = true
        sx = Math.random() * canvas.width * 0.5 + 50
        sy = Math.random() * canvas.height * 0.25 + 20
        stimer = 0
      }
      if (shootActive) {
        stimer++
        const speed = 9
        sx += speed
        sy += speed * 0.38
        const alpha = Math.max(0, 1 - stimer / 55)
        if (alpha <= 0) { shootActive = false; snextAt = t + 280 + Math.random() * 450 }
        else {
          const g = ctx.createLinearGradient(sx, sy, sx - 160, sy - 60)
          g.addColorStop(0, `rgba(255,240,248,${alpha})`)
          g.addColorStop(0.5, `rgba(200,180,255,${alpha * 0.5})`)
          g.addColorStop(1, 'rgba(200,180,255,0)')
          ctx.beginPath()
          ctx.moveTo(sx, sy)
          ctx.lineTo(sx - 160, sy - 60)
          ctx.strokeStyle = g
          ctx.lineWidth = 1.5
          ctx.stroke()
          // Bright head
          ctx.beginPath()
          ctx.arc(sx, sy, 2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,245,255,${alpha})`
          ctx.fill()
        }
      }

      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  )
}
