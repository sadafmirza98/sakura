'use client'
import { motion } from 'framer-motion'
import type { ContentItem } from '@/store/useContentStore'

interface Props {
  item: ContentItem | null
}

const accent = '#a8d8a0'

export default function WhisperPanel({ item }: Readonly<Props>) {
  const text = (item?.text as string) ?? ''
  const date = (item?.date as string) ?? ''

  return (
    <div>
      {/* Soft gradient background card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          background: `linear-gradient(160deg, ${accent}0e 0%, rgba(168,216,160,0.04) 100%)`,
          border: `1px solid ${accent}22`,
          borderRadius: 18,
          padding: '32px 24px',
          textAlign: 'center',
          minHeight: 180,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <span style={{ fontSize: 28, filter: `drop-shadow(0 0 12px ${accent}88)` }}>🍃</span>

        {text ? (
          <p
            className="font-serif"
            style={{
              fontSize: 15,
              fontStyle: 'italic',
              color: 'rgba(240,238,252,0.82)',
              lineHeight: 1.8,
              maxWidth: 320,
            }}
          >
            &ldquo;{text}&rdquo;
          </p>
        ) : (
          <p
            className="font-serif"
            style={{ fontSize: 14, fontStyle: 'italic', color: 'rgba(201,191,232,0.35)', lineHeight: 1.8 }}
          >
            A quiet whisper will appear here...
          </p>
        )}

        {/* Date pill */}
        {date && (
          <div
            style={{
              padding: '4px 14px',
              borderRadius: 100,
              background: `${accent}12`,
              border: `1px solid ${accent}28`,
            }}
          >
            <p className="font-sans" style={{ fontSize: 11, color: `${accent}aa` }}>{date}</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
