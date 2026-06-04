'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppShell from '@/components/layout/AppShell'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'
import { Plus, MapPin, Check, Trash2 } from 'lucide-react'

interface Place {
  id: string; name: string; country: string; visited: boolean
  date?: string; notes?: string; emoji: string
}

const INITIAL: Place[] = []

export default function FootprintsPage() {
  const [places, setPlaces] = useState<Place[]>(INITIAL)
  const [showAdd, setShowAdd] = useState(false)
  const [tab, setTab] = useState<'all' | 'visited' | 'dream'>('all')
  const [deleteTarget, setDeleteTarget] = useState<Place | null>(null)

  const filtered = tab === 'visited' ? places.filter((p) => p.visited)
    : tab === 'dream' ? places.filter((p) => !p.visited) : places

  const handleDelete = () => {
    if (!deleteTarget) return
    setPlaces((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <motion.div className="flex items-start sm:items-end justify-between mb-8 gap-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-light" style={{ color: '#f2a8b8' }}>Footprints</h1>
            <p className="font-sans text-sm mt-1" style={{ color: 'rgba(201,191,232,0.5)' }}>
              {places.filter((p) => p.visited).length} places explored together
            </p>
          </div>
          <motion.button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-sans flex-shrink-0"
            style={{ background: 'rgba(242,168,184,0.13)', color: '#f2a8b8', border: '1px solid rgba(242,168,184,0.28)' }}
            whileHover={{ scale: 1.03 }} onClick={() => setShowAdd(true)}>
            <Plus size={15} /> Add Place
          </motion.button>
        </motion.div>

        {/* Map placeholder */}
        <motion.div className="glass rounded-3xl mb-8 overflow-hidden" style={{ height: 180 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(13,18,48,0.7), rgba(30,20,70,0.5))' }}>
            <div className="text-center">
              <MapPin size={28} style={{ color: 'rgba(242,168,184,0.35)', margin: '0 auto 10px' }} />
              <p className="font-sans text-sm" style={{ color: 'rgba(201,191,232,0.35)' }}>Interactive map coming soon</p>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'visited', 'dream'] as const).map((t) => (
            <motion.button key={t} className="px-4 py-2 rounded-full font-sans text-xs capitalize"
              style={{ background: tab === t ? 'rgba(242,168,184,0.18)' : 'rgba(255,255,255,0.05)', color: tab === t ? '#f2a8b8' : 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.07)' }}
              onClick={() => setTab(t)} whileHover={{ scale: 1.05 }}>
              {t === 'dream' ? 'Dream Destinations' : t}
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((place, i) => (
            <motion.div key={place.id} className="glass rounded-2xl p-5 flex items-start gap-4 group"
              style={{ background: place.visited ? 'rgba(242,168,184,0.055)' : 'rgba(255,255,255,0.035)' }}
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              whileHover={{ scale: 1.02 }}>
              <div className="text-2xl flex-shrink-0">{place.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-serif text-base font-medium truncate" style={{ color: '#f0eefc' }}>{place.name}</h3>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {place.visited && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(242,168,184,0.28)' }}>
                        <Check size={11} style={{ color: '#f2a8b8' }} />
                      </div>
                    )}
                    <motion.button className="opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'rgba(220,80,100,0.65)' }} whileTap={{ scale: 0.9 }}
                      onClick={() => setDeleteTarget(place)}>
                      <Trash2 size={13} />
                    </motion.button>
                  </div>
                </div>
                <p className="font-sans text-xs mb-1" style={{ color: 'rgba(201,191,232,0.45)' }}>{place.country}</p>
                {place.date && <p className="font-sans text-xs" style={{ color: 'rgba(242,168,184,0.45)' }}>Visited {new Date(place.date).toLocaleDateString()}</p>}
                {place.notes && <p className="font-sans text-xs mt-1 italic" style={{ color: 'rgba(240,238,252,0.38)' }}>{place.notes}</p>}
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
            <motion.div className="glass-strong rounded-3xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}>
              <h2 className="font-serif text-2xl font-light mb-6" style={{ color: '#f2a8b8' }}>Add a Place</h2>
              <div className="space-y-4">
                <input type="text" placeholder="City / Place name" className="w-full rounded-xl px-4 py-3 text-sm font-sans outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }} />
                <input type="text" placeholder="Country" className="w-full rounded-xl px-4 py-3 text-sm font-sans outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }} />
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="visited" className="rounded" />
                  <label htmlFor="visited" className="font-sans text-sm" style={{ color: 'rgba(240,238,252,0.65)' }}>We&apos;ve been here</label>
                </div>
                <input type="date" className="w-full rounded-xl px-4 py-3 text-sm font-sans outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }} />
                <textarea placeholder="Notes..." rows={3} className="w-full rounded-xl px-4 py-3 text-sm font-sans outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }} />
                <div className="flex gap-3">
                  <motion.button className="flex-1 py-3 rounded-xl font-sans text-sm"
                    style={{ background: 'rgba(242,168,184,0.18)', color: '#f2a8b8', border: '1px solid rgba(242,168,184,0.28)' }}
                    whileHover={{ background: 'rgba(242,168,184,0.28)' }} onClick={() => setShowAdd(false)}>
                    Mark on map 📍
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

      <DeleteConfirmModal open={!!deleteTarget} itemName={`${deleteTarget?.name}, ${deleteTarget?.country}`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </AppShell>
  )
}
