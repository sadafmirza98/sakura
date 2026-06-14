'use client'
/**
 * MobileQuickActions — small floating buttons that open the memory book
 * and the story timeline on narrow viewports.
 *
 * On mobile, the hero background is cropped by `background-size: cover`
 * so the painted book and board (and their invisible hitzones) fall
 * outside the visible frame. These buttons give the same actions a
 * reachable, always-visible home on small screens.
 */

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Sparkles } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'

const pillStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '13px 20px',
  borderRadius: 999,
  background: 'linear-gradient(160deg, rgba(8,5,22,0.82) 0%, rgba(4,3,14,0.88) 100%)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
  color: 'rgba(255,248,225,0.92)',
}

const labelStyle: React.CSSProperties = {
  fontFamily: '"Playfair Display", Georgia, serif',
  fontStyle: 'italic',
  fontSize: 13,
  letterSpacing: '0.04em',
}

export default function MobileQuickActions() {
  const [isMobile, setIsMobile] = useState(false)
  const {
    rightPanel, bloomOpen, toggleBloom,
    timelineOpen, openTimeline, closeTimeline,
  } = useUIStore()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (!isMobile) return null

  const hidden = rightPanel !== null || bloomOpen || timelineOpen

  return (
    <motion.div
      animate={{ opacity: hidden ? 0 : 1, y: hidden ? 16 : 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 'max(20px, env(safe-area-inset-bottom))',
        zIndex: 30,
        display: 'flex',
        justifyContent: 'center',
        gap: 12,
        padding: '0 16px',
        pointerEvents: hidden ? 'none' : 'auto',
      }}
    >
      <button
        onClick={toggleBloom}
        aria-label={bloomOpen ? 'Close our memories' : 'Open our memories'}
        aria-expanded={bloomOpen}
        style={{ ...pillStyle, cursor: 'pointer', outline: 'none' }}
      >
        <BookOpen size={16} style={{ color: 'rgba(255,224,150,0.9)' }} />
        <span style={labelStyle}>Memories</span>
      </button>
      <button
        onClick={() => (timelineOpen ? closeTimeline() : openTimeline())}
        aria-label={timelineOpen ? 'Close timeline' : 'Open our story timeline'}
        aria-expanded={timelineOpen}
        style={{ ...pillStyle, cursor: 'pointer', outline: 'none' }}
      >
        <Sparkles size={16} style={{ color: 'rgba(242,168,184,0.9)' }} />
        <span style={labelStyle}>Our Story</span>
      </button>
    </motion.div>
  )
}
