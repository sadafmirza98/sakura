'use client'
import { useEffect } from 'react'
import { useContentStore } from '@/store/useContentStore'
import { useUIStore } from '@/store/useUIStore'
import { motion, AnimatePresence } from 'framer-motion'

// World layers
import HeroBg         from '@/components/world/HeroBg'
import ParticleCanvas from '@/components/world/ParticleCanvas'
import WorldCanvas    from '@/components/world/WorldCanvas'

// Book interaction system
import MemoryRing, { BookAmbient, BookHitZone, BookJourney } from '@/components/world/BookInteraction'

// Timeline board system
import FateThreadOverlay, { BoardAmbient, BoardHitZone } from '@/components/world/FateThread'

// HUD
import MoonCounter    from '@/components/world/MoonCounter'
import HoverTooltip   from '@/components/world/HoverTooltip'
import MobileQuickActions from '@/components/world/MobileQuickActions'

// Content drawer
import RightPanel     from '@/components/world/RightPanel'

// Feedback
import ToastNotification from '@/components/ui/ToastNotification'

export default function GardenPage() {
  const { initListeners } = useContentStore()
  const { rightPanel, closeRightPanel, closeCreate } = useUIStore()
  const panelOpen = rightPanel !== null

  useEffect(() => { return initListeners() }, [initListeners])

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#04060f' }}>

      {/* ── World ── */}
      <HeroBg />
      <ParticleCanvas />
      <WorldCanvas />

      {/* ── Book system (z 12–26) ── */}
      <BookAmbient />
      <BookHitZone />
      <BookJourney />
      <MemoryRing />

      {/* ── Board / timeline system (z 12–14 idle, 40+ when open) ── */}
      <BoardAmbient />
      <BoardHitZone />
      <FateThreadOverlay />

      {/* ── HUD ── */}
      <MoonCounter />
      <HoverTooltip />
      <MobileQuickActions />

      {/* ── Panel backdrop ── */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => { closeRightPanel(); closeCreate() }}
            aria-hidden="true"
            style={{
              position: 'fixed', inset: 0, zIndex: 34,
              background: 'linear-gradient(100deg, rgba(4,2,14,0.35) 0%, rgba(4,2,14,0.18) 62%, transparent 100%)',
              backdropFilter: 'blur(0.5px)',
              WebkitBackdropFilter: 'blur(0.5px)',
            }}
          />
        )}
      </AnimatePresence>

      <RightPanel />
      <ToastNotification />
    </div>
  )
}
