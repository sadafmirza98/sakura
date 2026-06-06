'use client'
/**
 * BloomRing — the sakura tree's navigation system.
 *
 * When the tree is clicked, a ring of magical objects blooms outward from the
 * tree's centre using PNG assets. Objects appear one-by-one like a flower
 * opening. Each object represents a content section.
 *
 * Clicking an object:
 *   - Fades all other objects
 *   - Slides the object toward the viewer
 *   - Opens the content drawer (RightPanel)
 *
 * Clicking outside or pressing Escape closes the ring.
 */

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useUIStore, type RightPanelType } from '@/store/useUIStore'

/* ─── ring item definitions ──────────────────────────────────────────── */

interface RingItem {
  readonly type: RightPanelType
  readonly asset: string
  readonly label: string
  readonly accent: string
  /**
   * Organic offset in degrees from baseline — makes the ring feel
   * hand-placed rather than mathematically perfect.
   */
  readonly jitter: number
}

const RING_ITEMS: RingItem[] = [
  {
    type: 'memory',
    asset: '/assets/ui/map.png',
    label: 'Memories',
    accent: '#f2a8b8',
    jitter: -8,
  },
  {
    type: 'song',
    asset: '/assets/ui/petal.png',
    label: 'Songs',
    accent: '#ffb450',
    jitter: 5,
  },
  {
    type: 'poem',
    asset: '/assets/ui/sakura.png',
    label: 'Poems',
    accent: '#c9bfe8',
    jitter: -4,
  },
  {
    type: 'wish',
    asset: '/assets/ui/wish-blossom.png',
    label: 'Wishes',
    accent: '#a8d8a0',
    jitter: 10,
  },
  {
    type: 'letter',
    asset: '/assets/ui/candle.png',
    label: 'Letters',
    accent: '#d4aaff',
    jitter: -6,
  },
  {
    type: 'place',
    asset: '/assets/ui/lantern.png',
    label: 'Places',
    accent: '#ffe890',
    jitter: 7,
  },
]

const ITEM_COUNT = RING_ITEMS.length
// Radius of the bloom ring in px (responsive — capped at viewport fraction)
const RING_RADIUS = 200

/* ─── helpers ─────────────────────────────────────────────────────────── */

/**
 * Compute the (x, y) offset for item i in a ring.
 * Objects are spread across the upper half-arc (from ~200° to ~340°) so
 * they bloom outward from the tree canopy region without overlapping
 * the right-side content drawer.
 *
 * Arc: starts at 200° (lower-left), sweeps counter-clockwise through top
 * to 340° (upper-right). Total span ≈ 140°.
 */
function ringPos(
  i: number,
  jitterDeg: number,
): { x: number; y: number } {
  const startDeg = 200
  const spanDeg  = 140
  const step = spanDeg / (ITEM_COUNT - 1)
  const baseDeg = startDeg + i * step + jitterDeg
  const rad = (baseDeg * Math.PI) / 180
  return {
    x: Math.cos(rad) * RING_RADIUS,
    y: Math.sin(rad) * RING_RADIUS,
  }
}

/* ─── tree trigger button ────────────────────────────────────────────── */

/**
 * TreeTrigger — an invisible hot-zone over the tree canopy that responds to
 * click/hover. Renders a soft breathing glow when the bloom is open.
 * Positioned to cover the painted tree's canopy in the hero image.
 */
