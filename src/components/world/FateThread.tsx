'use client'
/**
 * FateThread — the board on the far right of the hero image becomes
 * a portal into the relationship timeline.
 *
 * Layers:
 *   BoardAmbient  z-12  idle memory notes + board glow
 *   BoardHitZone  z-14  transparent clickable overlay over the board
 *   FateThreadOverlay z-40  full-screen cinematic timeline experience
 *
 * Click sequence:
 *   1. Background darkens
 *   2. Board zooms forward (3D perspective swing)
 *   3. Chalk text dissolves into particles
 *   4. Glowing threads emerge, weave together
 *   5. Thread curves across screen with hanging memory notes
 *   6. Future path continues as dashed glow
 *
 * Close: thread dissolves, particles return to board, fade out
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/store/useUIStore'
import { useContentStore, type ContentItem } from '@/store/useContentStore'

/* ─────────────────────────────────────────────────────────────────────
   BOARD POSITION — matches the wooden board on the far right
───────────────────────────────────────────────────────────────────── */
const BOARD_LEFT  = '88%'
const BOARD_TOP   = '62%'
const BOARD_W     = 180     // px
const BOARD_H     = 340     // px

/* ─────────────────────────────────────────────────────────────────────
   BOARD AMBIENT
   Idle magical notes that briefly appear on the board
───────────────────────────────────────────────────────────────────── */

export function BoardAmbient() {
  const { timelineOpen } = useUIStore()
  const [noteVisible, setNoteVisible] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (timelineOpen) return
    const tick = () => {
      setNoteVisible(true)
      setTimeout(() => setNoteVisible(false), 2200)
    }
    tick()
    const id = setInterval(tick, 10000)
    return () => clearInterval(id)
  }, [timelineOpen])

  return (
    <div
      aria-hidden="true"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed',
        left: BOARD_LEFT,
        top:  BOARD_TOP,
        transform: 'translate(-50%, -50%)',
        width:  BOARD_W,
        height: BOARD_H,
        zIndex: 12,
        pointerEvents: 'none',
      }}
    >
      {/* Warm golden glow on hover */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'absolute',
          inset: '-30% -20%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(232,201,122,0.28) 0%, rgba(255,180,80,0.1) 50%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Idle note */}
      <AnimatePresence>
        {noteVisible && !timelineOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.9 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '22%',
              left: '50%',
              transform: 'translateX(-50%) rotate(-2deg)',
              background: 'rgba(255,248,230,0.12)',
              border: '1px solid rgba(232,201,122,0.3)',
              borderRadius: 4,
              padding: '5px 10px',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 0 14px rgba(232,201,122,0.25)',
            }}
          >
            <span style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontStyle: 'italic',
              fontSize: 11,
              color: 'rgba(245,238,210,0.82)',
              letterSpacing: '0.04em',
            }}>
              06 Dec 2020
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover text overlay */}
      <AnimatePresence>
        {hovered && !timelineOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              top: '18%',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <motion.span
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.5, times: [0, 0.2, 0.8, 1], repeat: Infinity, repeatDelay: 0.5 }}
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontStyle: 'italic',
                fontSize: 13,
                color: 'rgba(245,238,210,0.75)',
                textShadow: '0 0 20px rgba(232,201,122,0.7)',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              Our Story So Far
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   BOARD HIT ZONE
───────────────────────────────────────────────────────────────────── */

