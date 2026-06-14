'use client'
import { motion } from 'framer-motion'
import type { ContentItem } from '@/store/useContentStore'

interface Props {
  item: ContentItem | null
}

const accent = '#a8d0e8'

export default function PlacePanel({ item }: Readonly<Props>) {
  const name       = (item?.name       as string)  ?? 'Unknown Place'
  const country    = (item?.country    as string)  ?? ''
  const notes      = (item?.notes      as string)  ?? ''
  const visited    = (item?.visited    as boolean) ?? false
  const photoUrl   = (item?.photoUrl   as string)  ?? ''

  return (
    <div>
      {/* Photo placeholder */}
      <div style={{
        width: '100%',
        aspectRatio: '16/9',
        borderRadius: 16,
        background: photoUrl
          ? 'transparent'
          : `linear-gradient(135deg, ${accent}18, rgba(255,255,255,0.03))`,
        border: `1px solid ${accent}22`,
        overflow: 'hidden',
        marginBottom: 18,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/assets/ui/map.png" alt="" aria-hidden="true" style={{ width: 36, height: 36, objectFit: 'contain', opacity: 0.25 }} />
        )}
      </div>

      {/* Place name + country */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
        <p className="font-serif" style={{ fontSize: 20, fontWeight: 300, color: '#f0eefc' }}>
          {name}
        </p>
        {country && (
          <p className="font-sans" style={{ fontSize: 13, color: 'rgba(201,191,232,0.5)' }}>
            {country}
          </p>
        )}
      </div>

      {/* Visited / Dream destination badge */}
      <div style={{ marginBottom: 18 }}>
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 14px',
            borderRadius: 100,
            background: visited ? `${accent}18` : 'rgba(255,255,255,0.05)',
            border: visited ? `1px solid ${accent}44` : '1px solid rgba(255,255,255,0.1)',
            fontSize: 12,
            fontFamily: 'Inter,sans-serif',
            color: visited ? accent : 'rgba(201,191,232,0.5)',
          }}
        >
          {visited ? '✈️ We\'ve been here' : '🌟 Dream destination'}
        </motion.span>
      </div>

      {/* Notes */}
      {notes ? (
        <p className="font-sans" style={{ fontSize: 13, color: 'rgba(240,238,252,0.65)', lineHeight: 1.75, marginBottom: 20 }}>
          {notes}
        </p>
      ) : (
        <p className="font-sans" style={{ fontSize: 13, color: 'rgba(201,191,232,0.3)', lineHeight: 1.75, fontStyle: 'italic', marginBottom: 20 }}>
          No notes added yet...
        </p>
      )}

      {/* Map embed placeholder */}
      <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 14, background: 'rgba(168,208,232,0.05)', border: '1px solid rgba(168,208,232,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/ui/map.png" alt="" aria-hidden="true" style={{ width: 24, height: 24, objectFit: 'contain', opacity: 0.5 }} />
        <p className="font-sans" style={{ fontSize: 12, color: 'rgba(168,208,232,0.4)', letterSpacing: '0.06em' }}>
          Map
        </p>
      </div>
    </div>
  )
}
