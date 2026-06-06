'use client'
import { motion } from 'framer-motion'
import type { ContentItem } from '@/store/useContentStore'

interface Props {
  item: ContentItem | null
}

const accent = '#ffe890'

function StarRating({ rating }: Readonly<{ rating: number }>) {
  const stars = 5
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {Array.from({ length: stars }).map((_, i) => (
        <span
          key={`star-${i}`}
          style={{
            fontSize: 16,
            color: i < rating ? accent : 'rgba(255,255,255,0.15)',
            filter: i < rating ? `drop-shadow(0 0 4px ${accent}88)` : 'none',
          }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export default function EveningPanel({ item }: Readonly<Props>) {
  const title       = (item?.title       as string)  ?? 'Untitled Evening'
  const posterUrl   = (item?.posterUrl   as string)  ?? ''
  const watched     = (item?.watched     as boolean) ?? false
  const rating      = (item?.rating      as number)  ?? 0
  const review      = (item?.review      as string)  ?? ''
  const streamingUrl = (item?.streamingUrl as string) ?? ''
  const streamingService = (item?.streamingService as string) ?? 'Watch'

  const handleStreamingClick = () => {
    if (streamingUrl) window.open(streamingUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div>
      {/* Poster — aspect 2:3 */}
      <div style={{
        width: '60%',
        margin: '0 auto 20px',
        aspectRatio: '2/3',
        borderRadius: 12,
        background: posterUrl
          ? 'transparent'
          : `linear-gradient(160deg, ${accent}18, rgba(255,255,255,0.03))`,
        border: `1px solid ${accent}22`,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 12px 40px rgba(0,0,0,0.5)`,
      }}>
        {posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={posterUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 40, opacity: 0.25 }}>⭐</span>
        )}
      </div>

      {/* Title */}
      <p className="font-serif" style={{ fontSize: 20, fontWeight: 300, color: '#f0eefc', marginBottom: 10, textAlign: 'center' }}>
        {title}
      </p>

      {/* Watched / planned badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            padding: '4px 14px',
            borderRadius: 100,
            background: watched ? `${accent}18` : 'rgba(255,255,255,0.06)',
            border: watched ? `1px solid ${accent}44` : '1px solid rgba(255,255,255,0.12)',
            fontSize: 12,
            fontFamily: 'Inter,sans-serif',
            color: watched ? accent : 'rgba(201,191,232,0.5)',
          }}
        >
          {watched ? '✓ Watched' : '📋 Planned'}
        </motion.span>
      </div>

      {/* Rating stars — display only */}
      {watched && rating > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <StarRating rating={rating} />
        </div>
      )}

      {/* Review */}
      {review ? (
        <p className="font-sans" style={{ fontSize: 13, color: 'rgba(240,238,252,0.65)', lineHeight: 1.75, marginBottom: 20 }}>
          {review}
        </p>
      ) : (
        <p className="font-sans" style={{ fontSize: 13, color: 'rgba(201,191,232,0.3)', lineHeight: 1.75, fontStyle: 'italic', marginBottom: 20 }}>
          {watched ? 'No review written yet...' : 'Waiting to be watched together...'}
        </p>
      )}

      {/* Streaming link button */}
      {streamingUrl && (
        <motion.button
          onClick={handleStreamingClick}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px',
            borderRadius: 100, background: `${accent}18`, border: `1px solid ${accent}44`,
            color: accent, fontSize: 14, fontFamily: 'Inter,sans-serif', cursor: 'pointer',
            width: '100%', justifyContent: 'center',
          }}
          whileHover={{ background: `${accent}2a`, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <span>▶</span> {streamingService}
        </motion.button>
      )}
    </div>
  )
}
