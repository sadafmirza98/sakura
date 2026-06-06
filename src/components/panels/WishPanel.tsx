'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import type { ContentItem } from '@/store/useContentStore'

interface Props {
  item: ContentItem | null
}

const accent = '#a8d8a0'

export default function WishPanel({ item }: Readonly<Props>) {
  const title       = (item?.title     as string)  ?? 'Unnamed Wish'
  const category    = (item?.category  as string)  ?? ''
  const date        = (item?.date      as string)  ?? ''
  const progressNote = (item?.progressNote as string) ?? ''
  const initialCompleted = (item?.completed as boolean) ?? false

  const [completed, setCompleted] = useState(initialCompleted)

  return (
    <div>
      {/* Wish icon + title */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}
      >
        <motion.span
          style={{ fontSize: 32, display: 'inline-block', filter: `drop-shadow(0 0 10px ${accent}66)` }}
          animate={completed ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          {completed ? '🌸' : '🌱'}
        </motion.span>
        <div>
          <p className="font-serif" style={{ fontSize: 18, fontWeight: 300, color: '#f0eefc', lineHeight: 1.3 }}>
            {title}
          </p>
          {date && (
            <p className="font-sans" style={{ fontSize: 11, color: 'rgba(201,191,232,0.4)', marginTop: 4 }}>
              Planted {date}
            </p>
          )}
        </div>
      </motion.div>

      {/* Category chip */}
      {category && (
        <div style={{ marginBottom: 18 }}>
          <span
            className="font-sans"
            style={{
              padding: '5px 14px',
              borderRadius: 100,
              background: `${accent}14`,
              border: `1px solid ${accent}38`,
              fontSize: 12,
              color: accent,
            }}
          >
            {category}
          </span>
        </div>
      )}

      {/* Completion toggle */}
      <motion.button
        onClick={() => setCompleted((c) => !c)}
        style={{
          width: '100%',
          padding: '13px 20px',
          borderRadius: 14,
          border: completed ? `1px solid ${accent}66` : '1px solid rgba(255,255,255,0.1)',
          background: completed ? `${accent}18` : 'rgba(255,255,255,0.04)',
          color: completed ? accent : 'rgba(240,238,252,0.5)',
          fontSize: 14,
          fontFamily: 'Inter,sans-serif',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          marginBottom: 18,
          transition: 'all 0.3s ease',
        }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.97 }}
      >
        <span style={{ fontSize: 16 }}>{completed ? '✅' : '⭕'}</span>
        {completed ? 'Wish fulfilled!' : 'Mark as fulfilled'}
      </motion.button>

      {/* Progress note */}
      {progressNote ? (
        <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="font-sans" style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(201,191,232,0.35)', marginBottom: 6 }}>
            Progress note
          </p>
          <p className="font-sans" style={{ fontSize: 13, color: 'rgba(240,238,252,0.6)', lineHeight: 1.65 }}>
            {progressNote}
          </p>
        </div>
      ) : (
        <p className="font-sans" style={{ fontSize: 12, color: 'rgba(201,191,232,0.3)', fontStyle: 'italic' }}>
          Every completed wish blooms on the tree...
        </p>
      )}
    </div>
  )
}
