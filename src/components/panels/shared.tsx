'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface DeleteButtonProps {
  readonly label: string
  readonly onDelete: () => void
}

/**
 * Two-step delete control — first click arms it ("Confirm delete…"),
 * second click within 3s actually deletes. Re-arms automatically so a
 * stray click never destroys something by accident.
 */
export function DeleteButton({ label, onDelete }: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false)

  return (
    <motion.button
      type="button"
      onClick={() => {
        if (confirming) { onDelete(); return }
        setConfirming(true)
        setTimeout(() => setConfirming(false), 3000)
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
        padding: '11px 18px',
        borderRadius: 12,
        background: confirming ? 'rgba(224,100,100,0.16)' : 'rgba(255,255,255,0.04)',
        border: confirming ? '1px solid rgba(224,100,100,0.45)' : '1px solid rgba(255,255,255,0.08)',
        color: confirming ? '#ff9a9a' : 'rgba(240,238,252,0.4)',
        fontSize: 13,
        fontFamily: 'Inter, sans-serif',
        cursor: 'pointer',
        transition: 'background 0.2s, border-color 0.2s, color 0.2s',
      }}
    >
      <span style={{ fontSize: 14 }}>🗑</span>
      {confirming ? `Confirm delete ${label}?` : `Delete this ${label}`}
    </motion.button>
  )
}