export function TreeTrigger() {
  const { bloomOpen, toggleBloom, closeRightPanel, closeCreate } = useUIStore()
  const [hovering, setHovering] = useState(false)

  const handleClick = () => {
    if (bloomOpen) {
      toggleBloom()
    } else {
      closeRightPanel()
      closeCreate()
      toggleBloom()
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      aria-label={bloomOpen ? 'Close navigation' : 'Open navigation — click the tree'}
      aria-expanded={bloomOpen}
      style={{
        position: 'fixed',
        // Tree occupies roughly left 42% of the viewport, canopy y 5%–60%
        left: '8%',
        top: '8%',
        width: '30%',
        height: '52%',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        zIndex: 15,
        outline: 'none',
        borderRadius: '50% 60% 40% 55% / 45% 50% 55% 40%',
        // Soft bloom glow when open
      }}
    >
      {/* Breathing glow — always visible but subtle when closed */}
      <motion.div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '15%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at 50% 60%, rgba(242,168,184,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
        animate={{
          opacity: bloomOpen ? [0.5, 0.9, 0.5] : hovering ? [0.15, 0.3, 0.15] : [0.05, 0.12, 0.05],
          scale:   bloomOpen ? [1, 1.06, 1]     : [1, 1.02, 1],
        }}
        transition={{ duration: bloomOpen ? 2.2 : 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Petal burst ring when open */}
      {bloomOpen && (
        <motion.div
          aria-hidden="true"
          initial={{ scale: 0.4, opacity: 0.8 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            inset: '25%',
            borderRadius: '50%',
            border: '1px solid rgba(242,168,184,0.4)',
            pointerEvents: 'none',
          }}
        />
      )}
    </motion.button>
  )
}

/* ─── main bloom ring component ──────────────────────────────────────── */

export default function BloomRing() {
  const { bloomOpen, closeBloom, openRightPanel, rightPanel } = useUIStore()
  const [selected, setSelected] = useState<RightPanelType | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Reset selected state when bloom closes
  useEffect(() => {
    if (!bloomOpen) {
      const t = setTimeout(() => setSelected(null), 400)
      return () => clearTimeout(t)
    }
  }, [bloomOpen])

  // Close on Escape
  useEffect(() => {
    if (!bloomOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeBloom() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [bloomOpen, closeBloom])

  const handleItemClick = (item: RingItem) => {
    setSelected(item.type)
    // Brief delay so the "move toward viewer" animation plays
    setTimeout(() => {
      openRightPanel(item.type)
    }, 320)
  }

  // The bloom ring is centred on the tree canopy.
  // The tree canopy centre is roughly at 22% x, 35% y of the viewport.
  const cx = 'calc(22vw)'
  const cy = 'calc(35vh)'

  return (
    <AnimatePresence>
      {bloomOpen && (
        <>
          {/* Backdrop — dims the world slightly, closes on click */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={closeBloom}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 18,
              background: 'rgba(4,2,14,0.28)',
              backdropFilter: 'blur(0.5px)',
              WebkitBackdropFilter: 'blur(0.5px)',
            }}
            aria-hidden="true"
          />

          {/* Ring container — positioned at tree canopy centre */}
          <div
            ref={containerRef}
            style={{
              position: 'fixed',
              left: cx,
              top: cy,
              zIndex: 19,
              pointerEvents: 'none', // individual buttons handle events
            }}
          >
            {RING_ITEMS.map((item, i) => {
              const pos = ringPos(i, item.jitter)
              const isSelected = selected === item.type
              const isOther = selected !== null && !isSelected
              const isActive = rightPanel === item.type

              return (
                <RingObject
                  key={item.type}
                  item={item}
                  index={i}
                  pos={pos}
                  isSelected={isSelected}
                  isOther={isOther}
                  isActive={isActive}
                  onClick={() => handleItemClick(item)}
                />
              )
            })}
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ─── individual ring object ─────────────────────────────────────────── */

interface RingObjectProps {
  readonly item: RingItem
  readonly index: number
  readonly pos: { x: number; y: number }
  readonly isSelected: boolean
  readonly isOther: boolean
  readonly isActive: boolean
  readonly onClick: () => void
}

function RingObject({
  item,
  index,
  pos,
  isSelected,
  isOther,
  isActive,
  onClick,
}: RingObjectProps) {
  const [hovering, setHovering] = useState(false)

  // Stagger delay — objects bloom one by one like a flower opening
  const entryDelay = 0.06 + index * 0.07

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        // Don't block backdrop click when idle
        pointerEvents: 'auto',
      }}
      initial={{
        x: 0,
        y: 0,
        scale: 0,
        opacity: 0,
      }}
      animate={
        isSelected
          ? {
              // "Moves toward the viewer" — scale up and drift toward centre of screen
              x: pos.x * 0.3,
              y: pos.y * 0.3 - 30,
              scale: 1.5,
              opacity: 1,
            }
          : isOther
          ? {
              // Other objects fade away
              x: pos.x,
              y: pos.y,
              scale: 0.7,
              opacity: 0,
            }
          : {
              // Normal bloomed state
              x: pos.x,
              y: pos.y,
              scale: 1,
              opacity: 1,
            }
      }
      exit={{
        x: 0,
        y: 0,
        scale: 0,
        opacity: 0,
        transition: {
          delay: (ITEM_COUNT - 1 - index) * 0.04,
          duration: 0.35,
          ease: [0.4, 0, 1, 1],
        },
      }}
      transition={
        isSelected || isOther
          ? { duration: 0.38, ease: [0.16, 1, 0.3, 1] }
          : {
              delay: entryDelay,
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }
      }
    >
      {/* Floating bob animation wrapper */}
      <motion.div
        animate={{
          y: [0, -5, 0, -3, 0],
        }}
        transition={{
          duration: 4 + index * 0.4,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: index * 0.25,
        }}
        style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
      >
        <motion.button
          onClick={onClick}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          aria-label={item.label}
          // Translate so the object is centred on its ring position
          style={{
            transform: 'translate(-50%, -50%)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            outline: 'none',
            padding: 0,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}
          animate={{
            scale: hovering ? 1.1 : isActive ? 1.08 : 1,
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 24 }}
          whileTap={{ scale: 0.88 }}
        >
          {/* Glow halo */}
          <motion.div
            aria-hidden="true"
            animate={{
              opacity: hovering ? 1 : isActive ? 0.7 : 0,
            }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              inset: -16,
              borderRadius: '50%',
              background: `radial-gradient(ellipse at 50% 50%, ${item.accent}44 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />

          {/* PNG asset — full quality, no container */}
          <motion.div
            animate={{
              filter: hovering
                ? `drop-shadow(0 0 14px ${item.accent}cc) drop-shadow(0 4px 16px ${item.accent}88) brightness(1.1)`
                : isActive
                ? `drop-shadow(0 0 10px ${item.accent}aa) brightness(1.05)`
                : `drop-shadow(0 2px 8px rgba(0,0,0,0.4)) brightness(0.9)`,
            }}
            transition={{ duration: 0.25 }}
          >
            <Image
              src={item.asset}
              alt=""
              aria-hidden="true"
              width={64}
              height={64}
              style={{
                width: 64,
                height: 64,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </motion.div>

          {/* Label */}
          <motion.span
            animate={{
              opacity: hovering ? 1 : 0.6,
              y: hovering ? 0 : 3,
              color: hovering ? item.accent : 'rgba(240,238,252,0.65)',
            }}
            transition={{ duration: 0.2 }}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.07em',
              textShadow: `0 1px 8px rgba(0,0,0,0.8)`,
              whiteSpace: 'nowrap',
              display: 'block',
            }}
          >
            {item.label}
          </motion.span>
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
