'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { getRelationshipDays, formatDate } from '@/lib/utils'
import type { ContentItem } from '@/store/useContentStore'

interface Props {
  item: ContentItem | null
}

const accent = '#f2a8b8'

const AFFIRMATIONS = [
  'You are enough.',
  'You are deeply loved.',
  'Spring always returns.',
  'This too shall pass.',
  'We will be okay.',
  'Every storm passes.',
  'You are my home.',
]

export default function ComfortPanel({ item: _ }: Readonly<Props>) {
  const { relationshipStartDate } = useAppStore()
  const [reason, setReason] = useState('')

  const days = getRelationshipDays(new Date(relationshipStartDate))
  // Rotate affirmation hourly
  const aff = AFFIRMATIONS[Math.floor(Date.now() / 3_600_000) % AFFIRMATIONS.length]

  return (
    <div>
      {/* Affirmation card */}
      <motion.div
        style={{
          background: `linear-gradient(135deg, rgba(242,168,184,0.1), rgba(201,191,232,0.06))`,
          border: '1px solid rgba(242,168,184,0.18)',
          borderRadius: 18,
          padding: '28px 20px',
          textAlign: 'center',
          marginBottom: 20,
        }}
        animate={{
          boxShadow: [
            '0 0 16px rgba(242,168,184,0.1)',
            '0 0 32px rgba(242,168,184,0.22)',
            '0 0 16px rgba(242,168,184,0.1)',
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div style={{ fontSize: 30, marginBottom: 14 }}>🏮</div>
        <p
          className="font-serif"
          style={{
            fontSize: 18,
            fontStyle: 'italic',
            color: accent,
            lineHeight: 1.65,
          }}
        >
          &ldquo;{aff}&rdquo;
        </p>
      </motion.div>

      {/* Days-together counter */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
        <div style={{ background: 'rgba(232,201,122,0.08)', border: '1px solid rgba(232,201,122,0.15)', borderRadius: 14, padding: '16px', textAlign: 'center' }}>
          <div className="font-serif" style={{ fontSize: 28, fontWeight: 300, color: '#e8c97a' }}>
            {days.toLocaleString()}
          </div>
          <div className="font-sans" style={{ fontSize: 9, color: 'rgba(232,201,122,0.55)', marginTop: 4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            days together
          </div>
        </div>
        <div style={{ background: 'rgba(242,168,184,0.07)', border: '1px solid rgba(242,168,184,0.13)', borderRadius: 14, padding: '16px', textAlign: 'center' }}>
          <div className="font-sans" style={{ fontSize: 11, color: 'rgba(242,168,184,0.6)', lineHeight: 1.4 }}>
            since
          </div>
          <div className="font-serif" style={{ fontSize: 12, color: accent, marginTop: 4 }}>
            {formatDate(new Date(relationshipStartDate))}
          </div>
        </div>
      </div>

      {/* Reasons-I-love-you form placeholder */}
      <div style={{ marginBottom: 6 }}>
        <label
          htmlFor="comfort-reason"
          className="font-sans"
          style={{ display: 'block', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(201,191,232,0.4)', marginBottom: 8 }}
        >
          Reasons I love you
        </label>
        <textarea
          id="comfort-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="I love you because..."
          style={{
            width: '100%',
            padding: '12px 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 12,
            outline: 'none',
            color: 'rgba(240,238,252,0.9)',
            fontSize: 13,
            fontFamily: 'Playfair Display,serif',
            fontStyle: 'italic',
            fontWeight: 300,
            lineHeight: 1.7,
            resize: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <motion.button
        style={{
          width: '100%',
          padding: '13px 20px',
          marginTop: 6,
          borderRadius: 14,
          border: `1px solid ${accent}44`,
          background: `linear-gradient(135deg, ${accent}1e, ${accent}12)`,
          color: accent,
          fontSize: 14,
          fontFamily: 'Inter,sans-serif',
          cursor: 'pointer',
        }}
        whileHover={{ boxShadow: `0 0 24px ${accent}28`, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        💕 Save this reason
      </motion.button>
    </div>
  )
}
