'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useUIStore, type RightPanelType } from '@/store/useUIStore'

interface NavItem {
  icon: string
  label: string
  type: RightPanelType
  accent: string
}

const NAV_ITEMS: NavItem[] = [
  { icon: '/assets/ui/map.png', label: 'Memories', type: 'memory',  accent: '#f2a8b8' },
  { icon: '/assets/ui/lantern.png',        label: 'Songs',    type: 'song',    accent: '#ffb450' },
  { icon: '/assets/ui/petal.png',          label: 'Poems',    type: 'poem',    accent: '#c9bfe8' },
  { icon: '/assets/ui/sakura.png',           label: 'Evenings', type: 'evening', accent: '#ffe890' },
  { icon: '/assets/ui/wish-blossom.png',   label: 'Wishes',   type: 'wish',    accent: '#a8d8a0' },
  { icon: '/assets/ui/candle.png',   label: 'Letters',  type: 'letter',  accent: '#d4aaff' },
]

export default function FloatingNav() {
  const { rightPanel, openRightPanel } = useUIStore()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .floating-nav { display: none !important; }
        }
      `}</style>

      <nav
        className="floating-nav"
        aria-label="Section navigation"
        style={{
          position: 'fixed',
          right: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          alignItems: 'flex-end',
        }}
      >
        {NAV_ITEMS.map((item, i) => {
          const isActive = rightPanel === item.type
          const isHovered = hoveredIndex === i

          return (
            <NavButton
              key={item.type}
              item={item}
              isActive={isActive}
              isHovered={isHovered}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => openRightPanel(item.type)}
            />
          )
        })}
      </nav>
    </>
  )
}

/* ─── Individual nav button ──────────────────────────────────────────── */

interface NavButtonProps {
  readonly item: NavItem
  readonly isActive: boolean
  readonly isHovered: boolean
  readonly onMouseEnter: () => void
  readonly onMouseLeave: () => void
  readonly onClick: () => void
}

function NavButton({
  item,
  isActive,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: NavButtonProps) {
  const showLabel = isHovered || isActive

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 10,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Label — slides in from the right */}
      <AnimatePresence>
        {showLabel && (
          <motion.span
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.05em',
              color: isActive ? item.accent : 'rgba(240,238,252,0.75)',
              fontFamily: 'Inter, sans-serif',
              textShadow: isActive ? `0 0 16px ${item.accent}88` : 'none',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Icon button */}
      <motion.button
        onClick={onClick}
        title={item.label}
        aria-label={item.label}
        aria-pressed={isActive}
        animate={{
          scale: isActive ? 1.05 : isHovered ? 1.1 : 1,
        }}
        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        style={{
          position: 'relative',
          width: 52,
          height: 52,
          borderRadius: 18,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          padding: 0,
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {/* Active: glass halo background */}
        {isActive && (
          <motion.div
            layoutId="nav-active-halo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 18,
              background: `linear-gradient(135deg, ${item.accent}22 0%, ${item.accent}0e 100%)`,
              border: `1px solid ${item.accent}44`,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: `0 0 20px ${item.accent}33, inset 0 1px 0 ${item.accent}22`,
            }}
          />
        )}

        {/* Hover: subtle frosted bg */}
        {!isActive && isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 18,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          />
        )}

        {/* Soft glow behind icon — active */}
        {isActive && (
          <div
            style={{
              position: 'absolute',
              inset: -6,
              borderRadius: 24,
              background: `radial-gradient(ellipse at 50% 50%, ${item.accent}30 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Hover glow */}
        {isHovered && !isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: -4,
              borderRadius: 22,
              background: `radial-gradient(ellipse at 50% 50%, ${item.accent}20 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* PNG icon — full quality, no container, no clipping */}
        <Image
          src={item.icon}
          alt=""
          aria-hidden="true"
          width={52}
          height={52}
          style={{
            position: 'relative',
            zIndex: 1,
            width: 52,
            height: 52,
            objectFit: 'contain',
            filter: isActive
              ? `brightness(1.15) saturate(1.1) drop-shadow(0 0 8px ${item.accent}bb)`
              : isHovered
              ? `brightness(1.05) saturate(1.0) drop-shadow(0 0 6px ${item.accent}66)`
              : 'brightness(0.7) saturate(0.7)',
            transition: 'filter 0.2s ease',
          }}
        />

        {/* Active: bottom indicator dot */}
        {isActive && (
          <motion.div
            layoutId="nav-active-dot"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: item.accent,
              boxShadow: `0 0 8px ${item.accent}`,
            }}
          />
        )}
      </motion.button>
    </div>
  )
}
