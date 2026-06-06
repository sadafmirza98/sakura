'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore, type CreateType } from '@/store/useUIStore'
import { Plus } from 'lucide-react'
import { useState } from 'react'

const ITEMS: { type: CreateType; emoji: string; label: string; color: string }[] = [
  { type: 'memory',    emoji: '🌸', label: 'Memory',    color: '#f2a8b8' },
  { type: 'song',      emoji: '🏮', label: 'Song',      color: '#ffb450' },
  { type: 'poem',      emoji: '🪷', label: 'Petal',     color: '#c9bfe8' },
  { type: 'whisper',   emoji: '🍃', label: 'Whisper',   color: '#a8d8a0' },
  { type: 'wish',      emoji: '⭐', label: 'Wish',      color: '#e8c97a' },
  { type: 'place',     emoji: '📍', label: 'Place',     color: '#a8d0e8' },
  { type: 'letter',    emoji: '🕊️', label: 'Letter',    color: '#d4aaff' },
  { type: 'milestone', emoji: '🕯️', label: 'Milestone', color: '#ffd090' },
]

export default function QuickCreateDock() {
  const { openCreate } = useUIStore()
  const [open, setOpen] = useState(false)

  const handleItem = (type: CreateType) => {
    openCreate(type)   // opens right panel as create form
    setOpen(false)
  }

  return (
    <motion.div
      className="fixed bottom-6 left-1/2 z-40 flex flex-col items-center"
      style={{ transform: 'translateX(-50%)' }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Expanded dock items */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="flex items-end gap-2 mb-4"
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {ITEMS.map(({ type, emoji, label, color }, i) => (
              <motion.button
                key={type}
                className="dock-pill"
                initial={{ opacity: 0, y: 20, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.7 }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 340, damping: 22 }}
                onClick={() => { handleItem(type) }}
                title={label}
              >
                <span style={{ fontSize: 22, lineHeight: 1 }}>{emoji}</span>
                <span className="font-sans" style={{
                  fontSize: 10, color: 'rgba(240,238,252,0.5)',
                  letterSpacing: '0.04em', fontWeight: 400,
                }}>
                  {label}
                </span>
                {/* Hover glow */}
                <motion.div
                  className="absolute inset-0 rounded-[18px] pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 50% 80%, ${color}18 0%, transparent 70%)` }}
                />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main dock button — glass lantern */}
      <motion.button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 24px',
          borderRadius: 100,
          background: open
            ? 'linear-gradient(135deg, rgba(242,168,184,0.2), rgba(201,150,170,0.16))'
            : 'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.04))',
          border: open
            ? '1px solid rgba(242,168,184,0.38)'
            : '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          boxShadow: open
            ? '0 0 40px rgba(242,168,184,0.2), 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset'
            : '0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04) inset',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
        whileHover={{
          scale: 1.04,
          boxShadow: '0 0 50px rgba(242,168,184,0.22), 0 12px 40px rgba(0,0,0,0.55)',
        }}
        whileTap={{ scale: 0.97 }}
      >
        {/* Shimmer overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)',
          borderRadius: 100, pointerEvents: 'none',
        }} />

        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          style={{ color: open ? '#f2a8b8' : 'rgba(240,238,252,0.7)', display: 'flex' }}
        >
          <Plus size={17} strokeWidth={2} />
        </motion.div>

        <span className="font-sans" style={{
          fontSize: 14, fontWeight: 300, letterSpacing: '0.04em',
          color: open ? '#f2a8b8' : 'rgba(240,238,252,0.75)',
          transition: 'color 0.3s',
        }}>
          Add to our story
        </span>

        {/* Lantern emoji with glow */}
        <motion.span
          style={{ fontSize: 15, lineHeight: 1, filter: 'drop-shadow(0 0 6px rgba(255,180,80,0.6))' }}
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          🏮
        </motion.span>
      </motion.button>
    </motion.div>
  )
}
