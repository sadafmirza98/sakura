'use client'
/**
 * TimelineSections — replaces the old flat per-item strip at the bottom
 * of the timeline overlay. Groups saved items by type into chips
 * ("Memory · 3", "Poem · 2", ...). Clicking a chip opens a modal listing
 * every item of that type, with View/Edit/Delete actions inline.
 *
 * Songs are intentionally excluded — they surface instead as a
 * "Related Song" picker when creating a memory.
 */
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useContentStore, type ContentItem } from '@/store/useContentStore'
import { useUIStore, type RightPanelType } from '@/store/useUIStore'
import { EditMemoryForm } from '@/components/panels/shared'

const SECTION_CFG = {
  memories: { label: 'Memory', plural: 'Memories', icon: '/assets/ui/memories.png', accent: '#f2a8b8', panelType: 'memory', getTitle: (i: ContentItem) => (i.title as string) || 'Memory' },
  poems:    { label: 'Poem',   plural: 'Poems',    icon: '/assets/ui/letter.png',   accent: '#c9bfe8', panelType: 'poem',   getTitle: (i: ContentItem) => (i.title as string) || 'Poem' },
  letters:  { label: 'Letter', plural: 'Letters',  icon: '/assets/ui/letter.png',   accent: '#d4aaff', panelType: 'letter', getTitle: (i: ContentItem) => (i.openWhen as string) || 'Letter' },
  wishes:   { label: 'Wish',   plural: 'Wishes',   icon: '/assets/ui/lantern.png',  accent: '#a8d8a0', panelType: 'wish',   getTitle: (i: ContentItem) => (i.wish as string) || 'Wish' },
  places:   { label: 'Place',  plural: 'Places',   icon: '/assets/ui/map.png',      accent: '#ffe890', panelType: 'place',  getTitle: (i: ContentItem) => (i.place as string) || 'Place' },
} as const

type SectionKey = keyof typeof SECTION_CFG

function sortByDateDesc(items: ContentItem[]): ContentItem[] {
  return [...items].sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')))
}

