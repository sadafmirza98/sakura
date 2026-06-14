'use client'
import { motion } from 'framer-motion'
import type { ContentItem } from '@/store/useContentStore'

interface Props {
  readonly item: ContentItem | null
}

const ACCENT = '#f2a8b8'

/* ─── helpers ─────────────────────────────────────────────────────────── */

function formatDisplayDate(raw: string): string {
  if (!raw) return ''
  try {
    return new Date(raw).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return raw
  }
}

/* ─── sub-components ──────────────────────────────────────────────────── */

function SectionDivider() {
  return (
    <div
      style={{
        height: 1,
        background: `linear-gradient(90deg, transparent, ${ACCENT}28, transparent)`,
        margin: '20px 0',
      }}
    />
  )
}

function VoiceNotePlayer() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        borderRadius: 16,
        background: `linear-gradient(135deg, ${ACCENT}0e 0%, rgba(255,255,255,0.02) 100%)`,
        border: `1px solid ${ACCENT}22`,
      }}
    >
      <motion.button
        whileHover={{ scale: 1.08, background: `${ACCENT}33` }}
        whileTap={{ scale: 0.92 }}
        aria-label="Play voice note"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: `${ACCENT}1e`,
          border: `1px solid ${ACCENT}44`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          color: ACCENT,
          fontSize: 13,
        }}
      >
        ▶
      </motion.button>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Waveform bars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 24, marginBottom: 4 }}>
          {Array.from({ length: 28 }).map((_, i) => (
            <motion.div
              // stable key based on position, count never changes
              key={`wave-bar-${i}`}
              style={{
                flex: 1,
                borderRadius: 2,
                background: ACCENT,
                opacity: 0.25 + Math.random() * 0.4,
              }}
              animate={{ height: `${20 + Math.sin(i * 0.8) * 14}px` }}
              transition={{
                duration: 1.2 + (i % 5) * 0.2,
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut',
                delay: (i % 7) * 0.1,
              }}
            />
          ))}
        </div>
        <p
          className="font-sans"
          style={{ fontSize: 10, color: 'rgba(201,191,232,0.4)', letterSpacing: '0.08em' }}
        >
          Voice note
        </p>
      </div>
    </motion.div>
  )
}

/* ─── main component ──────────────────────────────────────────────────── */

export default function MemoryPanel({ item }: Props) {
  if (!item) return <EmptyState />

  const title    = (item.title    as string) ?? ''
  const date     = (item.date     as string) ?? ''
  const location = (item.location as string) ?? ''
  const story    = (item.story    as string) ?? ''
  const tags     = (item.tags     as string[]) ?? []
  const photoUrl = (item.photoUrl as string) ?? ''
  const hasVoiceNote = !!(item.voiceNote as string)

  const displayDate = formatDisplayDate(date)

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ paddingBottom: 24 }}
    >
      {/* ── Hero image ─────────────────────────────── */}
      {photoUrl && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{
            width: '100%',
            aspectRatio: '16/10',
            borderRadius: 20,
            overflow: 'hidden',
            marginBottom: 22,
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </motion.div>
      )}

      {/* ── Title ──────────────────────────────────── */}
      {title && (
        <motion.h2
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="font-serif"
          style={{
            fontSize: 26,
            fontWeight: 300,
            color: '#f0eefc',
            lineHeight: 1.25,
            marginBottom: 10,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </motion.h2>
      )}

      {/* ── Date & location ────────────────────────── */}
      {(displayDate || location) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 18,
            flexWrap: 'wrap',
          }}
        >
          {displayDate && (
            <span
              className="font-sans"
              style={{
                fontSize: 12,
                color: `${ACCENT}cc`,
                letterSpacing: '0.04em',
              }}
            >
              {displayDate}
            </span>
          )}
          {displayDate && location && (
            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>·</span>
          )}
          {location && (
            <span
              className="font-sans"
              style={{ fontSize: 12, color: 'rgba(201,191,232,0.55)' }}
            >
              {location}
            </span>
          )}
        </motion.div>
      )}

      {/* ── Tags ───────────────────────────────────── */}
      {tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.14 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}
        >
          {tags.map((tag) => (
            <span
              key={tag}
              className="font-sans"
              style={{
                padding: '3px 10px',
                borderRadius: 100,
                background: `${ACCENT}0d`,
                border: `1px solid ${ACCENT}28`,
                fontSize: 11,
                color: `${ACCENT}99`,
                letterSpacing: '0.04em',
              }}
            >
              {tag}
            </span>
          ))}
        </motion.div>
      )}

      {/* ── Story ──────────────────────────────────── */}
      {story && (
        <>
          <SectionDivider />
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="font-sans"
            style={{
              fontSize: 14,
              color: 'rgba(240,238,252,0.72)',
              lineHeight: 1.85,
              whiteSpace: 'pre-wrap',
            }}
          >
            {story}
          </motion.p>
        </>
      )}

      {/* ── Voice note ─────────────────────────────── */}
      {hasVoiceNote && (
        <>
          <SectionDivider />
          <p
            className="font-sans"
            style={{
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(201,191,232,0.35)',
              marginBottom: 10,
            }}
          >
            Voice note
          </p>
          <VoiceNotePlayer />
        </>
      )}

      {/* ── Related memories ───────────────────────── */}
      <SectionDivider />
      <RelatedMemories currentId={item.id} />

      {/* ── Edit button ────────────────────────────── */}
      <div style={{ marginTop: 24 }}>
        <motion.button
          whileHover={{ background: `${ACCENT}14`, borderColor: `${ACCENT}44` }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: `${ACCENT}bb`,
            fontSize: 13,
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer',
            transition: 'background 0.2s, border-color 0.2s',
          }}
        >
          <span style={{ fontSize: 14 }}>✏️</span>
          Edit memory
        </motion.button>
      </div>
    </motion.article>
  )
}

/* ─── Related memories ────────────────────────────────────────────────── */

function RelatedMemories({ currentId }: Readonly<{ currentId: string }>) {
  // Placeholder — in a real implementation this would filter by shared tags.
  // Reference currentId to satisfy the linter; it will be used when wired to live data.
  const _id = currentId
  return (
    <div>
      <p
        className="font-sans"
        style={{
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'rgba(201,191,232,0.3)',
          marginBottom: 10,
        }}
      >
        Related memories
      </p>
      <p
        className="font-sans"
        style={{
          fontSize: 12,
          color: 'rgba(201,191,232,0.25)',
          fontStyle: 'italic',
        }}
      >
        Tag memories to see connections here.
      </p>
    </div>
  )
}

/* ─── Empty state ─────────────────────────────────────────────────────── */

function EmptyState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: '60px 20px',
        textAlign: 'center',
      }}
    >
      <motion.div
        animate={{
          filter: [
            'drop-shadow(0 0 8px rgba(242,168,184,0.3))',
            'drop-shadow(0 0 20px rgba(242,168,184,0.6))',
            'drop-shadow(0 0 8px rgba(242,168,184,0.3))',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/ui/memories.png" alt="" aria-hidden="true" style={{ width: 56, height: 56, objectFit: 'contain' }} />
      </motion.div>
      <p className="font-serif" style={{ fontSize: 16, color: 'rgba(240,238,252,0.5)', fontStyle: 'italic' }}>
        This memory is still blooming...
      </p>
    </div>
  )
}
