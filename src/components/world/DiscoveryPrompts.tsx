'use client'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUIStore } from '@/store/useUIStore'

interface PromptCard {
  text: string
  style: React.CSSProperties
}

const PROMPTS: PromptCard[] = [
  {
    text: '🌸 Click blossoms to revisit memories',
    style: { left: '8%', top: '28%' },
  },
  {
    text: '🏮 Click lanterns to play songs',
    style: { left: '12%', top: '52%' },
  },
  {
    text: '✨ Click stars to explore poems & dreams',
    style: { right: '5%', top: '20%' },
  },
]

const CARD_STYLE: React.CSSProperties = {
  background: 'rgba(8,5,22,0.82)',
  border: '1px solid rgba(242,168,184,0.14)',
  borderRadius: 16,
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  padding: '10px 16px',
  fontFamily: 'Playfair Display, Georgia, serif',
  fontStyle: 'italic',
  fontSize: 12,
  color: 'rgba(240,238,252,0.65)',
  whiteSpace: 'nowrap',
}

export default function DiscoveryPrompts() {
  const discoveryDone = useUIStore((s) => s.discoveryDone)
  const rightPanel = useUIStore((s) => s.rightPanel)
  const dismissDiscovery = useUIStore((s) => s.dismissDiscovery)

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (discoveryDone) return
    const t = setTimeout(dismissDiscovery, 8000)
    return () => clearTimeout(t)
  }, [discoveryDone, dismissDiscovery])

  // Hide when discovery is done or a panel is open
  if (discoveryDone || rightPanel !== null) return null

  return (
    /* Full-screen fixed overlay — pointer-events:auto so clicks dismiss */
    <div
      onClick={dismissDiscovery}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 20,
        pointerEvents: 'auto',
      }}
      aria-hidden="true"
    >
      {PROMPTS.map((prompt, i) => (
        <motion.div
          key={prompt.text}
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            ...prompt.style,
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ delay: 2 + i * 0.12, duration: 0.8, ease: 'easeOut' }}
        >
          <div style={CARD_STYLE}>{prompt.text}</div>
        </motion.div>
      ))}
    </div>
  )
}
