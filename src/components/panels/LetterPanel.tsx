'use client'
import { motion } from 'framer-motion'
import type { ContentItem } from '@/store/useContentStore'

interface Props {
  item: ContentItem | null
}

const accent = '#d4aaff'

export default function LetterPanel({ item }: Readonly<Props>) {
  const unlockDate  = (item?.unlockDate as string) ?? ''
  const text        = (item?.text       as string) ?? ''
  const sender      = (item?.sender     as string) ?? ''
  const date        = (item?.date       as string) ?? ''
  const openWhen    = (item?.openWhen   as string) ?? ''

  // Determine locked state
  const isLocked = unlockDate
    ? new Date(unlockDate) > new Date()
    : false

  if (isLocked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          padding: '40px 20px',
          textAlign: 'center',
        }}
      >
        {/* Sealed crane icon */}
        <motion.div
          animate={{ scale: [1, 1.06, 1], filter: ['drop-shadow(0 0 8px rgba(100,140,255,0.4))', 'drop-shadow(0 0 18px rgba(100,140,255,0.7))', 'drop-shadow(0 0 8px rgba(100,140,255,0.4))'] }}
          transition={{ duration: 3.5, repeat: Infinity }}
          style={{ fontSize: 52 }}
        >
          🕊️
        </motion.div>

        <div>
          <p className="font-serif" style={{ fontSize: 16, color: 'rgba(180,170,220,0.8)', marginBottom: 8 }}>
            A sealed letter waits for you
          </p>
          {openWhen && (
            <p className="font-sans" style={{ fontSize: 13, fontStyle: 'italic', color: 'rgba(201,191,232,0.5)', marginBottom: 6 }}>
              &ldquo;{openWhen}&rdquo;
            </p>
          )}
          {unlockDate && (
            <p className="font-sans" style={{ fontSize: 12, color: 'rgba(201,191,232,0.4)', marginTop: 4 }}>
              Opens on {new Date(unlockDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>

        <div
          style={{
            padding: '8px 20px',
            borderRadius: 100,
            background: 'rgba(100,120,255,0.1)',
            border: '1px solid rgba(100,120,255,0.25)',
          }}
        >
          <p className="font-sans" style={{ fontSize: 11, color: 'rgba(180,200,255,0.6)', letterSpacing: '0.1em' }}>
            🔒 Sealed
          </p>
        </div>
      </motion.div>
    )
  }

  // Unlocked state — letter in paper card style
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'rgba(250,244,230,0.08)',
          border: `1px solid ${accent}1e`,
          borderRadius: 18,
          padding: '28px 22px 24px',
          boxShadow: `0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 ${accent}12`,
        }}
      >
        {/* Crane indicator - unlocked warm gold */}
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <motion.span
            style={{ fontSize: 32, display: 'inline-block', filter: 'drop-shadow(0 0 12px rgba(212,170,255,0.6))' }}
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, type: 'spring', stiffness: 180 }}
          >
            🕊️
          </motion.span>
        </div>

        {/* Letter text */}
        {text ? (
          <p
            className="font-serif"
            style={{
              fontSize: 14,
              fontStyle: 'italic',
              color: 'rgba(240,234,218,0.82)',
              lineHeight: 2,
              whiteSpace: 'pre-wrap',
            }}
          >
            {text}
          </p>
        ) : (
          <p
            className="font-serif"
            style={{ fontSize: 14, fontStyle: 'italic', color: 'rgba(240,234,218,0.3)', lineHeight: 2 }}
          >
            The words of this letter will appear here...
          </p>
        )}

        {/* Sender + date */}
        {(sender || date) && (
          <div style={{ marginTop: 20, borderTop: `1px solid ${accent}18`, paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {sender && (
              <p className="font-sans" style={{ fontSize: 12, color: `${accent}88` }}>
                — {sender}
              </p>
            )}
            {date && (
              <p className="font-sans" style={{ fontSize: 11, color: 'rgba(201,191,232,0.4)' }}>
                {date}
              </p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
