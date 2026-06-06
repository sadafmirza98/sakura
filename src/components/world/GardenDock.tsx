'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useUIStore, type CreateType } from '@/store/useUIStore'

interface DockItem {
  readonly type: CreateType
  readonly emoji: string
  readonly label: string
  readonly accent: string
}

// Layout order per spec: Memory · Dream · Place · Song · Poem · Wish · Letter
const ITEMS: DockItem[] = [
  { type: 'memory',    emoji: '🌸', label: 'Memory',    accent: '#f2a8b8' },
  { type: 'milestone', emoji: '🏮', label: 'Dream',     accent: '#ffb450' },
  { type: 'place',     emoji: '📍', label: 'Place',     accent: '#a8d0e8' },
  { type: 'song',      emoji: '🍃', label: 'Song',      accent: '#a8d8a0' },
  { type: 'poem',      emoji: '⭐', label: 'Poem',      accent: '#c9bfe8' },
  { type: 'wish',      emoji: '🌺', label: 'Wish',      accent: '#f2a8b8' },
  { type: 'letter',    emoji: '💌', label: 'Letter',    accent: '#d4aaff' },
]

export default function GardenDock() {
  const { openCreate } = useUIStore()
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <motion.div
      role="toolbar"
      aria-label="Create new content"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 40,
        // Glass pill
        background: 'rgba(8,5,22,0.72)',
        backdropFilter: 'blur(48px)',
        WebkitBackdropFilter: 'blur(48px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 28,
        boxShadow: [
          '0 16px 48px rgba(0,0,0,0.55)',
          '0 2px 0 rgba(255,255,255,0.06) inset',
          '0 -1px 0 rgba(0,0,0,0.3) inset',
          '0 0 0 0.5px rgba(242,168,184,0.08)',
        ].join(', '),
        // Grid: 7 equal columns
        display: 'grid',
        gridTemplateColumns: `repeat(${ITEMS.length}, 1fr)`,
        alignItems: 'center',
        gap: 0,
        padding: '0 16px',
        height: 76,
      }}
    >
      {ITEMS.map((item, i) => (
        <DockButton
          key={item.type}
          item={item}
          isHovered={hovered === item.type}
          showDivider={i > 0}
          onEnter={() => setHovered(item.type)}
          onLeave={() => setHovered(null)}
          onPress={() => openCreate(item.type)}
        />
      ))}
    </motion.div>
  )
}

/* ─── Individual dock button ─────────────────────────────────────────── */

interface DockButtonProps {
  readonly item: DockItem
  readonly isHovered: boolean
  readonly showDivider: boolean
  readonly onEnter: () => void
  readonly onLeave: () => void
  readonly onPress: () => void
}

function DockButton({ item, isHovered, showDivider, onEnter, onLeave, onPress }: DockButtonProps) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      {/* Vertical divider between items */}
      {showDivider && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            top: '20%',
            height: '60%',
            width: 1,
            background: 'rgba(255,255,255,0.06)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Button */}
      <motion.button
        onClick={onPress}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        aria-label={`Add ${item.label}`}
        animate={isHovered ? { y: -8, scale: 1.12 } : { y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
          width: 64,
          height: 64,
          background: 'transparent',
          border: 'none',
          borderRadius: 18,
          cursor: 'pointer',
          outline: 'none',
          padding: 0,
        }}
        whileTap={{ scale: 0.9 }}
      >
        {/* Hover background — frosted highlight */}
        <motion.div
          aria-hidden="true"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'absolute',
            inset: 4,
            borderRadius: 14,
            background: `radial-gradient(ellipse at 50% 30%, ${item.accent}28 0%, ${item.accent}0a 100%)`,
            border: `1px solid ${item.accent}22`,
          }}
        />

        {/* Glow bloom below icon */}
        <motion.div
          aria-hidden="true"
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.6 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 32,
            height: 14,
            borderRadius: '50%',
            background: `radial-gradient(ellipse, ${item.accent}55 0%, transparent 70%)`,
            filter: 'blur(4px)',
            pointerEvents: 'none',
          }}
        />

        {/* Emoji icon */}
        <motion.span
          aria-hidden="true"
          animate={
            isHovered
              ? { filter: `drop-shadow(0 0 10px ${item.accent}cc) drop-shadow(0 2px 8px ${item.accent}88)` }
              : { filter: 'none' }
          }
          transition={{ duration: 0.18 }}
          style={{
            fontSize: 26,
            lineHeight: 1,
            display: 'block',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {item.emoji}
        </motion.span>

        {/* Label */}
        <motion.span
          animate={{
            opacity: isHovered ? 1 : 0.45,
            color: isHovered ? item.accent : 'rgba(240,238,252,0.45)',
          }}
          transition={{ duration: 0.15 }}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.06em',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            position: 'relative',
            zIndex: 1,
            // Prevent layout shift during color animation
            display: 'block',
          }}
        >
          {item.label}
        </motion.span>
      </motion.button>
    </div>
  )
}
