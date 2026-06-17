'use client'
/**
 * MoonCounter — relationship duration, floating like a title in the sky.
 *
 * Design intent (per spec):
 *   - Exact position: top 40px, left 50%, translateX(-50%)
 *   - Text centred, no offset, no right bias
 *   - No floating card, no glass box
 *   - Feels like words painted in the sky
 *   - Fades away when a panel is open
 *   - Dims gently when the bloom is active
 */

import { motion } from 'framer-motion'
import { useUIStore } from '@/store/useUIStore'
import { useAppStore } from '@/store/useAppStore'
import { getRelationshipDays } from '@/lib/utils'

export default function MoonCounter() {
  const { rightPanel, bloomOpen } = useUIStore()
  const { relationshipStartDate } = useAppStore()

  const days = getRelationshipDays(new Date(relationshipStartDate))
  const panelOpen = rightPanel !== null
  let targetOpacity: number
  if (panelOpen) targetOpacity = 0
  else if (bloomOpen) targetOpacity = 0.28
  else targetOpacity = 1

  return (
    
    <motion.div
      aria-live="polite"
      aria-label={`${days.toLocaleString()} days of spring`}
      animate={{
        opacity: panelOpen ? 0 : bloomOpen ? 0.28 : 1,
        y: panelOpen ? -12 : 0,
      }}
      transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        // Exact position per spec
        position: 'fixed',
        top: 40,
        left: '40%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        pointerEvents: 'none',
        // Pure text — no card, no background, no border
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
      }}
    >
      <motion.div
  animate={{
    opacity: [0.6, 1, 0.6],
    scale: [1, 1.08, 1],
  }}
  transition={{
    duration: 6,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
  style={{
    position: 'absolute',
    width: 220,
    height: 120,
    background:
      'radial-gradient(circle, rgba(255,220,180,0.18) 0%, rgba(255,220,180,0.08) 35%, transparent 75%)',
    filter: 'blur(30px)',
    pointerEvents: 'none',
    zIndex: -1,
  }}
/>
      
      {/* The number — large, light, golden-warm */}
<motion.p
  className="font-serif"
  animate={{
    textShadow: [
      '0 0 10px rgba(255,220,120,0.5), 0 0 30px rgba(255,200,80,0.25)',
      '0 0 18px rgba(255,240,180,0.9), 0 0 50px rgba(255,220,120,0.55)',
      '0 0 10px rgba(255,220,120,0.5), 0 0 30px rgba(255,200,80,0.25)',
    ],
  }}
  transition={{
    duration: 5,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
  style={{
    fontSize: 'clamp(20px, 2.4vw, 32px)',
    fontWeight: 400,
    color: 'rgba(255,248,225,0.98)',
    lineHeight: 1,
    letterSpacing: '0.02em',
    margin: 0,

    textShadow: `
      0 0 8px rgba(255,240,180,0.7),
      0 0 20px rgba(255,220,120,0.6),
      0 0 40px rgba(255,200,80,0.4),
      0 2px 10px rgba(0,0,0,0.8)
    `,
  }}
>
  {days.toLocaleString()}
</motion.p>

      {/* "Days of Spring" */}
<p
  className="font-serif"
  style={{
    fontSize: 'clamp(10px, 1vw, 13px)',
    fontWeight: 400,
    fontStyle: 'italic',
    color: 'rgba(255,210,220,0.92)',
    letterSpacing: '0.12em',
    margin: '4px 0 0',
    lineHeight: 1,

    textShadow: `
      0 0 8px rgba(255,180,200,0.6),
      0 0 18px rgba(255,180,200,0.35),
      0 2px 8px rgba(0,0,0,0.8)
    `,
  }}
>
  Days of Spring
</p>
      {/* Thin separator */}
      <motion.div
        animate={{ scaleX: bloomOpen ? 0.5 : 1, opacity: bloomOpen ? 0.2 : 0.35 }}
        transition={{ duration: 0.5 }}
        style={{
          width: 60,
          height: 1,
          margin: '6px 0',
          background: 'linear-gradient(90deg, transparent, rgba(242,168,184,0.45), transparent)',
        }}
      />

      {/* Tagline */}
<p
  className="font-sans"
  style={{
    fontSize: 'clamp(7px, 0.65vw, 9px)',
    fontWeight: 500,
    color: 'rgba(255,240,250,0.55)',
    letterSpacing: '0.32em',
    textTransform: 'uppercase',
    margin: 0,
    lineHeight: 1,

    textShadow: `
      0 0 10px rgba(220,190,255,0.25),
      0 1px 6px rgba(0,0,0,0.9)
    `,
  }}
>
  Sakura&nbsp;&middot;&nbsp;Where I Found My Spring
</p>
    </motion.div>
  )
}
