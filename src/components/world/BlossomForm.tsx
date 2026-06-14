'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore, type CreateType } from '@/store/useUIStore'
import { useAppStore } from '@/store/useAppStore'

const FORM_META: Record<CreateType, { emoji: string; title: string; color: string; blossoms: number }> = {
  memory:    { emoji: '🌸', title: 'Plant a Memory',     color: '#f2a8b8', blossoms: 1 },
  wish:      { emoji: '🏮', title: 'Hang a Lantern',     color: '#ffb450', blossoms: 1 },
  poem:      { emoji: '🪷', title: 'Release a Petal',    color: '#c9bfe8', blossoms: 2 },
  whisper:   { emoji: '🍃', title: 'Whisper a Leaf',     color: '#a8d8a0', blossoms: 0 },
  song:      { emoji: '⭐', title: 'Sing a Muse',       color: '#e8c97a', blossoms: 0 },
  place:     { emoji: '🗺️', title: 'Mark a Footprint',  color: '#a8d0e8', blossoms: 0 },
  letter:    { emoji: '🕊️', title: 'Seal a Letter',      color: '#d4aaff', blossoms: 3 },
  milestone: { emoji: '🕯️', title: 'Light a Milestone',  color: '#ffd090', blossoms: 5 },
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

export default function BlossomForm() {
  const { createType, closeCreate } = useUIStore()
  const { addBlossoms } = useAppStore()
  const [activeMood, setActiveMood] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const meta = createType ? FORM_META[createType] : null

  const handlePlant = () => {
    if (!meta) return
    setSubmitted(true)
    if (meta.blossoms > 0) addBlossoms(meta.blossoms)
    setTimeout(() => { setSubmitted(false); closeCreate() }, 1800)
  }

  return (
    <AnimatePresence mode="wait">
      {createType && meta && (
        <motion.div
          key={createType}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ perspective: 1000 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Dark world blur — NOT a solid overlay, world still feels present */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(4,3,12,0.72) 0%, rgba(4,3,12,0.9) 100%)',
            backdropFilter: 'blur(4px)',
          }} onClick={closeCreate} />

          {/* Petal burst particles around the form */}
          {!submitted && Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute pointer-events-none"
              style={{
                width: 8+i%5, height: (8+i%5)*0.45,
                borderRadius: '50%',
                background: meta.color,
                opacity: 0,
              }}
              animate={{
                opacity: [0, 0.7, 0],
                x: [0, Math.cos(i/12*Math.PI*2)*120],
                y: [0, Math.sin(i/12*Math.PI*2)*80],
                rotate: [0, 360],
              }}
              transition={{ delay: 0.1+i*0.04, duration: 1.8, ease: 'easeOut' }}
            />
          ))}

          {/* Form card — blossom style */}
          <motion.div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 520,
              margin: '0 20px',
              background: 'linear-gradient(160deg, rgba(14,9,35,0.97) 0%, rgba(8,5,22,0.99) 100%)',
              borderRadius: 32,
              border: `1px solid ${meta.color}28`,
              boxShadow: `0 0 80px ${meta.color}18, 0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04) inset`,
              overflow: 'hidden',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            initial={{ scale: 0.7, y: 60, rotateX: 8 }}
            animate={{ scale: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.8, y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          >
            {/* Color bar */}
            <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${meta.color}cc, transparent)` }} />

            {/* Decorative blossom petals — top corners */}
            <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%',
              background: `radial-gradient(circle, ${meta.color}22 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: -15, left: -15, width: 60, height: 60, borderRadius: '50%',
              background: `radial-gradient(circle, ${meta.color}18 0%, transparent 70%)`, pointerEvents: 'none' }} />

            {/* Header */}
            <div style={{ padding: '28px 32px 20px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <motion.div
                    style={{ fontSize: 36, lineHeight: 1, filter: `drop-shadow(0 0 12px ${meta.color}88)` }}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, delay: 0.15 }}
                  >
                    {meta.emoji}
                  </motion.div>
                  <div>
                    <motion.h2
                      className="font-serif"
                      style={{ fontSize: 22, fontWeight: 300, color: '#f0eefc', letterSpacing: '-0.01em', lineHeight: 1.2 }}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.18 }}
                    >
                      {meta.title}
                    </motion.h2>
                    {meta.blossoms > 0 && (
                      <motion.p
                        className="font-sans"
                        style={{ fontSize: 11, color: meta.color+'99', marginTop: 3, letterSpacing: '0.06em' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 }}
                      >
                        +{meta.blossoms} blossom{meta.blossoms > 1 ? 's' : ''} will bloom on the tree
                      </motion.p>
                    )}
                  </div>
                </div>
                <motion.button
                  onClick={closeCreate}
                  style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(240,238,252,0.4)',
                    fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  whileHover={{ scale: 1.12, background: 'rgba(255,255,255,0.09)', color: 'rgba(240,238,252,0.7)' }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${meta.color}30, transparent)`, marginTop: 20 }} />
            </div>

            {/* Form body */}
            <motion.div
              style={{ flex: 1, overflowY: 'auto', padding: '0 32px', scrollbarWidth: 'thin' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
            >
              <FormBody type={createType} activeMood={activeMood} setActiveMood={setActiveMood} accentColor={meta.color} />
            </motion.div>

            {/* Footer */}
            <div style={{ padding: '20px 32px 28px', flexShrink: 0 }}>
              <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${meta.color}22, transparent)`, marginBottom: 18 }} />

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    style={{ textAlign: 'center', padding: '8px 0' }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 6 }}>✨</div>
                    <p className="font-serif" style={{ fontSize: 16, color: meta.color, fontStyle: 'italic' }}>
                      Growing on the tree...
                    </p>
                  </motion.div>
                ) : (
                  <motion.button
                    key="btn"
                    onClick={handlePlant}
                    style={{
                      width: '100%', padding: '15px 24px',
                      borderRadius: 18,
                      border: `1px solid ${meta.color}44`,
                      background: `linear-gradient(135deg, ${meta.color}20 0%, ${meta.color}12 100%)`,
                      color: meta.color,
                      fontSize: 15, fontFamily: 'Inter, sans-serif', fontWeight: 400,
                      letterSpacing: '0.04em', cursor: 'pointer',
                      position: 'relative', overflow: 'hidden',
                    }}
                    whileHover={{
                      scale: 1.015,
                      boxShadow: `0 0 28px ${meta.color}30, 0 4px 16px rgba(0,0,0,0.4)`,
                      borderColor: meta.color+'88',
                    }}
                    whileTap={{ scale: 0.975 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {/* Shimmer */}
                    <div style={{
                      position: 'absolute', inset: 0, borderRadius: 18, pointerEvents: 'none',
                      background: `linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%)`,
                    }} />
                    {meta.emoji} {meta.title}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ─── Shared styled field ──────────────────────────────────────────────── */
function F({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{
          display: 'block', marginBottom: 7,
          fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'rgba(201,191,232,0.42)', fontFamily: 'Inter, sans-serif',
        }}>
          {label}
        </label>
      )}
      {children}
    </div>
  )
}

