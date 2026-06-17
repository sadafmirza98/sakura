'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useContentStore, type ContentItem } from '@/store/useContentStore'
import { useUIStore, type RightPanelType } from '@/store/useUIStore'
import type { CreateType } from '@/store/useUIStore'

type CollectionKey = 'poems' | 'letters' | 'wishes' | 'places' | 'songs' | 'memories' | 'whispers'

interface AccordionCfg {
  readonly storeName: CollectionKey
  readonly panelType: RightPanelType
  readonly label: string
  readonly accent: string
  readonly getTitle: (item: ContentItem) => string
}

const CFG: Partial<Record<CreateType, AccordionCfg>> = {
  poem:      { storeName: 'poems',    panelType: 'poem',    label: 'Poems',      accent: '#c9bfe8', getTitle: i => String(i.title    ?? 'Untitled Poem') },
  letter:    { storeName: 'letters',  panelType: 'letter',  label: 'Letters',    accent: '#d4aaff', getTitle: i => String(i.openWhen ?? 'Sealed Letter')  },
  wish:      { storeName: 'wishes',   panelType: 'wish',    label: 'Wishes',     accent: '#a8d8a0', getTitle: i => String(i.wish     ?? 'A shared wish')   },
  place:     { storeName: 'places',   panelType: 'place',   label: 'Places',     accent: '#ffe890', getTitle: i => String(i.place    ?? 'Unnamed Place')   },
  song:      { storeName: 'songs',    panelType: 'song',    label: 'Songs',      accent: '#ffb450', getTitle: i => String(i.title    ?? 'Untitled Song')   },
  memory:    { storeName: 'memories', panelType: 'memory',  label: 'Memories',   accent: '#f2a8b8', getTitle: i => String(i.title    ?? 'Memory')          },
  whisper:   { storeName: 'whispers', panelType: 'whisper', label: 'Whispers',   accent: '#a8d8a0', getTitle: i => String(i.text     ?? 'A whisper')        },
  milestone: { storeName: 'memories', panelType: 'memory',  label: 'Milestones', accent: '#e8c97a', getTitle: i => String(i.title    ?? 'Milestone')        },
}

interface Props {
  readonly createType: CreateType | null
  readonly highlightedId: string | null
}

export default function SavedAccordion({ createType, highlightedId }: Props) {
  const { poems, letters, wishes, places, songs, memories, whispers } = useContentStore()
  const { openRightPanel } = useUIStore()
  const [open, setOpen] = useState(false)

  const cfg = createType ? CFG[createType] : undefined

  const storeMap: Record<CollectionKey, ContentItem[]> = { poems, letters, wishes, places, songs, memories, whispers }
  const allItems = cfg ? (storeMap[cfg.storeName] ?? []) : []
  const items = createType === 'milestone'
    ? allItems.filter(i => i.type === 'milestone')
    : allItems

  const sorted = [...items].sort((a, b) => {
    const ad = String(a.createdAt ?? '')
    const bd = String(b.createdAt ?? '')
    return bd.localeCompare(ad)
  })

  useEffect(() => {
    if (highlightedId) setOpen(true)
  }, [highlightedId])

  useEffect(() => {
    if (!highlightedId || !open) return
    const el = document.getElementById(`saved-item-${highlightedId}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [highlightedId, open])

  if (!cfg || sorted.length === 0) return null

  const formatDate = (raw: unknown): string => {
    if (!raw) return ''
    try {
      return new Date(raw as string).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    } catch {
      return ''
    }
  }

  return (
    <div style={{ marginTop: 28 }}>
      <div style={{
        height: 1,
        background: `linear-gradient(90deg, transparent, ${cfg.accent}30, transparent)`,
        marginBottom: 16,
      }} />

      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '0 0 12px 0', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', outline: 'none',
        }}
      >
        <span style={{
          fontFamily: 'Inter, sans-serif', fontSize: 10,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: `${cfg.accent}88`,
        }}>
          {cfg.label} saved · {sorted.length}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22 }}
          style={{ fontSize: 12, color: `${cfg.accent}55`, display: 'block', lineHeight: 1 }}
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 4,
              maxHeight: 240, overflowY: 'auto', paddingBottom: 8,
            }}>
              {sorted.map((item) => {
                const isNew = item.id === highlightedId
                return (
                  <motion.button
                    key={item.id}
                    id={`saved-item-${item.id}`}
                    onClick={() => openRightPanel(cfg.panelType, { id: item.id })}
                    initial={isNew ? { scale: 0.97 } : false}
                    animate={isNew ? { scale: [0.97, 1.02, 1] } : {}}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '9px 12px', borderRadius: 10, cursor: 'pointer',
                      background: isNew ? `${cfg.accent}18` : 'rgba(255,255,255,0.025)',
                      border: `1px solid ${isNew ? `${cfg.accent}44` : 'rgba(255,255,255,0.06)'}`,
                      textAlign: 'left', outline: 'none', width: '100%',
                      boxShadow: isNew ? `0 0 14px ${cfg.accent}22` : 'none',
                      transition: 'background 0.25s, border-color 0.25s, box-shadow 0.25s',
                    }}
                  >
                    <span style={{
                      fontFamily: '"Playfair Display", Georgia, serif',
                      fontStyle: 'italic', fontSize: 12.5,
                      color: isNew ? 'rgba(240,238,252,0.92)' : 'rgba(240,238,252,0.55)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      flex: 1, minWidth: 0, marginRight: 10,
                    }}>
                      {cfg.getTitle(item)}
                    </span>
                    {formatDate(item.createdAt) && (
                      <span style={{
                        fontFamily: 'Inter, sans-serif', fontSize: 9,
                        color: `${cfg.accent}44`, whiteSpace: 'nowrap', flexShrink: 0,
                      }}>
                        {formatDate(item.createdAt)}
                      </span>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
