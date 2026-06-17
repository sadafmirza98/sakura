'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { CSSProperties } from 'react'

const ACCENT = '#e8c97a'

function hintStyle(): CSSProperties {
  return {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontStyle: 'italic',
    fontSize: 13,
    letterSpacing: '0.03em',
    color: `${ACCENT}ee`,
    opacity: 0.85,
    textShadow: `
      0 0 8px ${ACCENT}66,
      0 0 16px ${ACCENT}33
    `,
    background: 'rgba(20, 12, 35, 0.22)',
    backdropFilter: 'blur(4px)',
    border: `1px solid ${ACCENT}18`,
    borderRadius: 999,
    padding: '6px 12px',
    whiteSpace: 'nowrap',
    boxShadow: `
      0 0 8px rgba(232,201,122,0.08),
      inset 0 0 6px rgba(232,201,122,0.03)
    `,
  }
}

interface PointerProps {
  readonly visible: boolean
  readonly onClick: () => void
}

export function BookPointerHint({ visible, onClick }: PointerProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={onClick}
          aria-label="Open our story"
          initial={{ opacity: 0, y: 8 }}
          animate={{
            opacity: 1,
            y: [0, -4, 0],
          }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.5 },
            y: {
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
style={{
  position: 'fixed',
  left: '21%',
  top: '73%',
  zIndex: 20,
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
}}
        >
          <span style={hintStyle()}>
            ✦ There's magic in the book ✦ 
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export function BoardPointerHint({ visible, onClick }: PointerProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={onClick}
          aria-label="View our timeline"
          initial={{ opacity: 0, y: 8 }}
          animate={{
            opacity: 1,
            y: [0, -4, 0],
          }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.5 },
            y: {
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
style={{
  position: 'fixed',
  left: '85%',
  top: '45%',
  transform: 'translateX(-50%)',
  zIndex: 20,
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
}}
        >
          <span style={hintStyle()}>
            ✦ Our story so far ✦ 
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}