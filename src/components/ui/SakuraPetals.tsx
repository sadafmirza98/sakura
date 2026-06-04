'use client'
import { useEffect, useRef } from 'react'

interface Petal {
  x: number
  y: number
  size: number
  speedY: number
  speedX: number
  rotation: number
  rotationSpeed: number
  opacity: number
  hue: number
}

export default function SakuraPetals({ count = 25 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let petals: Petal[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const createPetal = (): Petal => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      size: 4 + Math.random() * 8,
      speedY: 0.6 + Math.random() * 1.2,
      speedX: -0.5 + Math.random() * 1,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.04,
      opacity: 0.4 + Math.random() * 0.5,
      hue: 340 + Math.random() * 20,
    })

    for (let i = 0; i < count; i++) {
      const p = createPetal()
      p.y = Math.random() * canvas.height
      petals.push(p)
    }

    const drawPetal = (p: Petal) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.globalAlpha = p.opacity
      ctx.beginPath()
      // Simple oval petal shape
      ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2)
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size)
      grad.addColorStop(0, `hsla(${p.hue}, 80%, 85%, 1)`)
      grad.addColorStop(1, `hsla(${p.hue}, 60%, 70%, 0)`)
      ctx.fillStyle = grad
      ctx.fill()
      ctx.restore()
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      petals.forEach((p) => {
        p.y += p.speedY
        p.x += p.speedX + Math.sin(p.y * 0.01) * 0.3
        p.rotation += p.rotationSpeed
        if (p.y > canvas.height + 20) {
          Object.assign(p, createPetal())
        }
        drawPetal(p)
      })
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [count])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      aria-hidden="true"
    />
  )
}
