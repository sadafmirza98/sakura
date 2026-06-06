'use client'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { ContentItem } from '@/store/useContentStore'

interface Props {
  item: ContentItem | null
}

interface DreamGoal {
  id: string
  text: string
  completed: boolean
}

const accent = '#ffe890'

function ConstellationPreview({ goals }: Readonly<{ goals: DreamGoal[] }>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)

    if (goals.length === 0) return

    // Deterministic positions using golden angle
    const golden = 2.399963
    const positions: { x: number; y: number }[] = goals.map((_, i) => {
      const angle = i * golden
      const radius = 0.3 + (i / Math.max(goals.length, 1)) * 0.32
      return {
        x: W / 2 + Math.cos(angle) * radius * W,
        y: H / 2 + Math.sin(angle) * radius * H,
      }
    })

    // Draw connecting lines
    ctx.strokeStyle = `rgba(255,232,144,0.18)`
    ctx.lineWidth = 1
    for (let i = 0; i < positions.length - 1; i++) {
      ctx.beginPath()
      ctx.moveTo(positions[i].x, positions[i].y)
      ctx.lineTo(positions[i + 1].x, positions[i + 1].y)
      ctx.stroke()
    }

    // Draw star nodes
    positions.forEach((pos, i) => {
      const done = goals[i].completed
      const r = done ? 4 : 2.5

      // Glow for completed
      if (done) {
        const grd = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 10)
        grd.addColorStop(0, `rgba(255,232,144,0.5)`)
        grd.addColorStop(1, `rgba(255,232,144,0)`)
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.fillStyle = done ? `rgba(255,232,144,0.95)` : `rgba(255,232,144,0.45)`
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2)
      ctx.fill()
    })
  }, [goals])

  return (
    <canvas
      ref={canvasRef}
      width={240}
      height={120}
      style={{ display: 'block', margin: '0 auto', opacity: goals.length ? 1 : 0.3 }}
    />
  )
}

const DEFAULT_GOALS: DreamGoal[] = [
  { id: 'a', text: 'Future Home', completed: false },
  { id: 'b', text: 'Travel Together', completed: false },
  { id: 'c', text: 'Family', completed: false },
]

export default function DreamPanel({ item }: Readonly<Props>) {
  const title      = (item?.title     as string)   ?? 'Unnamed Dream'
  const targetDate = (item?.targetDate as string)  ?? ''
  const rawGoals   = (item?.goals     as DreamGoal[] | undefined)

  const goals: DreamGoal[] = rawGoals && rawGoals.length > 0
    ? rawGoals
    : DEFAULT_GOALS

  return (
    <div>
      {/* Dream title */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}
      >
        <span style={{ fontSize: 28, filter: `drop-shadow(0 0 12px ${accent}88)` }}>✨</span>
        <p className="font-serif" style={{ fontSize: 18, fontWeight: 300, color: '#f0eefc' }}>
          {title}
        </p>
      </motion.div>

      {/* Goals list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
        {goals.map((goal) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 12,
              background: goal.completed ? `${accent}14` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${goal.completed ? accent + '44' : 'rgba(255,255,255,0.07)'}`,
            }}
          >
            {/* Checkbox-style circle */}
            <div style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              border: `1.5px solid ${goal.completed ? accent : 'rgba(255,232,144,0.25)'}`,
              background: goal.completed ? `${accent}28` : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {goal.completed && <span style={{ fontSize: 10, color: accent }}>✓</span>}
            </div>
            <span
              className="font-sans"
              style={{
                fontSize: 13,
                color: goal.completed ? '#f0eefc' : 'rgba(240,238,252,0.55)',
              }}
            >
              {goal.text}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Constellation preview */}
      <div style={{ marginBottom: 18, padding: '14px 0', borderRadius: 14, background: 'rgba(255,232,144,0.04)', border: '1px solid rgba(255,232,144,0.1)' }}>
        <ConstellationPreview goals={goals} />
      </div>

      {/* Target date */}
      {targetDate && (
        <div style={{ textAlign: 'center' }}>
          <p className="font-sans" style={{ fontSize: 11, color: 'rgba(201,191,232,0.4)', letterSpacing: '0.1em' }}>
            ✦ Target: {new Date(targetDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
          </p>
        </div>
      )}
    </div>
  )
}
