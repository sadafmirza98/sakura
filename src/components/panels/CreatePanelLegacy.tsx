'use client'
/**
 * CreatePanelLegacy — the original create-form content extracted from the old RightPanel.
 * Kept as a bridge until Task 7 replaces each form with a dedicated component.
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useUIStore } from '@/store/useUIStore'
import { useAppStore } from '@/store/useAppStore'

type CreateType = 'memory' | 'song' | 'poem' | 'whisper' | 'wish' | 'place' | 'letter' | 'milestone'

interface Props {
  createType: string | null
  accentColor: string
  blossomCount: number
  relationshipStartDate: string
}

const FORM_META: Record<CreateType, { emoji: string; title: string; blossoms: number }> = {
  memory:    { emoji: '🌸', title: 'Plant a Memory',    blossoms: 1 },
  song:      { emoji: '🏮', title: 'Hang a Lantern',    blossoms: 1 },
  poem:      { emoji: '🪷', title: 'Release a Petal',   blossoms: 2 },
  whisper:   { emoji: '🍃', title: 'Whisper a Leaf',    blossoms: 0 },
  wish:      { emoji: '⭐', title: 'Plant a Wish',      blossoms: 0 },
  place:     { emoji: '📍', title: 'Mark a Footprint',  blossoms: 0 },
  letter:    { emoji: '🕊️', title: 'Seal a Letter',     blossoms: 3 },
  milestone: { emoji: '🕯️', title: 'Light a Milestone', blossoms: 5 },
}

const MOODS = [
  { label: 'Love',        color: '#f2a8b8' },
  { label: 'Comfort',     color: '#8aa0ff' },
  { label: 'Dreams',      color: '#b48cf0' },
  { label: 'Milestones',  color: '#e8c97a' },
  { label: 'Nostalgia',   color: '#c9bfe8' },
  { label: 'Hope',        color: '#a8e8c0' },
  { label: 'Missing You', color: '#d4aaff' },
]
const WISH_CATS = ['Travel', 'Food', 'Experiences', 'Marriage', 'Faith', 'Personal Growth', 'Career', 'Life Goals']

const IS: React.CSSProperties = {
  width: '100%', padding: '12px 14px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 12, outline: 'none',
  color: 'rgba(240,238,252,0.9)', fontSize: 13,
  fontFamily: 'Inter,sans-serif', fontWeight: 300,
  boxSizing: 'border-box',
}
const TA: React.CSSProperties = { ...IS, resize: 'none', lineHeight: 1.7 }
const SEL: React.CSSProperties = { ...IS, appearance: 'none', cursor: 'pointer' }
const POETIC: React.CSSProperties = {
  ...TA,
  fontFamily: 'Playfair Display,serif',
  fontStyle: 'italic',
  fontSize: 14,
  lineHeight: 2,
}

function F({ label, children }: Readonly<{ label?: string; children: React.ReactNode }>) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <p style={{ display: 'block', marginBottom: 6, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(201,191,232,0.4)', fontFamily: 'Inter,sans-serif' }}>
          {label}
        </p>
      )}
      {children}
    </div>
  )
}

export default function CreatePanelLegacy({ createType, accentColor }: Readonly<Props>) {
  const { closeRightPanel, closeCreate } = useUIStore()
  const { addBlossoms } = useAppStore()
  const [activeMood, setActiveMood] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const type = (createType ?? 'memory') as CreateType
  const meta = FORM_META[type] ?? FORM_META.memory
  const accent = accentColor

  const handleSave = () => {
    setSubmitted(true)
    if (meta.blossoms > 0) addBlossoms(meta.blossoms)
    setTimeout(() => {
      setSubmitted(false)
      closeRightPanel()
      closeCreate()
    }, 1600)
  }

  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 16 }}>
        <motion.div
          style={{ fontSize: 48 }}
          animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }}
          transition={{ duration: 0.8 }}
        >
          ✨
        </motion.div>
        <p className="font-serif" style={{ fontSize: 17, color: accent, fontStyle: 'italic', textAlign: 'center' }}>
          Growing on the tree...
        </p>
        <p className="font-sans" style={{ fontSize: 12, color: 'rgba(201,191,232,0.4)', textAlign: 'center' }}>
          +{meta.blossoms} blossom{meta.blossoms === 1 ? '' : 's'} added
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Form header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 28, filter: `drop-shadow(0 0 10px ${accent}88)` }}>{meta.emoji}</span>
        <div>
          <p className="font-serif" style={{ fontSize: 16, color: '#f0eefc', fontWeight: 300 }}>{meta.title}</p>
          {meta.blossoms > 0 && (
            <p className="font-sans" style={{ fontSize: 11, color: accent + '99', marginTop: 2 }}>
              +{meta.blossoms} blossom{meta.blossoms === 1 ? '' : 's'} will bloom
            </p>
          )}
        </div>
      </div>

      {type === 'memory' && <>
        <F label="Title"><input style={IS} type="text" placeholder="Name this memory..." /></F>
        <F label="Date"><input style={IS} type="date" /></F>
        <F label="Your story"><textarea style={TA} rows={4} placeholder="What do you want to remember forever..." /></F>
        <F label="Tags"><input style={IS} type="text" placeholder="first times, rain, laughter..." /></F>
      </>}

      {type === 'song' && <>
        <F label="Link (optional)"><input style={IS} type="url" placeholder="YouTube or Spotify URL..." /></F>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <F label="Song title"><input style={IS} type="text" placeholder="Title..." /></F>
          <F label="Artist"><input style={IS} type="text" placeholder="Artist..." /></F>
        </div>
        <div style={{ marginBottom: 14 }}>
          <p style={{ display: 'block', marginBottom: 8, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(201,191,232,0.4)', fontFamily: 'Inter,sans-serif' }}>Mood</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {MOODS.map(({ label, color }) => (
              <motion.button
                key={label}
                onClick={() => setActiveMood(activeMood === label ? null : label)}
                style={{
                  padding: '5px 12px', borderRadius: 100, cursor: 'pointer',
                  fontSize: 11, fontFamily: 'Inter,sans-serif',
                  background: activeMood === label ? color + '22' : 'rgba(255,255,255,0.04)',
                  border: activeMood === label ? `1px solid ${color}66` : '1px solid rgba(255,255,255,0.08)',
                  color: activeMood === label ? color : 'rgba(240,238,252,0.5)',
                  boxShadow: activeMood === label ? `0 0 10px ${color}33` : 'none',
                  transition: 'all 0.2s',
                }}
                whileTap={{ scale: 0.93 }}
              >
                {label}
              </motion.button>
            ))}
          </div>
        </div>
        <F label="Why this song matters">
          <textarea style={{ ...TA, fontStyle: 'italic' }} rows={3} placeholder="The story behind this song..." />
        </F>
      </>}

      {type === 'poem' && <>
        <F label="Title"><input style={IS} type="text" placeholder="Name this petal..." /></F>
        <F label="Poem"><textarea style={POETIC} rows={9} placeholder="Let the words fall like petals..." /></F>
      </>}

      {type === 'whisper' && (
        <F>
          <textarea style={{ ...TA, fontStyle: 'italic', fontSize: 14, lineHeight: 1.8 }} rows={6} placeholder="An inside joke, a quiet thought, a tiny love note..." />
        </F>
      )}

      {type === 'wish' && <>
        <F label="The wish"><input style={IS} type="text" placeholder="What do you wish for together..." /></F>
        <F label="Category">
          <select style={SEL}>
            <option value="">Choose a category...</option>
            {WISH_CATS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </F>
      </>}

      {type === 'place' && <>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <F label="Place name"><input style={IS} type="text" placeholder="Kyoto..." /></F>
          <F label="Country"><input style={IS} type="text" placeholder="Japan..." /></F>
        </div>
        <F label="Date"><input style={IS} type="date" /></F>
        <F label="Notes"><textarea style={TA} rows={3} placeholder="What you felt, what you saw..." /></F>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <input type="checkbox" id="visited-create" style={{ accentColor: accent, width: 15, height: 15 }} />
          <label htmlFor="visited-create" style={{ fontSize: 13, color: 'rgba(240,238,252,0.65)', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
            We&apos;ve been here together
          </label>
        </div>
      </>}

      {type === 'letter' && <>
        <F label="Open when..."><input style={IS} type="text" placeholder="Open on our anniversary..." /></F>
        <F label="Unlock date"><input style={IS} type="date" /></F>
        <F label="Your letter"><textarea style={POETIC} rows={8} placeholder="Write from your heart..." /></F>
      </>}

      {type === 'milestone' && <>
        <F label="Milestone"><input style={IS} type="text" placeholder="First conversation, first trip..." /></F>
        <F label="Date"><input style={IS} type="date" /></F>
        <F label="The story"><textarea style={TA} rows={4} placeholder="Tell the story of this moment..." /></F>
      </>}

      {/* Save button */}
      <motion.button
        onClick={handleSave}
        style={{
          width: '100%', padding: '13px 20px', marginTop: 6, borderRadius: 14,
          border: `1px solid ${accent}44`,
          background: `linear-gradient(135deg, ${accent}1e 0%, ${accent}12 100%)`,
          color: accent, fontSize: 14, fontFamily: 'Inter,sans-serif',
          fontWeight: 400, letterSpacing: '0.03em', cursor: 'pointer',
          position: 'relative', overflow: 'hidden',
        }}
        whileHover={{ boxShadow: `0 0 24px ${accent}28`, borderColor: accent + '88', scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        <div style={{ position: 'absolute', inset: 0, borderRadius: 14, background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
        {meta.emoji} {meta.title}
      </motion.button>
    </div>
  )
}
