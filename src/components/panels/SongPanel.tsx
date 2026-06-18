'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const { delete: deleteItem, update, memories } = useContentStore()
  const { closeRightPanel, openRightPanel } = useUIStore()
  const [pickerOpen, setPickerOpen] = useState(false)

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

  const linkedIds = (item?.linkedMemories as string[]) ?? []
  const linkedMemories = memories.filter((m) => linkedIds.includes(m.id))
  const availableMemories = memories.filter((m) => !linkedIds.includes(m.id))

  const handleAddMemory = async (memId: string) => {
    if (!item) return
    await update('songs', item.id, { linkedMemories: [...linkedIds, memId] })
    setPickerOpen(false)
  }

  const handleRemoveMemory = async (memId: string) => {
    if (!item) return
    await update('songs', item.id, { linkedMemories: linkedIds.filter((id) => id !== memId) })
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
        {linkedMemories.map((mem) => {
          const memTitle = (mem.title as string) ?? 'Memory'
          const photoUrl = (mem.photoUrl as string) ?? ''
          return (
            <div key={mem.id} style={{ position: 'relative', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => openRightPanel('memory', { id: mem.id })}
                title={memTitle}
                style={{
                  width: 52, height: 52, borderRadius: 12, padding: 0,
                  background: photoUrl ? 'transparent' : 'rgba(242,168,184,0.08)',
                  border: '1px solid rgba(242,168,184,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', overflow: 'hidden',
                }}
              >
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src="/assets/ui/memories.png" alt="" aria-hidden="true" style={{ width: 18, height: 18, objectFit: 'contain', opacity: 0.55 }} />
                )}
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemoveMemory(mem.id) }}
                aria-label={`Unlink ${memTitle}`}
                style={{
                  position: 'absolute', top: -5, right: -5, width: 16, height: 16, borderRadius: '50%',
                  background: 'rgba(20,10,30,0.92)', border: '1px solid rgba(255,255,255,0.18)',
                  color: 'rgba(255,255,255,0.65)', fontSize: 9, lineHeight: 1, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                }}
              >
                ×
              </button>
            </div>
          )
        })}

        {/* Add button */}
        <button
          type="button"
          onClick={() => setPickerOpen((o) => !o)}
          aria-label="Link a memory"
          style={{
            width: 52, height: 52, borderRadius: 12, flexShrink: 0,
            background: pickerOpen ? `${accent}1e` : 'rgba(255,255,255,0.04)',
            border: pickerOpen ? `1px solid ${accent}55` : '1px dashed rgba(255,255,255,0.2)',
            color: pickerOpen ? accent : 'rgba(240,238,252,0.5)',
            fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          +
        </button>
      </div>

      {/* Memory picker dropdown */}
      <AnimatePresence>
        {pickerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              marginTop: 8, maxHeight: 180, overflowY: 'auto', borderRadius: 12,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: 6,
            }}>
              {availableMemories.length === 0 ? (
                <p className="font-sans" style={{ fontSize: 11, color: 'rgba(201,191,232,0.4)', padding: 10, textAlign: 'center' }}>
                  No more memories to link
                </p>
              ) : (
                availableMemories.map((mem) => (
                  <button
                    key={mem.id}
                    type="button"
                    onClick={() => handleAddMemory(mem.id)}
                    style={{
                      display: 'flex', width: '100%', alignItems: 'center', gap: 8,
                      padding: '8px 10px', borderRadius: 8, background: 'transparent', border: 'none',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span className="font-serif" style={{ fontStyle: 'italic', fontSize: 12.5, color: 'rgba(240,238,252,0.82)' }}>
                      {(mem.title as string) || 'Untitled Memory'}
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
