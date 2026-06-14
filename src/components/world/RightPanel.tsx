'use client'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'
import { useContentStore } from '@/store/useContentStore'

// Panel sub-views
import MemoryPanel  from '@/components/panels/MemoryPanel'
import SongPanel    from '@/components/panels/SongPanel'
import PoemPanel    from '@/components/panels/PoemPanel'
import WhisperPanel from '@/components/panels/WhisperPanel'
import LetterPanel  from '@/components/panels/LetterPanel'
import WishPanel    from '@/components/panels/WishPanel'
import PlacePanel   from '@/components/panels/PlacePanel'
import EveningPanel from '@/components/panels/EveningPanel'
import DreamPanel   from '@/components/panels/DreamPanel'
import ComfortPanel from '@/components/panels/ComfortPanel'

// Creation forms — one per content type
import CreateMemoryForm    from '@/components/forms/CreateMemoryForm'
import CreateSongForm      from '@/components/forms/CreateSongForm'
import CreatePoemForm      from '@/components/forms/CreatePoemForm'
import CreateWhisperForm   from '@/components/forms/CreateWhisperForm'
import CreateWishForm      from '@/components/forms/CreateWishForm'
import CreatePlaceForm     from '@/components/forms/CreatePlaceForm'
import CreateLetterForm    from '@/components/forms/CreateLetterForm'
import CreateMilestoneForm from '@/components/forms/CreateMilestoneForm'

/* ─── Panel header config per type ──────────────────────────────────────── */
interface PanelConfig {
  icon: string   // path to PNG asset
  title: string
  subtitle: string
  accent: string
}

// Asset mapping — only use PNGs that physically exist in /public/assets/ui/
const ICONS = {
  memories:  '/assets/ui/memories.png',
  petal:     '/assets/ui/petal.png',
  letter:    '/assets/ui/letter.png',
  lantern:   '/assets/ui/lantern.png',
  map:       '/assets/ui/map.png',
  candle:    '/assets/ui/candle.png',
  magicBook: '/assets/ui/magic-book.png',
} as const

const PANEL_CFG: Record<string, PanelConfig> = {
  create:  { icon: ICONS.magicBook, title: 'Add to our story',  subtitle: 'A new petal for the tree',     accent: '#f2a8b8' },
  memory:  { icon: ICONS.memories,  title: 'Memory',            subtitle: 'A moment held in blossom',     accent: '#f2a8b8' },
  song:    { icon: ICONS.petal,     title: 'Song',              subtitle: 'A melody woven into time',     accent: '#ffb450' },
  poem:    { icon: ICONS.letter,    title: 'Poem',              subtitle: 'Words adrift in the air',      accent: '#c9bfe8' },
  whisper: { icon: ICONS.petal,     title: 'Whisper',           subtitle: 'A quiet leaf in the wind',     accent: '#a8d8a0' },
  letter:  { icon: ICONS.letter,    title: 'Sealed Letter',     subtitle: 'A crane carrying words',       accent: '#d4aaff' },
  wish:    { icon: ICONS.lantern,   title: 'Spring Wish',       subtitle: 'A lantern into the future',    accent: '#a8d8a0' },
  place:   { icon: ICONS.map,       title: 'Place',             subtitle: 'A footprint on the map',       accent: '#ffe890' },
  evening: { icon: ICONS.candle,    title: 'Evening',           subtitle: 'A star in the sky above',      accent: '#ffe890' },
  dream:   { icon: ICONS.map,       title: 'Shared Dream',      subtitle: 'A constellation of hope',      accent: '#ffe890' },
  comfort: { icon: ICONS.magicBook, title: 'Comfort Space',     subtitle: 'A sanctuary for the heart',    accent: '#f2a8b8' },
}

const CREATE_CFG: Record<string, PanelConfig> = {
  memory:    { icon: ICONS.memories, title: 'New Memory',    subtitle: 'Preserve this moment forever',   accent: '#f2a8b8' },
  song:      { icon: ICONS.petal,    title: 'New Song',      subtitle: 'Add a melody to our story',      accent: '#ffb450' },
  poem:      { icon: ICONS.letter,   title: 'New Poem',      subtitle: 'Write something beautiful',      accent: '#c9bfe8' },
  whisper:   { icon: ICONS.petal,    title: 'New Whisper',   subtitle: 'A quiet thought for the wind',   accent: '#a8d8a0' },
  letter:    { icon: ICONS.letter,   title: 'New Letter',    subtitle: 'Words sealed with love',         accent: '#d4aaff' },
  wish:      { icon: ICONS.lantern,  title: 'New Wish',      subtitle: 'Hang a lantern into the future', accent: '#a8d8a0' },
  place:     { icon: ICONS.map,      title: 'New Place',     subtitle: 'Mark a footprint on the map',    accent: '#ffe890' },
  milestone: { icon: ICONS.memories, title: 'New Milestone', subtitle: 'Mark this moment in our story',  accent: '#f2a8b8' },
}

