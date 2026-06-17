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

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore, type RightPanelType } from '@/store/useUIStore'
import { useContentStore, type ContentItem } from '@/store/useContentStore'

/* ─────────────────────────────────────────────────────────────────────
   BOARD POSITION — matches the wooden board on the far right
───────────────────────────────────────────────────────────────────── */
const BOARD_LEFT  = '90%'
const BOARD_TOP   = '72%'
const BOARD_W     = 180     // px
const BOARD_H     = 340     // px

/* ─────────────────────────────────────────────────────────────────────
   BOARD AMBIENT
   Idle magical notes that briefly appear on the board
───────────────────────────────────────────────────────────────────── */

const IDLE_NOTES = ['06 Dec 2020', 'First Conversation', 'Engagement']

const chalkTextStyle: React.CSSProperties = {
  fontFamily: '"Playfair Display", Georgia, serif',
  fontStyle: 'italic',
  fontSize: 13,
  letterSpacing: '0.04em',
  color: 'rgba(245,238,210,0.6)',
  textShadow: '0 0 16px rgba(232,201,122,0.5)',
  whiteSpace: 'nowrap',
  display: 'block',
  textAlign: 'center',
  position: 'absolute',
  top: '18%',
  left: '50%',
  transform: 'translateX(-50%)',
}