export function BoardHitZone() {
  const { timelineOpen, openTimeline, closeTimeline } = useUIStore()
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        position: 'fixed',
        left: BOARD_LEFT,
        top:  BOARD_TOP,
        transform: 'translate(-50%, -50%)',
        width:  BOARD_W,
        height: BOARD_H,
        zIndex: 14,
      }}
    >
      <button
        onClick={() => timelineOpen ? closeTimeline() : openTimeline()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={timelineOpen ? 'Close timeline' : 'Open our story timeline'}
        aria-expanded={timelineOpen}
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          outline: 'none',
        }}
      />

      {/* Hover cursor glow — radiates from the board */}
      <motion.div
        aria-hidden="true"
        animate={{ opacity: hovered && !timelineOpen ? 1 : 0 }}
        transition={{ duration: 0.35 }}
        style={{
          position: 'absolute',
          inset: '-25% -18%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(232,201,122,0.22) 0%, rgba(255,180,80,0.08) 55%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────── */

function formatMemDate(raw: unknown): string {
  if (!raw || typeof raw !== 'string') return ''
  try {
    return new Date(raw).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return raw }
}

function isMilestone(mem: ContentItem): boolean {
  const t = (mem.type as string) ?? ''
  const title = ((mem.title as string) ?? '').toLowerCase()
  return t === 'milestone' || ['proposal', 'engagement', 'wedding', 'anniversary', 'first meeting', 'first trip'].some(k => title.includes(k))
}

// Generate a smooth bezier path across the screen for the fate thread
function buildThreadPath(W: number, H: number): string {
  const y = H * 0.5
  // Gentle S-curve across full width
  return `M 0 ${y + 40}
    C ${W * 0.15} ${y - 60}, ${W * 0.3} ${y + 80}, ${W * 0.45} ${y}
    C ${W * 0.6} ${y - 70}, ${W * 0.75} ${y + 60}, ${W * 0.88} ${y - 20}
    L ${W} ${y - 10}`
}

// Sample evenly spaced points along a cubic bezier path
function samplePath(el: SVGPathElement, count: number): Array<{ x: number; y: number }> {
  const total = el.getTotalLength()
  return Array.from({ length: count }, (_, i) => {
    const pt = el.getPointAtLength((i / (count - 1)) * total)
    return { x: pt.x, y: pt.y }
  })
}

/* ─────────────────────────────────────────────────────────────────────
   MEMORY NOTE — a paper tag hanging from the thread
───────────────────────────────────────────────────────────────────── */

interface NoteProps {
  readonly mem: ContentItem
  readonly x: number
  readonly y: number
  readonly index: number
  readonly milestone: boolean
  readonly onSelect: (id: string) => void
}

function MemoryNote({ mem, x, y, index, milestone, onSelect }: NoteProps) {
  const [hov, setHov] = useState(false)
  const title = (mem.title as string) ?? 'Memory'
  const date  = formatMemDate(mem.date)
  const hangDir = index % 2 === 0 ? -1 : 1    // alternating up/down
  const hangLen = milestone ? 60 : 42 + (index % 3) * 12
  const noteY   = y + hangDir * hangLen

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ delay: 0.8 + index * 0.06, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Hanging string */}
      <motion.line
        x1={x} y1={y}
        x2={x} y2={noteY}
        stroke={milestone ? 'rgba(232,201,122,0.55)' : 'rgba(242,168,184,0.35)'}
        strokeWidth={milestone ? 1.2 : 0.8}
        strokeDasharray={milestone ? '' : '3 2'}
      />

      {/* Note paper — sway animation */}
      <motion.g
        style={{ cursor: 'pointer' }}
        animate={{
          rotate: [hangDir * -2, hangDir * 2, hangDir * -1.5, hangDir * 1.8, hangDir * -2],
          y: [0, -1.5, 1, -0.8, 0],
        }}
        transition={{
          duration: 4 + (index % 4) * 0.7,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: index * 0.15,
        }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        onClick={() => onSelect(mem.id)}
        transform={`translate(${x}, ${noteY})`}
      >
        {/* Note background */}
        <motion.rect
          x={milestone ? -52 : -40}
          y={hangDir === -1 ? -54 : 0}
          width={milestone ? 104 : 80}
          height={milestone ? 54 : 44}
          rx={4}
          fill={milestone ? 'rgba(255,248,220,0.16)' : 'rgba(255,248,235,0.1)'}
          stroke={milestone
            ? hov ? 'rgba(232,201,122,0.9)' : 'rgba(232,201,122,0.5)'
            : hov ? 'rgba(242,168,184,0.7)' : 'rgba(242,168,184,0.28)'}
          strokeWidth={milestone ? 1.5 : 0.8}
        />
        {/* Milestone star marker */}
        {milestone && (
          <motion.text
            x={0} y={hangDir === -1 ? -40 : 13}
            textAnchor="middle"
            style={{ fontSize: 11 }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✦
          </motion.text>
        )}
        {/* Title */}
        <text
          x={0}
          y={hangDir === -1 ? (milestone ? -25 : -26) : (milestone ? 28 : 18)}
          textAnchor="middle"
          fill={milestone
            ? hov ? 'rgba(255,240,180,1)' : 'rgba(245,235,180,0.88)'
            : hov ? 'rgba(255,235,245,1)' : 'rgba(240,230,248,0.78)'}
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontStyle: 'italic',
            fontSize: milestone ? 11.5 : 9.5,
          }}
        >
          {title.length > 16 ? `${title.slice(0, 15)}…` : title}
        </text>
        {/* Date */}
        {date && (
          <text
            x={0}
            y={hangDir === -1 ? (milestone ? -10 : -13) : (milestone ? 43 : 31)}
            textAnchor="middle"
            fill="rgba(201,191,232,0.55)"
            style={{ fontFamily: 'Inter, sans-serif', fontSize: 8, letterSpacing: '0.06em' }}
          >
            {date}
          </text>
        )}

        {/* Milestone glow halo */}
        {(milestone || hov) && (
          <motion.ellipse
            cx={0}
            cy={hangDir === -1 ? -27 : 22}
            rx={milestone ? 55 : 44}
            ry={milestone ? 32 : 26}
            fill="none"
            stroke={milestone ? 'rgba(232,201,122,0.4)' : 'rgba(242,168,184,0.35)'}
            strokeWidth={0.5}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          />
        )}

        {/* Milestone particles */}
        {milestone && (
          <>
            {[0, 1, 2, 3].map((j) => (
              <motion.circle
                key={j}
                cx={Math.cos((j / 4) * Math.PI * 2) * 38}
                cy={(hangDir === -1 ? -27 : 22) + Math.sin((j / 4) * Math.PI * 2) * 18}
                r={1.5}
                fill="rgba(232,201,122,0.8)"
                animate={{ opacity: [0, 0.9, 0], scale: [0.5, 1.2, 0.5] }}
                transition={{ duration: 2.5, delay: j * 0.4, repeat: Infinity }}
              />
            ))}
          </>
        )}
      </motion.g>
    </motion.g>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   SELECTED MEMORY DETAIL — unfolds like a letter
───────────────────────────────────────────────────────────────────── */

function MemoryDetail({
  mem,
  onClose,
}: {
  readonly mem: ContentItem
  readonly onClose: () => void
}) {
  const title   = (mem.title   as string) ?? 'Memory'
  const date    = formatMemDate(mem.date)
  const story   = (mem.story   as string) ?? ''
  const photoUrl = (mem.photoUrl as string) ?? ''

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, rotateX: -12 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      exit={{ opacity: 0, scale: 0.88, rotateX: 8 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 55,
        width: 'clamp(280px, 38vw, 460px)',
        maxHeight: '70vh',
        overflowY: 'auto',
        background: 'linear-gradient(160deg, rgba(14,10,32,0.96) 0%, rgba(8,6,22,0.98) 100%)',
        backdropFilter: 'blur(60px)',
        WebkitBackdropFilter: 'blur(60px)',
        border: '1px solid rgba(242,168,184,0.18)',
        borderRadius: 20,
        padding: '28px 28px 32px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset',
      }}
    >
      {/* Accent bar */}
      <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, rgba(232,201,122,0.8), transparent)', margin: '-28px -28px 22px', borderRadius: '20px 20px 0 0' }} />

      {/* Close */}
      <button
        onClick={onClose}
        style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', color: 'rgba(240,238,252,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
      >
        ×
      </button>

      {photoUrl && (
        <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', marginBottom: 18, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 300, fontSize: 22, color: '#f0eefc', lineHeight: 1.2, marginBottom: 8 }}>
        {title}
      </h2>
      {date && (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(232,201,122,0.7)', letterSpacing: '0.06em', marginBottom: 16 }}>
          {date}
        </p>
      )}
      {story && (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(240,238,252,0.65)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          {story}
        </p>
      )}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   FATE THREAD OVERLAY — the full cinematic timeline
───────────────────────────────────────────────────────────────────── */

export default function FateThreadOverlay() {
  const { timelineOpen, closeTimeline } = useUIStore()
  const { memories } = useContentStore()
  const [phase, setPhase] = useState<'idle' | 'particles' | 'thread'>('idle')
  const [selectedMem, setSelectedMem] = useState<ContentItem | null>(null)
  const [dimensions, setDimensions] = useState({ W: 1440, H: 900 })
  const pathRef = useRef<SVGPathElement>(null)
  const [nodePositions, setNodePositions] = useState<Array<{ x: number; y: number }>>([])

  // Drive phase transitions
  useEffect(() => {
    if (timelineOpen) {
      const t1 = setTimeout(() => setPhase('particles'), 400)
      const t2 = setTimeout(() => setPhase('thread'), 1200)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    } else {
      setPhase('idle')
      setSelectedMem(null)
    }
  }, [timelineOpen])

  // Measure viewport
  useEffect(() => {
    const update = () => setDimensions({ W: window.innerWidth, H: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Sample node positions along path after thread phase
  useEffect(() => {
    if (phase !== 'thread' || !pathRef.current) return
    const el = pathRef.current
    const count = Math.min(memories.length, 12) + 1  // +1 for future node
    const positions = samplePath(el, count)
    setNodePositions(positions)
  }, [phase, memories.length])

  const sortedMems = [...memories]
    .sort((a, b) => {
      const ta = a.date ? new Date(a.date as string).getTime() : 0
      const tb = b.date ? new Date(b.date as string).getTime() : 0
      return ta - tb
    })
    .slice(0, 12)

  const handleClose = useCallback(() => {
    setSelectedMem(null)
    closeTimeline()
  }, [closeTimeline])

  const { W, H } = dimensions
  const threadPath = buildThreadPath(W, H)

  // Board origin for particle origin (far right)
  const boardX = W * 0.88
  const boardY = H * 0.62

  return (
    <>
      <AnimatePresence>
        {timelineOpen && (
          <>
            {/* ── Dark backdrop ── */}
            <motion.div
              key="fate-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              onClick={() => !selectedMem && handleClose()}
              aria-hidden="true"
              style={{
                position: 'fixed', inset: 0, zIndex: 40,
                background: 'rgba(2,1,10,0.82)',
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
              }}
            />

            {/* ── Board zoom + chalk dissolve ── */}
            <motion.div
              key="board-zoom"
              initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              animate={
                phase === 'particles' || phase === 'thread'
                  ? { opacity: 0, scale: 2.2, x: W * 0.12, y: -H * 0.08 }
                  : { opacity: 1, scale: 1, x: 0, y: 0 }
              }
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden="true"
              style={{
                position: 'fixed',
                left: BOARD_LEFT,
                top: BOARD_TOP,
                transform: 'translate(-50%, -50%)',
                zIndex: 41,
                pointerEvents: 'none',
                width: BOARD_W,
                height: BOARD_H,
              }}
            >
              {/* Chalk text lines dissolve */}
              {['Dreams we\'re building', 'Travel the world', 'Our little home', 'Watch the aurora', 'Grow old together'].map((line, i) => (
                <motion.p
                  key={line}
                  initial={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  animate={phase !== 'idle' ? { opacity: 0, y: -20 + i * 4, filter: 'blur(6px)' } : {}}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  style={{
                    fontFamily: '"Playfair Display", Georgia, serif',
                    fontStyle: 'italic',
                    fontSize: 12,
                    color: 'rgba(245,238,210,0.6)',
                    textAlign: 'center',
                    margin: `${20 + i * 44}px 0 0`,
                    letterSpacing: '0.04em',
                  }}
                >
                  {line}
                </motion.p>
              ))}
            </motion.div>

            {/* ── Emerging thread particles ── */}
            <AnimatePresence>
              {(phase === 'particles' || phase === 'thread') && (
                <motion.div
                  key="thread-particles"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: phase === 'thread' ? 0 : 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: phase === 'thread' ? 0.3 : 0 }}
                  aria-hidden="true"
                  style={{ position: 'fixed', inset: 0, zIndex: 42, pointerEvents: 'none' }}
                >
                  <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
                    {Array.from({ length: 40 }, (_, i) => {
                      const destX = W * 0.1 + (W * 0.8 * i / 40)
                      const destY = H * 0.3 + Math.sin(i * 0.8) * H * 0.25
                      return (
                        <motion.circle
                          key={i}
                          cx={boardX} cy={boardY} r={2.5}
                          fill={i % 3 === 0 ? 'rgba(232,201,122,0.9)' : i % 3 === 1 ? 'rgba(242,168,184,0.8)' : 'rgba(201,191,232,0.7)'}
                          initial={{ cx: boardX, cy: boardY, opacity: 0.9, r: 2.5 }}
                          animate={{ cx: destX, cy: destY, opacity: 0, r: 1 }}
                          transition={{ duration: 0.9, delay: i * 0.018, ease: 'easeOut' }}
                        />
                      )
                    })}
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Fate thread + memory nodes ── */}
            <AnimatePresence>
              {phase === 'thread' && (
                <motion.div
                  key="fate-thread"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ position: 'fixed', inset: 0, zIndex: 43, pointerEvents: 'none' }}
                >
                  <svg
                    width={W}
                    height={H}
                    style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
                  >
                    <defs>
                      {/* Glowing thread gradient */}
                      <linearGradient id="threadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%"   stopColor="rgba(242,168,184,0.8)" />
                        <stop offset="35%"  stopColor="rgba(232,201,122,0.95)" />
                        <stop offset="65%"  stopColor="rgba(201,191,232,0.9)" />
                        <stop offset="100%" stopColor="rgba(168,216,160,0.6)" />
                      </linearGradient>
                      <filter id="threadGlow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                      </filter>
                    </defs>

                    {/* Past thread — solid glowing line */}
                    <motion.path
                      ref={pathRef}
                      d={threadPath}
                      fill="none"
                      stroke="url(#threadGrad)"
                      strokeWidth={2.5}
                      filter="url(#threadGlow)"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.8, ease: 'easeInOut' }}
                    />

                    {/* Thread glow bloom */}
                    <motion.path
                      d={threadPath}
                      fill="none"
                      stroke="rgba(232,201,122,0.15)"
                      strokeWidth={18}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 2, ease: 'easeInOut', delay: 0.1 }}
                    />

                    {/* Future path — dashed, dimmer */}
                    <motion.path
                      d={`M ${W * 0.88} ${H * 0.5 - 20} C ${W * 0.94} ${H * 0.5 - 50} ${W * 0.97} ${H * 0.5} ${W} ${H * 0.5 - 15}`}
                      fill="none"
                      stroke="rgba(201,191,232,0.45)"
                      strokeWidth={1.5}
                      strokeDasharray="6 8"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.2, ease: 'easeInOut', delay: 1.8 }}
                    />

                    {/* Future label */}
                    <motion.text
                      x={W - 80}
                      y={H * 0.5 - 32}
                      textAnchor="middle"
                      fill="rgba(201,191,232,0.45)"
                      style={{ fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic', fontSize: 11 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2.8, duration: 0.8 }}
                    >
                      still unwritten…
                    </motion.text>

                    {/* Memory nodes — render after path is sampled */}
                    {nodePositions.length > 0 && sortedMems.map((mem, i) => {
                      const pos = nodePositions[i]
                      if (!pos) return null
                      return (
                        <MemoryNote
                          key={mem.id}
                          mem={mem}
                          x={pos.x}
                          y={pos.y}
                          index={i}
                          milestone={isMilestone(mem)}
                          onSelect={(id) => {
                            const found = memories.find(m => m.id === id) ?? null
                            setSelectedMem(found)
                          }}
                        />
                      )
                    })}

                    {/* Thread origin star at board */}
                    <motion.circle
                      cx={0} cy={H * 0.5 + 40} r={5}
                      fill="rgba(232,201,122,0.9)"
                      filter="url(#threadGlow)"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0.8] }}
                      transition={{ delay: 0.2, duration: 0.8 }}
                    />
                  </svg>

                  {/* Close hint */}
                  <motion.button
                    onClick={handleClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5 }}
                    style={{
                      position: 'fixed', top: 28, right: 36, zIndex: 44,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12, padding: '7px 18px',
                      cursor: 'pointer', pointerEvents: 'auto',
                      color: 'rgba(240,238,252,0.55)',
                      fontFamily: '"Playfair Display", Georgia, serif',
                      fontStyle: 'italic', fontSize: 13,
                      backdropFilter: 'blur(20px)',
                    }}
                    whileHover={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(240,238,252,0.85)' }}
                    whileTap={{ scale: 0.96 }}
                    aria-label="Return to garden"
                  >
                    return to garden
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>

      {/* ── Selected memory detail — unfolds above timeline ── */}
      <AnimatePresence>
        {selectedMem && (
          <>
            <motion.div
              key="detail-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedMem(null)}
              style={{ position: 'fixed', inset: 0, zIndex: 54, background: 'rgba(0,0,0,0.4)' }}
              aria-hidden="true"
            />
            <MemoryDetail mem={selectedMem} onClose={() => setSelectedMem(null)} />
          </>
        )}
      </AnimatePresence>
    </>
  )
}
