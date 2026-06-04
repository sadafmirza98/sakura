'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppShell from '@/components/layout/AppShell'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'
import { Plus, Star, Trash2 } from 'lucide-react'

type Status = 'planned' | 'watching' | 'completed'
interface Show { id: string; title: string; type: 'movie' | 'series'; status: Status; rating?: number; review?: string; date?: string; emoji: string }

const STATUS_COLORS: Record<Status, string> = {
  planned: 'rgba(201,191,232,0.1)',
  watching: 'rgba(232,201,122,0.1)',
  completed: 'rgba(242,168,184,0.09)',
}

const INITIAL: Show[] = []

export default function EveningsPage() {
  const [shows, setShows] = useState<Show[]>(INITIAL)
  const [activeStatus, setActiveStatus] = useState<Status | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Show | null>(null)

  const filtered = activeStatus ? shows.filter((s) => s.status === activeStatus) : shows

  const handleDelete = () => {
    if (!deleteTarget) return
    setShows((prev) => prev.filter((s) => s.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <motion.div className="flex items-start sm:items-end justify-between mb-8 gap-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-light" style={{ color: '#f2a8b8' }}>Evenings</h1>
            <p className="font-sans text-sm mt-1" style={{ color: 'rgba(201,191,232,0.5)' }}>Movies and shows we share</p>
          </div>
          <motion.button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-sans flex-shrink-0"
            style={{ background: 'rgba(242,168,184,0.13)', color: '#f2a8b8', border: '1px solid rgba(242,168,184,0.28)' }}
            whileHover={{ scale: 1.03 }} onClick={() => setShowAdd(true)}>
            <Plus size={15} /> Add
          </motion.button>
        </motion.div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {([null, 'planned', 'watching', 'completed'] as const).map((s) => (
            <motion.button key={s ?? 'all'} className="px-4 py-2 rounded-full font-sans text-xs capitalize"
              style={{ background: activeStatus === s ? 'rgba(242,168,184,0.18)' : 'rgba(255,255,255,0.05)', color: activeStatus === s ? '#f2a8b8' : 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.07)' }}
              onClick={() => setActiveStatus(s)} whileHover={{ scale: 1.05 }}>
              {s ?? 'All'}
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((show, i) => (
            <motion.div key={show.id} className="glass rounded-2xl p-5 cursor-pointer group"
              style={{ background: STATUS_COLORS[show.status] }}
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              whileHover={{ scale: 1.02 }}>
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">{show.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-serif text-base font-medium truncate" style={{ color: '#f0eefc' }}>{show.title}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-sans text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.065)', color: 'rgba(201,191,232,0.65)' }}>{show.status}</span>
                      <motion.button className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: 'rgba(220,80,100,0.65)' }} whileTap={{ scale: 0.9 }}
                        onClick={() => setDeleteTarget(show)}>
                        <Trash2 size={13} />
                      </motion.button>
                    </div>
                  </div>
                  <p className="font-sans text-xs mb-2" style={{ color: 'rgba(201,191,232,0.45)' }}>
                    {show.type === 'movie' ? '🎬 Film' : '📺 Series'}
                    {show.date && ` · ${new Date(show.date).toLocaleDateString()}`}
                  </p>
                  {show.rating && (
                    <div className="flex gap-0.5 mb-2">
                      {[...Array(show.rating)].map((_, j) => (
                        <Star key={j} size={11} fill="#f2a8b8" style={{ color: '#f2a8b8' }} />
                      ))}
                    </div>
                  )}
                  {show.review && (
                    <p className="font-serif text-xs italic leading-relaxed" style={{ color: 'rgba(240,238,252,0.5)' }}>
                      &ldquo;{show.review}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(6,9,26,0.88)', backdropFilter: 'blur(10px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdd(false)}>
            <motion.div className="glass-strong rounded-3xl p-8 w-full max-w-md"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}>
              <h2 className="font-serif text-2xl font-light mb-6" style={{ color: '#f2a8b8' }}>Add to Evenings 🎬</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Title" className="w-full rounded-xl px-4 py-3 text-sm font-sans outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }} />
                <select className="w-full rounded-xl px-4 py-3 text-sm font-sans outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }}>
                  <option>Movie</option><option>Series</option>
                </select>
                <select className="w-full rounded-xl px-4 py-3 text-sm font-sans outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }}>
                  <option value="planned">Planned</option>
                  <option value="watching">Watching</option>
                  <option value="completed">Completed</option>
                </select>
                <textarea placeholder="Your thoughts..." rows={3} className="w-full rounded-xl px-4 py-3 text-sm font-sans outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }} />
                <div className="flex gap-3">
                  <motion.button className="flex-1 py-3 rounded-xl font-sans text-sm"
                    style={{ background: 'rgba(242,168,184,0.18)', color: '#f2a8b8', border: '1px solid rgba(242,168,184,0.28)' }}
                    whileHover={{ background: 'rgba(242,168,184,0.28)' }} onClick={() => setShowAdd(false)}>
                    Add to our evenings
                  </motion.button>
                  <motion.button className="px-5 py-3 rounded-xl font-sans text-sm"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(240,238,252,0.45)' }}
                    onClick={() => setShowAdd(false)}>Cancel</motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteConfirmModal open={!!deleteTarget} itemName={deleteTarget?.title} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </AppShell>
  )
}
