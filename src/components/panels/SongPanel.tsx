'use client'
import { motion } from 'framer-motion'
import { useContentStore, type ContentItem } from '@/store/useContentStore'
import { useUIStore } from '@/store/useUIStore'
import { DeleteButton } from './shared'

interface Props {
  item: ContentItem | null
}

const accent = '#ffb450'

const MOODS = [
  { label: 'Love',       color: '#f2a8b8' },
  { label: 'Comfort',    color: '#8aa0ff' },
  { label: 'Dreams',     color: '#b48cf0' },
  { label: 'Milestones', color: '#e8c97a' },
]

export default function SongPanel({ item }: Readonly<Props>) {
  const { delete: deleteItem } = useContentStore()
  const { closeRightPanel } = useUIStore()

  const title       = (item?.title   as string) ?? 'Song Title'
  const artist      = (item?.artist  as string) ?? 'Artist'
  const url         = (item?.url     as string) ?? ''
  const whyItMatters = (item?.why    as string) ?? ''
  const mood        = (item?.mood    as string) ?? ''
  const albumArt    = (item?.albumArt as string) ?? ''

  const moodConfig = MOODS.find((m) => m.label === mood)

  const handlePlay = () => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div>
      {/* Album art */}
      <div style={{
        width: '100%',
        aspectRatio: '1',
        borderRadius: 20,
        background: albumArt
          ? 'transparent'
          : `linear-gradient(135deg, ${accent}22, rgba(255,255,255,0.04))`,
        border: `1px solid ${accent}28`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        overflow: 'hidden',
      }}>
        {albumArt ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={albumArt} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 56, filter: `drop-shadow(0 0 20px ${accent}88)` }}>🏮</span>
        )}
      </div>

      {/* Title */}
      <p className="font-serif" style={{ fontSize: 22, fontWeight: 300, color: '#f0eefc', marginBottom: 4 }}>
        {title}
      </p>

      {/* Artist */}
      <p className="font-sans" style={{ fontSize: 13, color: 'rgba(201,191,232,0.5)', marginBottom: 18 }}>
        {artist}
      </p>

      {/* Play button */}
      <motion.button
        onClick={handlePlay}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px',
          borderRadius: 100, background: `${accent}22`, border: `1px solid ${accent}44`,
          color: accent, fontSize: 14, fontFamily: 'Inter,sans-serif', cursor: 'pointer',
          width: '100%', justifyContent: 'center',
        }}
        whileHover={{ background: `${accent}33`, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        <span style={{ fontSize: 16 }}>▶</span>
        {url ? 'Play this song' : 'No link added'}
      </motion.button>

      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${accent}28, transparent)`, margin: '18px 0' }} />

      {/* Why this matters */}
      <p className="font-sans" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(201,191,232,0.4)', marginBottom: 8 }}>
        Why this song matters
      </p>
      <p className="font-serif" style={{ fontSize: 14, fontStyle: 'italic', color: 'rgba(240,238,252,0.7)', lineHeight: 1.8, marginBottom: 18 }}>
        {whyItMatters
          ? `"${whyItMatters}"`
          : '"This song will appear once you add it to your story."'}
      </p>

      {/* Mood chip */}
      {moodConfig && (
        <div style={{ marginBottom: 18 }}>
          <span
            className="font-sans"
            style={{
              padding: '5px 14px',
              borderRadius: 100,
              background: `${moodConfig.color}18`,
              border: `1px solid ${moodConfig.color}44`,
              fontSize: 12,
              color: moodConfig.color,
            }}
          >
            {mood}
          </span>
        </div>
      )}

      {/* Linked memories row — horizontal scroll */}
      <p className="font-sans" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(201,191,232,0.35)', marginBottom: 10 }}>
        Linked memories
      </p>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              flexShrink: 0,
              background: 'rgba(242,168,184,0.08)',
              border: '1px solid rgba(242,168,184,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/ui/petal.png" alt="" aria-hidden="true" style={{ width: 16, height: 16, objectFit: 'contain', opacity: 0.3 }} />
          </div>
        ))}
      </div>

      {item && (
        <div style={{ marginTop: 20 }}>
          <DeleteButton
            label="song"
            onDelete={() => { deleteItem('songs', item.id); closeRightPanel() }}
          />
        </div>
      )}
    </div>
  )
}