export default function RightPanel() {
  const { rightPanel, selectedItemId, createType, closeRightPanel } = useUIStore()

  // Grab all content arrays to find the selected item
  const {
    memories, songs, poems, whispers, letters,
    wishes, places, evenings, dreams,
  } = useContentStore()

  const isOpen = rightPanel !== null
  // Use create-specific config when in create mode, otherwise use type config
  let cfg: PanelConfig | null = null
  if (rightPanel) {
    if (rightPanel === 'create' && createType) {
      cfg = CREATE_CFG[createType] ?? PANEL_CFG.create
    } else {
      cfg = PANEL_CFG[rightPanel] ?? PANEL_CFG.memory
    }
  }

  // Resolve the selected item from the matching collection
  const getItem = () => {
    if (!selectedItemId || !rightPanel || rightPanel === 'create') return null
    const collections: Record<string, typeof memories> = {
      memory: memories, song: songs, poem: poems,
      whisper: whispers, letter: letters, wish: wishes,
      place: places, evening: evenings, dream: dreams,
    }
    const arr = collections[rightPanel]
    return arr ? (arr.find((x) => x.id === selectedItemId) ?? null) : null
  }

  const item = getItem()

  // Dismiss on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRightPanel()
    }
    globalThis.addEventListener?.('keydown', handler)
    return () => globalThis.removeEventListener?.('keydown', handler)
  }, [isOpen, closeRightPanel])

  return (
    <AnimatePresence>
      {isOpen && cfg && (
        <motion.aside
          key={rightPanel}
          aria-label={cfg.title}
          className="w-[clamp(300px,30vw,420px)] max-[480px]:w-[92vw]"
          style={{
            position: 'fixed',
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: 35,
            display: 'flex',
            flexDirection: 'column',
            // Transparent enough to feel like glass floating over the world
            background: 'linear-gradient(160deg, rgba(8,5,22,0.82) 0%, rgba(4,3,14,0.88) 100%)',
            backdropFilter: 'blur(48px)',
            WebkitBackdropFilter: 'blur(48px)',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '-24px 0 80px rgba(0,0,0,0.4), -1px 0 0 rgba(255,255,255,0.04)',
          }}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        >
          {/* 2px top accent gradient bar */}
          <div
            style={{
              height: 2,
              background: `linear-gradient(90deg, transparent, ${cfg.accent}cc, transparent)`,
              flexShrink: 0,
            }}
          />

          {/* Header */}
          <div
            style={{
              padding: '20px 24px 16px',
              flexShrink: 0,
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* PNG icon + title + subtitle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <motion.div
                  style={{ flexShrink: 0, width: 36, height: 36 }}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.05 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cfg.icon}
                    alt=""
                    aria-hidden="true"
                    style={{
                      width: 36,
                      height: 36,
                      objectFit: 'contain',
                      display: 'block',
                      filter: `drop-shadow(0 0 8px ${cfg.accent}99)`,
                    }}
                  />
                </motion.div>
                <div>
                  <h2
                    className="font-serif"
                    style={{ fontSize: 18, fontWeight: 300, color: '#f0eefc', lineHeight: 1.2 }}
                  >
                    {cfg.title}
                  </h2>
                  <p
                    className="font-sans"
                    style={{ fontSize: 11, color: 'rgba(201,191,232,0.5)', marginTop: 2 }}
                  >
                    {cfg.subtitle}
                  </p>
                </div>
              </div>

              {/* X close button — 32×32px glass pill */}
              <motion.button
                onClick={closeRightPanel}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  cursor: 'pointer',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(240,238,252,0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
                whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.1)', color: cfg.accent }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close panel"
              >
                <X size={14} />
              </motion.button>
            </div>
          </div>

          {/* Scrollable body */}
          <div
            className="panel-scroll"
            style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 40px' }}
          >
            <PanelContent
              type={rightPanel}
              createType={createType}
              item={item}
            />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

/* ─── Route content to the correct sub-panel ────────────────────────────── */
function PanelContent({
  type,
  createType,
  item,
}: Readonly<{
  type: string | null
  createType: string | null
  item: ReturnType<typeof useContentStore.getState>['memories'][number] | null
}>) {
  const { closeRightPanel, closeCreate } = useUIStore()
  const onSave = () => { closeRightPanel(); closeCreate() }

  if (type === 'create') {
    if (createType === 'memory')    return <CreateMemoryForm    onSave={onSave} />
    if (createType === 'song')      return <CreateSongForm      onSave={onSave} />
    if (createType === 'poem')      return <CreatePoemForm      onSave={onSave} />
    if (createType === 'whisper')   return <CreateWhisperForm   onSave={onSave} />
    if (createType === 'wish')      return <CreateWishForm      onSave={onSave} />
    if (createType === 'place')     return <CreatePlaceForm     onSave={onSave} />
    if (createType === 'letter')    return <CreateLetterForm    onSave={onSave} />
    if (createType === 'milestone') return <CreateMilestoneForm onSave={onSave} />
    // Fallback — render memory form if createType is unrecognised
    return <CreateMemoryForm onSave={onSave} />
  }
  if (type === 'memory')  return <MemoryPanel  item={item} />
  if (type === 'song')    return <SongPanel    item={item} />
  if (type === 'poem')    return <PoemPanel    item={item} />
  if (type === 'whisper') return <WhisperPanel item={item} />
  if (type === 'letter')  return <LetterPanel  item={item} />
  if (type === 'wish')    return <WishPanel    item={item} />
  if (type === 'place')   return <PlacePanel   item={item} />
  if (type === 'evening') return <EveningPanel item={item} />
  if (type === 'dream')   return <DreamPanel   item={item} />
  if (type === 'comfort') return <ComfortPanel item={item} />
  return null
}
