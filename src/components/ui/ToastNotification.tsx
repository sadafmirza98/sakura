'use client'
import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useUIStore } from '@/store/useUIStore'

/**
 * Subtle bottom-left toast that reads `errorMessage` from `useUIStore`.
 * Auto-dismisses after 4 seconds. Z-index 50 (above all other layers).
 */
export default function ToastNotification() {
  const { errorMessage, clearError } = useUIStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!errorMessage) return

    // Clear any previous timer so multiple errors don't race
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      clearError()
    }, 4000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [errorMessage, clearError])

  return (
    <AnimatePresence>
      {errorMessage && (
        <motion.div
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{
            position: 'fixed',
            bottom: 88, // sits above the dock (bottom: 24px + ~64px dock height)
            left: 20,
            zIndex: 50,
            maxWidth: 340,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 16px',
            borderRadius: 14,
            background: 'rgba(12,8,28,0.92)',
            border: '1px solid rgba(242,168,184,0.18)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.45)',
            cursor: 'pointer',
          }}
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={clearError}
        >
          {/* Icon */}
          <span
            style={{ fontSize: 15, flexShrink: 0 }}
            aria-hidden="true"
          >
            ⚠️
          </span>

          {/* Message */}
          <p
            className="font-sans"
            style={{
              fontSize: 12,
              fontWeight: 400,
              color: 'rgba(240,238,252,0.78)',
              lineHeight: 1.4,
              margin: 0,
            }}
          >
            {errorMessage}
          </p>

          {/* Dismiss hint */}
          <span
            style={{
              fontSize: 10,
              color: 'rgba(201,191,232,0.35)',
              flexShrink: 0,
              marginLeft: 4,
            }}
            aria-hidden="true"
          >
            ✕
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