function formatDate(raw: unknown): string {
  if (!raw) return ''
  try {
    return new Date(raw as string).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}

/* ─── compact inline row actions ─────────────────────────────────────── */

function RowActionButton({ label, accent, onClick }: Readonly<{ label: string; accent: string; onClick: () => void }>) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 10px', borderRadius: 8, cursor: 'pointer',
        background: `${accent}14`, border: `1px solid ${accent}33`,
        color: accent, fontSize: 11, fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

function RowDeleteButton({ onDelete }: Readonly<{ onDelete: () => void }>) {
  const [confirming, setConfirming] = useState(false)
  return (
    <button
      onClick={() => {
        if (confirming) { onDelete(); return }
        setConfirming(true)
        setTimeout(() => setConfirming(false), 3000)
      }}
      style={{
        padding: '5px 10px', borderRadius: 8, cursor: 'pointer',
        background: confirming ? 'rgba(224,100,100,0.16)' : 'rgba(255,255,255,0.04)',
        border: confirming ? '1px solid rgba(224,100,100,0.45)' : '1px solid rgba(255,255,255,0.08)',
        color: confirming ? '#ff9a9a' : 'rgba(240,238,252,0.45)',
        fontSize: 11, fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
      }}
    >
      {confirming ? 'Confirm?' : 'Delete'}
    </button>
  )
}

/* ─── section modal ──────────────────────────────────────────────────── */

interface SectionModalProps {
  readonly sectionKey: SectionKey
  readonly items: ContentItem[]
  readonly onClose: () => void
}

function SectionModal({ sectionKey, items, onClose }: SectionModalProps) {
  const cfg = SECTION_CFG[sectionKey]
  const { delete: deleteItem, update } = useContentStore()
  const { closeTimeline, openRightPanel } = useUIStore()
  const [editingId, setEditingId] = useState<string | null>(null)

  const sorted = sortByDateDesc(items)

  const handleView = (id: string) => {
    closeTimeline()
    openRightPanel(cfg.panelType as RightPanelType, { id })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(4,2,14,0.6)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        pointerEvents: 'auto',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(440px, 100%)', maxHeight: '78vh', overflowY: 'auto',
          background: 'linear-gradient(160deg, rgba(10,7,24,0.97) 0%, rgba(6,4,16,0.98) 100%)',
          border: `1px solid ${cfg.accent}28`,
          borderRadius: 18,
          boxShadow: `0 30px 90px rgba(0,0,0,0.55), 0 0 40px ${cfg.accent}14`,
          padding: '20px 18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cfg.icon} alt="" aria-hidden="true" style={{ width: 22, height: 22, objectFit: 'contain', filter: `drop-shadow(0 0 6px ${cfg.accent}99)` }} />
            <p className="font-serif" style={{ fontSize: 16, color: '#f0eefc', fontWeight: 300 }}>
              {sorted.length === 1 ? cfg.label : cfg.plural} · {sorted.length}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 28, height: 28, borderRadius: 8, cursor: 'pointer',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(240,238,252,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={13} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sorted.map((item) => {
            if (sectionKey === 'memories' && editingId === item.id) {
              return (
                <div key={item.id} style={{
                  padding: 14, borderRadius: 14,
                  background: 'rgba(255,255,255,0.03)', border: `1px solid ${cfg.accent}28`,
                }}>
                  <EditMemoryForm
                    item={item}
                    onCancel={() => setEditingId(null)}
                    onSave={async (data) => {
                      await update('memories', item.id, data)
                      setEditingId(null)
                    }}
                  />
                </div>
              )
            }

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                  padding: '11px 13px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic', fontSize: 13,
                    color: 'rgba(240,238,252,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {cfg.getTitle(item)}
                  </p>
                  {formatDate(item.createdAt) && (
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(201,191,232,0.35)', marginTop: 2 }}>
                      {formatDate(item.createdAt)}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <RowActionButton label="View" accent={cfg.accent} onClick={() => handleView(item.id)} />
                  {sectionKey === 'memories' && (
                    <RowActionButton label="Edit" accent={cfg.accent} onClick={() => setEditingId(item.id)} />
                  )}
                  <RowDeleteButton onDelete={() => deleteItem(sectionKey, item.id)} />
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── section chips strip ────────────────────────────────────────────── */

export default function TimelineSections() {
  const { memories, poems, letters, wishes, places } = useContentStore()
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null)

  const groups = useMemo(() => {
    const pairs: [SectionKey, ContentItem[]][] = [
      ['memories', memories], ['poems', poems], ['letters', letters],
      ['wishes', wishes], ['places', places],
    ]
    return pairs.filter(([, items]) => items.length > 0)
  }, [memories, poems, letters, wishes, places])

  if (groups.length === 0) return null

  const totalCount = groups.reduce((sum, [, items]) => sum + items.length, 0)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 28 }}
        transition={{ delay: 2.2, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 44,
          background: 'linear-gradient(0deg, rgba(4,2,18,0.96) 0%, rgba(4,2,18,0.72) 65%, transparent 100%)',
          padding: 'clamp(14px, 2vh, 22px) clamp(14px, 2.5vw, 28px) clamp(18px, 3vh, 28px)',
          pointerEvents: 'auto',
        }}
      >
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: 'rgba(201,191,232,0.35)', marginBottom: 10, paddingLeft: 2,
        }}>
          Our story · {totalCount} {totalCount === 1 ? 'moment' : 'moments'}
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {groups.map(([key, items]) => {
            const cfg = SECTION_CFG[key]
            return (
              <motion.button
                key={key}
                onClick={() => setActiveSection(key)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 16px', borderRadius: 100,
                  background: `${cfg.accent}0e`, border: `1px solid ${cfg.accent}28`,
                  cursor: 'pointer',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cfg.icon} alt="" aria-hidden="true" style={{ width: 14, height: 14, objectFit: 'contain', filter: `drop-shadow(0 0 4px ${cfg.accent}88)` }} />
                <span style={{
                  fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic', fontSize: 13,
                  color: 'rgba(240,238,252,0.85)',
                }}>
                  {cfg.label} <span style={{ color: cfg.accent, opacity: 0.8 }}>({items.length})</span>
                </span>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      <AnimatePresence>
        {activeSection && (
          <SectionModal
            sectionKey={activeSection}
            items={groups.find(([k]) => k === activeSection)?.[1] ?? []}
            onClose={() => setActiveSection(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
