'use client'
import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/store/useUIStore'

export default function HoverTooltip() {
  const hoverTarget = useUIStore((s) => s.hoverTarget)
  const rightPanel = useUIStore((s) => s.rightPanel)

  // Guard against SSR — portals need document.body
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const visible = hoverTarget !== null && rightPanel === null

  return createPortal(
    <AnimatePresence>
      {visible && hoverTarget && (
        <motion.div
          key="hover-tooltip"
          style={{
            position: 'fixed',
            left: hoverTarget.x,
            top: hoverTarget.y - 56,
            transform: 'translateX(-50%)',
            zIndex: 25,
            pointerEvents: 'none',
          }}
          initial={{ opacity: 0, y: 6, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.92 }}
          transition={{ duration: 0.18 }}
        >
          {/* Container */}
          <div
            style={{
              background: 'rgba(8,5,22,0.92)',
              border: '1px solid rgba(242,168,184,0.25)',
              borderRadius: 12,
              padding: '8px 14px',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              whiteSpace: 'nowrap',
              textAlign: 'center',
            }}
          >
            {/* Line 1: label */}
            <p
              className="font-sans"
              style={{ fontSize: 12, color: 'rgba(240,238,252,0.9)', fontWeight: 500 }}
            >
              {hoverTarget.label}
            </p>

            {/* Line 2: sublabel — only if non-empty */}
            {hoverTarget.sublabel && (
              <p
                className="font-sans"
                style={{ fontSize: 10, color: 'rgba(201,191,232,0.5)', marginTop: 2 }}
              >
                {hoverTarget.sublabel}
              </p>
            )}
          </div>

          {/* Arrow — 4×4px rotated square at bottom-center, pointing downward */}
          <div
            style={{
              position: 'absolute',
              bottom: -5,
              left: '50%',
              width: 8,
              height: 8,
              background: 'rgba(8,5,22,0.92)',
              border: '1px solid rgba(242,168,184,0.25)',
              borderTop: 'none',
              borderLeft: 'none',
              transform: 'translateX(-50%) rotate(45deg)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
