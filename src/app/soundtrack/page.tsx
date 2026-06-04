'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppShell from '@/components/layout/AppShell'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'
import { Plus, Music, Heart, Play, Trash2 } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

const MOODS = ['Comfort', 'Love', 'Missing You', 'Travel', 'Hope', 'Nostalgia', 'Dreaming']
const MOOD_COLORS: Record<string, string> = {
  Comfort: 'rgba(232,201,122,0.12)',
  Love: 'rgba(242,168,184,0.12)',
  'Missing You': 'rgba(201,191,232,0.12)',
  Travel: 'rgba(168,212,242,0.1)',
  Hope: 'rgba(168,242,200,0.08)',
  Nostalgia: 'rgba(220,168,242,0.12)',
  Dreaming: 'rgba(168,180,242,0.12)',
}

interface Song {
  id: string; title: string; artist: string; url: string
  why: string; mood: string; addedBy: string; date: string
}

const INITIAL: Song[] = []

export default function SoundtrackPage() {
  const [songs, setSongs] = useState<Song[]>(INITIAL)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Song | null>(null)
  const addBlossoms = useAppStore((s) => s.addBlossoms)

  const filtered = activeFilter ? songs.filter((s) => s.mood === activeFilter) : songs

  const handleDelete = () => {
    if (!deleteTarget) return
    setSongs((prev) => prev.filter((s) => s.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="flex items-start sm:items-end justify-between mb-8 gap-4"
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-light" style={{ color: '#f2a8b8' }}>Our Soundtrack</h1>
            <p className="font-sans text-sm mt-1" style={{ color: 'rgba(201,191,232,0.5)' }}>Songs woven into our story</p>
          </div>
          <motion.button
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-sans flex-shrink-0"
            style={{ background: 'rgba(242,168,184,0.13)', color: '#f2a8b8', border: '1px solid rgba(242,168,184,0.28)' }}
            whileHover={{ scale: 1.03 }} onClick={() => setShowAdd(true)}
          >
            <Plus size={15} />
            Add Song
          </motion.button>
        </motion.div>

        <motion.div className="flex flex-wrap gap-2 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          {[null, ...MOODS].map((mood) => (
            <motion.button key={mood ?? 'all'}
              className="px-4 py-2 rounded-full font-sans text-xs"
              style={{
                background: activeFilter === mood ? (mood ? MOOD_COLORS[mood] : 'rgba(242,168,184,0.18)') : 'rgba(255,255,255,0.05)',
                color: activeFilter === mood ? '#f0eefc' : 'rgba(255,255,255,0.45)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
              onClick={() => setActiveFilter(mood)}
              whileHover={{ scale: 1.05 }}
            >
              {mood ?? 'All'}
            </motion.button>
          ))}
        </motion.div>

        <div className="space-y-3">
          {filtered.map((song, i) => (
            <SongCard key={song.id} song={song} index={i} onDelete={() => setDeleteTarget(song)} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showAdd && <AddSongModal onClose={() => { setShowAdd(false); addBlossoms(1) }} />}
      </AnimatePresence>

      <DeleteConfirmModal
        open={!!deleteTarget}
        itemName={deleteTarget?.title}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppShell>
  )
}

function SongCard({ song, index, onDelete }: { song: Song; index: number; onDelete: () => void }) {
  const [liked, setLiked] = useState(false)
  const [expanded, setExpanded] = useState(false)
  return (
    <motion.div
      className="glass rounded-2xl overflow-hidden cursor-pointer group"
      style={{ background: MOOD_COLORS[song.mood] || 'rgba(255,255,255,0.04)' }}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
      whileHover={{ scale: 1.005 }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-4 p-4 sm:p-5">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <Music size={18} style={{ color: '#f2a8b8' }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-base font-medium truncate" style={{ color: '#f0eefc' }}>{song.title}</h3>
          <p className="font-sans text-sm" style={{ color: 'rgba(240,238,252,0.45)' }}>{song.artist}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <span className="hidden sm:block px-2.5 py-1 rounded-full font-sans text-xs" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(201,191,232,0.75)' }}>
            {song.mood}
          </span>
          <motion.button onClick={(e) => { e.stopPropagation(); setLiked(!liked) }} whileTap={{ scale: 1.3 }}>
            <Heart size={14} fill={liked ? '#f2a8b8' : 'none'} style={{ color: '#f2a8b8' }} />
          </motion.button>
          <motion.button
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: 'rgba(220,80,100,0.7)' }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onDelete() }}
          >
            <Trash2 size={13} />
          </motion.button>
          <Play size={14} style={{ color: 'rgba(240,238,252,0.3)' }} />
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div className="px-5 pb-5" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="font-sans text-xs mb-2" style={{ color: 'rgba(201,191,232,0.45)' }}>
                Added by {song.addedBy} · {new Date(song.date).toLocaleDateString()}
              </p>
              <p className="font-serif text-sm italic leading-relaxed" style={{ color: 'rgba(240,238,252,0.7)' }}>
                &ldquo;{song.why}&rdquo;
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function AddSongModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(6,9,26,0.88)', backdropFilter: 'blur(10px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass-strong rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-serif text-2xl font-light mb-2" style={{ color: '#f2a8b8' }}>Add a Song</h2>
        <p className="font-sans text-sm mb-6" style={{ color: 'rgba(201,191,232,0.45)' }}>Paste a YouTube or Spotify URL, or enter manually</p>
        <div className="space-y-4">
          {[{ p: 'YouTube or Spotify URL (optional)', t: 'url' }, { p: 'Song title', t: 'text' }, { p: 'Artist', t: 'text' }].map(({ p, t }) => (
            <input key={p} type={t} placeholder={p} className="w-full rounded-xl px-4 py-3 text-sm font-sans outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }} />
          ))}
          <select className="w-full rounded-xl px-4 py-3 text-sm font-sans outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }}>
            <option value="">Select a mood...</option>
            {MOODS.map((m) => <option key={m}>{m}</option>)}
          </select>
          <textarea placeholder="Why does this song matter?" rows={3} className="w-full rounded-xl px-4 py-3 text-sm font-sans outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }} />
          <div className="flex gap-3">
            <motion.button className="flex-1 py-3 rounded-xl font-sans text-sm"
              style={{ background: 'rgba(242,168,184,0.18)', color: '#f2a8b8', border: '1px solid rgba(242,168,184,0.28)' }}
              whileHover={{ background: 'rgba(242,168,184,0.28)' }} onClick={onClose}>
              Add to Soundtrack 🎵
            </motion.button>
            <motion.button className="px-5 py-3 rounded-xl font-sans text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(240,238,252,0.45)' }}
              onClick={onClose}>Cancel</motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