export function BoardAmbient() {
  const { timelineOpen, boardHovered } = useUIStore()
  const [noteVisible, setNoteVisible] = useState(false)
  const [noteText, setNoteText] = useState(IDLE_NOTES[0])
  const noteIndexRef = useRef(0)

  useEffect(() => {
    if (timelineOpen) return
    const tick = () => {
      setNoteText(IDLE_NOTES[noteIndexRef.current])
      setNoteVisible(true)
      setTimeout(() => {
        setNoteVisible(false)
        noteIndexRef.current = (noteIndexRef.current + 1) % IDLE_NOTES.length
      }, 2200)
    }
    tick()
    const id = setInterval(tick, 10000)
    return () => clearInterval(id)
  }, [timelineOpen])

  return (
    <div
      aria-hidden="true"
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
        animate={{ opacity: boardHovered && !timelineOpen ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'absolute',
          inset: '-30% -20%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(232,201,122,0.28) 0%, rgba(255,180,80,0.1) 50%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Lantern brightening overlay — targets the painted lantern above-left of board */}
      <motion.div
        aria-hidden="true"
        animate={{ opacity: boardHovered && !timelineOpen ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute',
          left: -60,
          top: -120,
          width: 80,
          height: 110,
          borderRadius: '50%',
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 60%, rgba(255,220,100,0.38) 0%, rgba(232,201,122,0.14) 55%, transparent 100%)',
        }}
      />

      {/* Idle note — rotates through IDLE_NOTES */}
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
              {noteText}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chalk text — "Dreams we're building" when idle, "Our Story So Far" on hover */}
      <AnimatePresence>
        {boardHovered && !timelineOpen && (
          <motion.span
            key="chalk-b"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ ...chalkTextStyle, color: 'rgba(245,238,210,0.9)', textShadow: '0 0 20px rgba(232,201,122,0.8)' }}
          >
            Our Story So Far
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   BOARD HIT ZONE
───────────────────────────────────────────────────────────────────── */

export function BoardHitZone() {
  const { timelineOpen, openTimeline, closeTimeline, setBoardHovered } = useUIStore()

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
        onMouseEnter={() => setBoardHovered(true)}
        onMouseLeave={() => setBoardHovered(false)}
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
  if (t === 'timeline-event') return false
  const title = ((mem.title as string) ?? '').toLowerCase()
  return t === 'milestone'
    || !!(mem.isMilestone as boolean)
    || ['proposal', 'engagement', 'wedding', 'anniversary', 'first meeting', 'first trip'].some(k => title.includes(k))
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
  if (count <= 0) return []
  if (count === 1) {
    const pt = el.getPointAtLength(0)
    return [{ x: pt.x, y: pt.y }]
  }
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
      <g transform={`translate(${x}, ${noteY})`}>
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
        {/* Milestone ribbon */}
        {milestone && (
          <>
            <rect
              x={-52} y={hangDir === -1 ? -54 : 0}
              width={104} height={8}
              rx={2}
              fill="rgba(232,201,122,0.35)"
            />
            <rect
              x={-52} y={hangDir === -1 ? -48 : 6}
              width={104} height={2}
              fill="rgba(232,201,122,0.55)"
            />
          </>
        )}
        {/* Milestone icon — memories.png via SVG image */}
        {milestone && (
          <image
            href="/assets/ui/memories.png"
            x={-8}
            y={hangDir === -1 ? -46 : 6}
            width={16}
            height={16}
            preserveAspectRatio="xMidYMid meet"
          />
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
      </g>
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 55,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        pointerEvents: 'none',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, rotateX: -12 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        exit={{ opacity: 0, scale: 0.88, rotateX: 8 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          pointerEvents: 'auto',
          width: 'min(460px, 100%)',
          maxHeight: '80vh',
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
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   MEMORY SPOOL — golden spool at start of thread to create new memories
───────────────────────────────────────────────────────────────────── */

interface SpoolProps {
  readonly x: number
  readonly y: number
  readonly onWeave: () => void
}

function MemorySpool({ x, y, onWeave }: SpoolProps) {
  const [hov, setHov] = useState(false)
  const [unravelling, setUnravelling] = useState(false)

  const handleClick = () => {
    if (unravelling) return
    setUnravelling(true)
    setTimeout(onWeave, 550)
  }

  return (
    <g transform={`translate(${x}, ${y})`}>
    <motion.g
      animate={{ scale: unravelling ? 0 : 1, opacity: unravelling ? 0 : 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 1, 1] }}
      style={{ cursor: 'pointer' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={handleClick}
    >
      {/* Outer glow */}
      <motion.circle
        r={28}
        fill="transparent"
        animate={{ opacity: hov ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ filter: 'blur(8px)' }}
      />
      {/* Outer ring */}
      <circle r={18} fill="rgba(255,248,220,0.12)" stroke="rgba(232,201,122,0.7)" strokeWidth={1.2} />
      {/* Middle ring — sakura dashed */}
      <circle r={12} fill="transparent" stroke="rgba(242,168,184,0.55)" strokeWidth={1} strokeDasharray="4 3" />
      {/* Inner ring */}
      <circle r={6} fill="transparent" stroke="rgba(232,201,122,0.8)" strokeWidth={1.2} />
      {/* Centre dot */}
      <motion.circle
        r={3}
        fill="rgba(232,201,122,0.95)"
        animate={{ scale: hov ? [1, 1.4, 1] : 1 }}
        transition={{ duration: 1.2, repeat: hov ? Infinity : 0 }}
      />
      {/* Hover particles */}
      {hov && [0, 1, 2, 3, 4, 5].map((j) => (
        <motion.circle
          key={j}
          r={1.5}
          fill="rgba(242,168,184,0.7)"
          initial={{ x: 0, y: 0, opacity: 0.9 }}
          animate={{
            x: Math.cos((j / 6) * Math.PI * 2) * 26,
            y: Math.sin((j / 6) * Math.PI * 2) * 26,
            opacity: 0,
          }}
          transition={{ duration: 1.2, delay: j * 0.1, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
      {/* Label */}
      <AnimatePresence>
        {hov && (
          <motion.text
            y={32}
            textAnchor="middle"
            fill="rgba(232,201,122,0.9)"
            style={{ fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic', fontSize: 11, pointerEvents: 'none' }}
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 32 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            Weave New Memory
          </motion.text>
        )}
      </AnimatePresence>
    </motion.g>
    </g>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   BLANK NOTE EDITOR — parchment paper in-place memory creator
───────────────────────────────────────────────────────────────────── */

interface BlankNoteEditorProps {
  readonly onSave: () => void
  readonly onCancel: () => void
}

function BlankNoteEditor({ onSave, onCancel }: BlankNoteEditorProps) {
  const { add } = useContentStore()
  const songs  = useContentStore(s => s.songs)
  const places = useContentStore(s => s.places)

  const [title, setTitle]         = useState('')
  const [date, setDate]           = useState('')
  const [story, setStory]         = useState('')
  const [tags, setTags]           = useState('')
  const [relatedSong, setRelatedSong]   = useState('')
  const [relatedPlace, setRelatedPlace] = useState('')
  const [isMilestoneToggle, setIsMilestoneToggle] = useState(false)
  const [saving, setSaving]       = useState(false)

  const inkStyle: React.CSSProperties = {
    width: '100%', background: 'transparent', border: 'none',
    borderBottom: '1px solid rgba(160,120,60,0.3)', outline: 'none',
    color: 'rgba(40,30,10,0.85)', fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: 14, padding: '6px 2px', marginBottom: 12,
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 9, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: 'rgba(100,80,40,0.55)', marginBottom: 4,
  }

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      await add('memories', {
        title: title.trim() || 'Untitled Memory',
        date,
        story,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        relatedSong: relatedSong || undefined,
        relatedPlace: relatedPlace || undefined,
        isMilestone: isMilestoneToggle,
        type: isMilestoneToggle ? 'milestone' : 'memory',
      })
      onSave()
    } catch {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        pointerEvents: 'none',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, rotateX: -12 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        exit={{ opacity: 0, scale: 0.75, rotateX: 12, y: 20 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          pointerEvents: 'auto',
          width: 'min(520px, 100%)',
          maxHeight: '85vh', overflowY: 'auto',
          background: 'linear-gradient(165deg, rgba(255,250,235,0.97) 0%, rgba(250,244,220,0.99) 100%)',
          backgroundImage: `
            linear-gradient(165deg, rgba(255,250,235,0.97) 0%, rgba(250,244,220,0.99) 100%),
            repeating-linear-gradient(transparent, transparent 27px, rgba(200,170,100,0.12) 27px, rgba(200,170,100,0.12) 28px)
          `,
          border: '1px solid rgba(200,170,100,0.35)',
          borderRadius: 6,
          boxShadow: '0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(232,201,122,0.2)',
          padding: '28px 32px 32px',
          perspective: 600,
        }}
      >
        {/* Paper fold top-right */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 0, height: 0,
          borderLeft: '22px solid rgba(200,170,100,0.3)',
          borderBottom: '22px solid transparent',
        }} />

        <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic', fontSize: 17, color: 'rgba(80,50,20,0.8)', marginBottom: 20, textAlign: 'center' }}>
          A new memory…
        </p>

        <label htmlFor="bn-title" style={labelStyle}>Memory Title</label>
        <input id="bn-title" style={inkStyle} placeholder="Name this memory…" value={title} onChange={e => setTitle(e.target.value)} />

        <label htmlFor="bn-date" style={labelStyle}>Date</label>
        <input id="bn-date" style={{ ...inkStyle, fontFamily: 'Inter, sans-serif', fontSize: 13 }} type="date" value={date} onChange={e => setDate(e.target.value)} />

        <label htmlFor="bn-story" style={labelStyle}>Story</label>
        <textarea
          id="bn-story"
          style={{ ...inkStyle, resize: 'none', lineHeight: 1.8, minHeight: 90, borderBottom: 'none', border: '1px solid rgba(160,120,60,0.2)', borderRadius: 4, padding: '6px 8px' }}
          rows={4}
          placeholder="What do you want to remember forever…"
          value={story}
          onChange={e => setStory(e.target.value)}
        />

        <label htmlFor="bn-tags" style={{ ...labelStyle, marginTop: 12 }}>Tags</label>
        <input id="bn-tags" style={{ ...inkStyle, fontFamily: 'Inter, sans-serif', fontSize: 12 }} placeholder="first times, rain, laughter…" value={tags} onChange={e => setTags(e.target.value)} />

        {songs.length > 0 && (
          <>
            <label htmlFor="bn-song" style={labelStyle}>Related Song</label>
            <select id="bn-song" style={{ ...inkStyle, fontFamily: 'Inter, sans-serif', fontSize: 12, cursor: 'pointer' }} value={relatedSong} onChange={e => setRelatedSong(e.target.value)}>
              <option value="">None</option>
              {songs.map(s => <option key={s.id} value={s.id}>{(s.title as string) ?? s.id}</option>)}
            </select>
          </>
        )}

        {places.length > 0 && (
          <>
            <label htmlFor="bn-place" style={labelStyle}>Related Place</label>
            <select id="bn-place" style={{ ...inkStyle, fontFamily: 'Inter, sans-serif', fontSize: 12, cursor: 'pointer' }} value={relatedPlace} onChange={e => setRelatedPlace(e.target.value)}>
              <option value="">None</option>
              {places.map(p => <option key={p.id} value={p.id}>{(p.place as string) ?? (p.name as string) ?? p.id}</option>)}
            </select>
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
          <input
            id="milestone-toggle"
            type="checkbox"
            checked={isMilestoneToggle}
            onChange={e => setIsMilestoneToggle(e.target.checked)}
            style={{ accentColor: '#e8c97a', width: 16, height: 16, cursor: 'pointer' }}
          />
          <label htmlFor="milestone-toggle" style={{ ...labelStyle, textTransform: 'none', fontSize: 12, letterSpacing: '0.04em', marginBottom: 0, cursor: 'pointer', color: 'rgba(100,80,40,0.7)' }}>
            This is a milestone
          </label>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <motion.button
            type="button"
            onClick={handleSave}
            disabled={saving}
            whileHover={{ opacity: 0.9 }}
            whileTap={{ scale: 0.97 }}
            style={{
              flex: 1, padding: '11px 16px', borderRadius: 4, cursor: saving ? 'not-allowed' : 'pointer',
              background: 'rgba(200,150,60,0.15)', border: '1px solid rgba(200,150,60,0.4)',
              color: 'rgba(100,70,20,0.85)', fontFamily: '"Playfair Display", Georgia, serif',
              fontStyle: 'italic', fontSize: 13, opacity: saving ? 0.6 : 1,
            }}
          >
            Fold this memory into our story
          </motion.button>
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ opacity: 0.7 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '11px 16px', borderRadius: 4, cursor: 'pointer',
              background: 'transparent', border: '1px solid rgba(160,120,60,0.25)',
              color: 'rgba(100,80,40,0.5)', fontSize: 12, fontFamily: 'Inter, sans-serif',
            }}
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   STORY ITEMS LIST
   Compact horizontal strip shown at the bottom of the thread overlay.
   Lists every saved item (poems, letters, wishes, places, songs,
   memories) sorted by creation date. Clicking an item closes the
   timeline and opens the appropriate view panel.
───────────────────────────────────────────────────────────────────── */

interface StoryEntry {
  id: string
  panelType: string
  title: string
  accent: string
  icon: string
  label: string
  createdAt: string
}

const STORY_CFG = {
  poems:    { label: 'Poem',   icon: '/assets/ui/letter.png',   accent: '#c9bfe8', panelType: 'poem',   getTitle: (i: ContentItem) => (i.title   as string) || 'Poem'   },
  letters:  { label: 'Letter', icon: '/assets/ui/letter.png',   accent: '#d4aaff', panelType: 'letter', getTitle: (i: ContentItem) => (i.openWhen as string) || 'Letter' },
  wishes:   { label: 'Wish',   icon: '/assets/ui/lantern.png',  accent: '#a8d8a0', panelType: 'wish',   getTitle: (i: ContentItem) => (i.wish     as string) || 'Wish'   },
  places:   { label: 'Place',  icon: '/assets/ui/map.png',      accent: '#ffe890', panelType: 'place',  getTitle: (i: ContentItem) => (i.place    as string) || 'Place'  },
  songs:    { label: 'Song',   icon: '/assets/ui/petal.png',    accent: '#ffb450', panelType: 'song',   getTitle: (i: ContentItem) => (i.title    as string) || 'Song'   },
  memories: { label: 'Memory', icon: '/assets/ui/memories.png', accent: '#f2a8b8', panelType: 'memory', getTitle: (i: ContentItem) => (i.title    as string) || 'Memory' },
} as const

type StoryKey = keyof typeof STORY_CFG

function StoryItemsList() {
  const { poems, letters, wishes, places, songs, memories } = useContentStore()
  const { closeTimeline, openRightPanel } = useUIStore()

  const allItems = useMemo((): StoryEntry[] => {
    const pairs: [StoryKey, ContentItem[]][] = [
      ['memories', memories], ['poems', poems], ['letters', letters],
      ['wishes', wishes], ['places', places], ['songs', songs],
    ]
    return pairs
      .flatMap(([key, items]) => {
        const cfg = STORY_CFG[key]
        return items.map((item): StoryEntry => ({
          id: item.id,
          panelType: cfg.panelType,
          title: cfg.getTitle(item),
          accent: cfg.accent,
          icon: cfg.icon,
          label: cfg.label,
          createdAt: (item.createdAt as string) ?? '',
        }))
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [poems, letters, wishes, places, songs, memories])

  if (allItems.length === 0) return null

  const handleSelect = (panelType: string, id: string) => {
    closeTimeline()
    openRightPanel(panelType as RightPanelType, { id })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 28 }}
      transition={{ delay: 2.2, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 44,
        background: 'linear-gradient(0deg, rgba(4,2,18,0.96) 0%, rgba(4,2,18,0.72) 65%, transparent 100%)',
        padding: 'clamp(14px, 2vh, 22px) clamp(14px, 2.5vw, 28px) clamp(18px, 3vh, 28px)',
        pointerEvents: 'auto',
      }}
    >
      {/* Header */}
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 9,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: 'rgba(201,191,232,0.35)',
        marginBottom: 10,
        paddingLeft: 2,
      }}>
        Our story · {allItems.length} {allItems.length === 1 ? 'moment' : 'moments'}
      </p>

      {/* Horizontal scroll strip */}
      <div style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 2,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}>
        {allItems.map((entry) => (
          <motion.button
            key={`${entry.panelType}-${entry.id}`}
            onClick={() => handleSelect(entry.panelType, entry.id)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{
              flexShrink: 0,
              width: 'clamp(108px, 16vw, 152px)',
              padding: '9px 11px',
              borderRadius: 11,
              background: `${entry.accent}0c`,
              border: `1px solid ${entry.accent}20`,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              outline: 'none',
            }}
          >
            {/* Type chip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={entry.icon}
                alt=""
                aria-hidden="true"
                style={{ width: 13, height: 13, objectFit: 'contain', opacity: 0.7, filter: `drop-shadow(0 0 3px ${entry.accent}88)` }}
              />
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 8.5,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: entry.accent,
                opacity: 0.6,
              }}>
                {entry.label}
              </span>
            </div>

            {/* Title */}
            <p style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontStyle: 'italic',
              fontSize: 11.5,
              color: 'rgba(240,238,252,0.82)',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
              margin: 0,
            }}>
              {entry.title}
            </p>

            {/* Date */}
            {entry.createdAt && (
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 8,
                color: 'rgba(201,191,232,0.28)',
                letterSpacing: '0.04em',
              }}>
                {new Date(entry.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   FATE THREAD OVERLAY — the full cinematic timeline
───────────────────────────────────────────────────────────────────── */

export default function FateThreadOverlay() {
  const { timelineOpen, closeTimeline } = useUIStore()
  const { memories } = useContentStore()
  const [phase, setPhase] = useState<'idle' | 'darkening' | 'zoom' | 'particles' | 'thread'>('idle')
  const [selectedMem, setSelectedMem] = useState<ContentItem | null>(null)
  const [creatingMemory, setCreatingMemory] = useState(false)
  const [threadPulsing, setThreadPulsing] = useState(false)
  const [dimensions, setDimensions] = useState({ W: 1440, H: 900 })
  const pathRef = useRef<SVGPathElement>(null)
  const [nodePositions, setNodePositions] = useState<Array<{ x: number; y: number }>>([])

  // Drive phase transitions
  useEffect(() => {
    if (timelineOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase('darkening')
      const t1 = setTimeout(() => setPhase('zoom'),      300)
      const t2 = setTimeout(() => setPhase('particles'), 800)
      const t3 = setTimeout(() => setPhase('thread'),   1400)
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    } else {
      setPhase('idle')
      setSelectedMem(null)
      setCreatingMemory(false)
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
  // Sample N+2 points (including both path endpoints), then drop the
  // endpoints so memory notes sit inside the visible thread — never
  // anchored to x=0 / x=W where their paper would spill off-screen.
  useEffect(() => {
    if (phase !== 'thread' || !pathRef.current) return
    const el = pathRef.current
    const count = Math.min(memories.length, 12) + 2
    const margin = 55 // half-width of a milestone note + its glow halo
    const maxX = window.innerWidth - margin
    const positions = samplePath(el, count)
      .slice(1, -1)
      .map((p) => ({ ...p, x: Math.min(Math.max(p.x, margin), maxX) }))
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

  const handleMemorySaved = useCallback(() => {
    setCreatingMemory(false)
    setThreadPulsing(true)
    setTimeout(() => setThreadPulsing(false), 1200)
  }, [])

  const { W, H } = dimensions
  const threadPath = buildThreadPath(W, H)

  // Board origin matches updated constants
  const boardX = W * 0.95
  const boardY = H * 0.72

  // Spool position — centre-top, always reachable regardless of thread layout
  const spoolX = W * 0.5
  const spoolY = H * 0.2

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
              onClick={() => !selectedMem && !creatingMemory && handleClose()}
              aria-hidden="true"
              style={{
                position: 'fixed', inset: 0, zIndex: 40,
                background: 'rgba(2,1,10,0.82)',
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
                cursor: 'default',
              }}
            />

            {/* ── Board zoom + 3D swing + chalk dissolve ── */}
            <div style={{ perspective: 800, perspectiveOrigin: '50% 50%', position: 'fixed', inset: 0, zIndex: 41, pointerEvents: 'none' }}>
              <motion.div
                key="board-zoom"
                initial={{ opacity: 1, scale: 1, rotateY: 0, x: 0, y: 0 }}
                animate={
                  phase === 'zoom'
                    ? { opacity: 0.85, scale: 1.6, rotateY: 12, x: W * 0.06, y: -H * 0.04 }
                    : phase === 'particles' || phase === 'thread'
                    ? { opacity: 0,    scale: 2.2, rotateY: 20, x: W * 0.12, y: -H * 0.08 }
                    : { opacity: 1,    scale: 1,   rotateY: 0,  x: 0,         y: 0 }
                }
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                transformTemplate={(_, generated) => `translate(-50%, -50%) ${generated}`}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: BOARD_LEFT,
                  top: BOARD_TOP,
                  width: BOARD_W,
                  height: BOARD_H,
                  transformStyle: 'preserve-3d',
                }}
              >
                {['Travel the world', 'Our little home', 'Watch the aurora', 'Grow old together'].map((line, i) => (
                  <motion.p
                    key={line}
                    initial={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    animate={phase !== 'idle' && phase !== 'darkening' ? { opacity: 0, y: -20 + i * 4, filter: 'blur(6px)' } : {}}
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
            </div>

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

            {/* ── Fate thread + memory nodes + spool ── */}
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
                    style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'auto' }}
                  >
                    <defs>
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

                    {/* Past thread */}
                    <motion.path
                      ref={pathRef}
                      d={threadPath}
                      fill="none"
                      stroke="url(#threadGrad)"
                      strokeWidth={2.5}
                      filter="url(#threadGlow)"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{
                        pathLength: 1,
                        opacity: 1,
                        filter: threadPulsing
                          ? [
                              'drop-shadow(0 0 4px rgba(242,168,184,0.6))',
                              'drop-shadow(0 0 20px rgba(232,201,122,1.0)) drop-shadow(0 0 40px rgba(242,168,184,0.7))',
                              'drop-shadow(0 0 4px rgba(242,168,184,0.6))',
                            ]
                          : 'drop-shadow(0 0 3px rgba(242,168,184,0.3))',
                      }}
                      transition={{ duration: threadPulsing ? 1.2 : 1.8, ease: 'easeInOut' }}
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

                    {/* Future path */}
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

                    <motion.text
                      x={W - 80} y={H * 0.5 - 32}
                      textAnchor="middle"
                      fill="rgba(201,191,232,0.45)"
                      style={{ fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic', fontSize: 11 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2.8, duration: 0.8 }}
                    >
                      still unwritten…
                    </motion.text>

                    {/* Memory nodes */}
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

                    {/* Spool — new memory entry point, always visible */}
                    {!creatingMemory && (
                      <MemorySpool
                        x={spoolX}
                        y={spoolY}
                        onWeave={() => setCreatingMemory(true)}
                      />
                    )}

                    {/* Thread origin star */}
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
                    Return to garden
                  </motion.button>

                  {/* All saved content — scrollable strip at the bottom */}
                  <StoryItemsList />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>

      {/* ── Blank note editor — in-place paper ── */}
      <AnimatePresence>
        {creatingMemory && (
          <BlankNoteEditor
            onSave={handleMemorySaved}
            onCancel={() => setCreatingMemory(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Selected memory detail ── */}
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