const IS: React.CSSProperties = {
  width: '100%', padding: '13px 16px',
  background: 'rgba(255,255,255,0.035)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 14, outline: 'none',
  color: 'rgba(240,238,252,0.9)',
  fontSize: 14, fontFamily: 'Inter, sans-serif', fontWeight: 300,
  transition: 'border-color 0.25s, background 0.25s, box-shadow 0.25s',
  boxSizing: 'border-box',
}

const TA: React.CSSProperties = { ...IS, resize: 'none', lineHeight: 1.75 }
const SEL: React.CSSProperties = { ...IS, appearance: 'none', cursor: 'pointer' }
const POETIC: React.CSSProperties = { ...TA, fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: 15, lineHeight: 2 }

function FormBody({ type, activeMood, setActiveMood, accentColor }: {
  type: CreateType; activeMood: string | null; setActiveMood: (m: string|null) => void; accentColor: string
}) {
  const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }

  if (type === 'memory') return (<>
    <F label="Title"><input style={IS} type="text" placeholder="Name this memory..." /></F>
    <F label="Date"><input style={IS} type="date" /></F>
    <F label="Your story"><textarea style={TA} rows={5} placeholder="What do you want to remember forever..." /></F>
    <F label="Tags"><input style={IS} type="text" placeholder="first times, rain, laughter..." /></F>
  </>)

  if (type === 'song') return (<>
    <F label="Link (optional)"><input style={IS} type="url" placeholder="YouTube or Spotify URL..." /></F>
    <div style={grid2}>
      <F label="Song title"><input style={IS} type="text" placeholder="Title..." /></F>
      <F label="Artist"><input style={IS} type="text" placeholder="Artist..." /></F>
    </div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display:'block',marginBottom:8,fontSize:10,letterSpacing:'0.14em',textTransform:'uppercase',color:'rgba(201,191,232,0.42)',fontFamily:'Inter, sans-serif' }}>Mood</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {MOODS.map(({ label, color }) => (
          <motion.button key={label}
            onClick={() => setActiveMood(activeMood === label ? null : label)}
            style={{
              padding: '6px 14px', borderRadius: 100, cursor: 'pointer',
              background: activeMood===label ? color+'22' : 'rgba(255,255,255,0.04)',
              border: activeMood===label ? `1px solid ${color}66` : '1px solid rgba(255,255,255,0.08)',
              color: activeMood===label ? color : 'rgba(240,238,252,0.5)',
              fontSize: 12, fontFamily: 'Inter, sans-serif',
              boxShadow: activeMood===label ? `0 0 12px ${color}33` : 'none',
              transition: 'all 0.2s',
            }}
            whileTap={{ scale: 0.93 }}>
            {label}
          </motion.button>
        ))}
      </div>
    </div>
    <F label="Why this song matters"><textarea style={{ ...TA, fontStyle:'italic' }} rows={3} placeholder="The story behind this song..." /></F>
  </>)

  if (type === 'poem') return (<>
    <F label="Title"><input style={IS} type="text" placeholder="Name this petal..." /></F>
    <F label="Poem"><textarea style={POETIC} rows={10} placeholder="Let the words fall like petals..." /></F>
  </>)

  if (type === 'whisper') return (<>
    <F><textarea style={{ ...TA, fontStyle:'italic', fontSize:15, lineHeight:1.8 }} rows={6}
      placeholder="An inside joke, a quiet thought, a tiny love note..." /></F>
  </>)

  if (type === 'wish') return (<>
    <F label="The wish"><input style={IS} type="text" placeholder="What do you wish for together..." /></F>
    <F label="Category">
      <select style={SEL}>
        <option value="">Choose a category...</option>
        {WISH_CATS.map(c => <option key={c}>{c}</option>)}
      </select>
    </F>
  </>)

  if (type === 'place') return (<>
    <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
      <F label="Place name"><input style={IS} type="text" placeholder="Kyoto..." /></F>
      <F label="Country"><input style={IS} type="text" placeholder="Japan..." /></F>
    </div>
    <F label="Date"><input style={IS} type="date" /></F>
    <F label="Notes"><textarea style={TA} rows={3} placeholder="What you felt, what you saw..." /></F>
    <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:16 }}>
      <input type="checkbox" id="visited" style={{ accentColor, width:16,height:16 }} />
      <label htmlFor="visited" style={{ fontSize:13,color:'rgba(240,238,252,0.65)',cursor:'pointer',fontFamily:'Inter,sans-serif' }}>
        We&apos;ve been here together
      </label>
    </div>
  </>)

  if (type === 'letter') return (<>
    <F label="Open when..."><input style={IS} type="text" placeholder="Open on our anniversary..." /></F>
    <F label="Unlock date"><input style={IS} type="date" /></F>
    <F label="Your letter"><textarea style={POETIC} rows={9} placeholder="Write from your heart..." /></F>
  </>)

  if (type === 'milestone') return (<>
    <F label="Milestone"><input style={IS} type="text" placeholder="First conversation, first trip..." /></F>
    <F label="Date"><input style={IS} type="date" /></F>
    <F label="The story"><textarea style={TA} rows={5} placeholder="Tell the story of this moment..." /></F>
  </>)

  return null
}
