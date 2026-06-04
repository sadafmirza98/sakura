'use client'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface TreeProps {
  blossomCount: number
  onClick?: () => void
  size?: 'small' | 'full'
  glowing?: boolean
}

export default function SakuraTree({ blossomCount, onClick, size = 'full', glowing = false }: TreeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const w = size === 'small' ? 220 : 420
  const h = size === 'small' ? 260 : 500

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = w
    canvas.height = h

    const cx = w / 2
    const baseY = h - 20

    // Growth factor
    const growth = Math.min(1, 0.3 + (blossomCount / 200) * 0.7)
    const trunkH = h * 0.38 * growth
    const branchScale = 0.7 + growth * 0.3

    ctx.clearRect(0, 0, w, h)

    // Draw trunk
    const drawTrunk = () => {
      ctx.beginPath()
      ctx.moveTo(cx - 8, baseY)
      ctx.bezierCurveTo(cx - 6, baseY - trunkH * 0.5, cx + 4, baseY - trunkH * 0.6, cx, baseY - trunkH)
      ctx.bezierCurveTo(cx + 2, baseY - trunkH * 0.6, cx + 10, baseY - trunkH * 0.4, cx + 8, baseY)
      ctx.closePath()
      const tGrad = ctx.createLinearGradient(cx - 8, baseY, cx + 8, baseY)
      tGrad.addColorStop(0, '#3d2314')
      tGrad.addColorStop(0.5, '#6b3a21')
      tGrad.addColorStop(1, '#3d2314')
      ctx.fillStyle = tGrad
      ctx.fill()
    }

    // Draw a branch
    const drawBranch = (
      x: number, y: number,
      angle: number, length: number,
      depth: number,
      maxDepth: number
    ) => {
      if (depth > maxDepth || length < 5) return
      const ex = x + Math.cos(angle) * length
      const ey = y + Math.sin(angle) * length

      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.quadraticCurveTo(
        x + Math.cos(angle - 0.2) * length * 0.5,
        y + Math.sin(angle - 0.2) * length * 0.5,
        ex, ey
      )
      ctx.strokeStyle = depth === 0 ? '#6b3a21' : `rgba(90,50,25,${1 - depth * 0.15})`
      ctx.lineWidth = Math.max(1, 5 - depth * 1.2)
      ctx.stroke()

      const spread = 0.35 + depth * 0.08
      drawBranch(ex, ey, angle - spread, length * 0.68, depth + 1, maxDepth)
      drawBranch(ex, ey, angle + spread * 0.8, length * 0.65, depth + 1, maxDepth)
      if (depth < 2) {
        drawBranch(ex, ey, angle - spread * 0.3, length * 0.55, depth + 2, maxDepth)
      }
    }

    // Draw blossom
    const drawBlossom = (x: number, y: number, r: number, golden: boolean) => {
      const petals = 5
      for (let i = 0; i < petals; i++) {
        const a = (i / petals) * Math.PI * 2
        ctx.beginPath()
        ctx.ellipse(
          x + Math.cos(a) * r * 0.7,
          y + Math.sin(a) * r * 0.7,
          r * 0.55, r * 0.35,
          a, 0, Math.PI * 2
        )
        if (golden) {
          ctx.fillStyle = `rgba(232, 201, 122, 0.85)`
        } else {
          const pink = 320 + Math.random() * 30
          ctx.fillStyle = `hsla(${pink}, 80%, 82%, 0.85)`
        }
        ctx.fill()
      }
      // Center
      ctx.beginPath()
      ctx.arc(x, y, r * 0.25, 0, Math.PI * 2)
      ctx.fillStyle = golden ? '#f5d78e' : '#fff0f3'
      ctx.fill()
    }

    const trunkTopX = cx
    const trunkTopY = baseY - trunkH

    drawTrunk()

    // Branches
    const maxDepth = Math.min(4, Math.floor(1 + growth * 3))
    const branchLen = (h * 0.22) * branchScale
    ctx.lineCap = 'round'
    drawBranch(trunkTopX, trunkTopY, -Math.PI / 2 - 0.15, branchLen, 0, maxDepth)
    drawBranch(trunkTopX, trunkTopY, -Math.PI / 2 + 0.15, branchLen * 0.9, 0, maxDepth)
    if (growth > 0.5) {
      drawBranch(trunkTopX, trunkTopY - trunkH * 0.15, -Math.PI / 2 - 0.5, branchLen * 0.6, 1, maxDepth)
      drawBranch(trunkTopX, trunkTopY - trunkH * 0.15, -Math.PI / 2 + 0.5, branchLen * 0.55, 1, maxDepth)
    }

    // Blossoms scattered around canopy
    const blossomPositions: { x: number; y: number }[] = []
    const numBlossoms = Math.min(blossomCount, 80)
    const canopyR = branchLen * 1.2

    for (let i = 0; i < numBlossoms; i++) {
      const a = Math.random() * Math.PI * 2
      const r = Math.random() * canopyR
      const bx = trunkTopX + Math.cos(a) * r
      const by = trunkTopY + Math.sin(a) * r * 0.5 - canopyR * 0.1
      blossomPositions.push({ x: bx, y: by })
    }

    blossomPositions.forEach(({ x, y }, i) => {
      const isGolden = glowing && i < 3
      drawBlossom(x, y, (size === 'small' ? 5 : 8) + Math.random() * 4, isGolden)
    })

    // Glow effect
    if (glowing) {
      const gGrad = ctx.createRadialGradient(trunkTopX, trunkTopY - canopyR * 0.3, 0, trunkTopX, trunkTopY - canopyR * 0.3, canopyR * 1.2)
      gGrad.addColorStop(0, 'rgba(232, 201, 122, 0.15)')
      gGrad.addColorStop(1, 'rgba(232, 201, 122, 0)')
      ctx.fillStyle = gGrad
      ctx.fillRect(0, 0, w, h)
    }
  }, [blossomCount, glowing, w, h, size])

  return (
    <motion.div
      className="relative cursor-pointer select-none"
      style={{ width: w, height: h }}
      animate={{ rotate: [-0.5, 0.8, -0.5] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
    >
      <canvas
        ref={canvasRef}
        width={w}
        height={h}
        className="drop-shadow-2xl"
        style={{
          filter: glowing
            ? 'drop-shadow(0 0 30px rgba(232,201,122,0.5))'
            : 'drop-shadow(0 0 20px rgba(242,168,184,0.3))',
        }}
      />
    </motion.div>
  )
}
