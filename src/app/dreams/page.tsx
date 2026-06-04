'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppShell from '@/components/layout/AppShell'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'
import { Plus, Image as ImageIcon, Trash2 } from 'lucide-react'

const CATEGORIES = ['Future Home', 'Travel Goals', 'Career Goals', 'Family Dreams', 'Spiritual Goals', 'Relationship Goals']
const CATEGORY_EMOJIS: Record<string, string> = {
  'Future Home': '🏡', 'Travel Goals': '✈️', 'Career Goals': '💫',
  'Family Dreams': '👨‍👩‍👧', 'Spiritual Goals': '🕊️', 'Relationship Goals': '💕',
}

interface Dream { id: string; category: string; title: string; description: string }

const INITIAL: Dream[] = []

export default function DreamsPage() {
  const [dreams, setDreams] = useState<Dream[]>(INITIAL)
  const [showAdd, setShowAdd] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Dream | null>(null)

  const handleDelete = () => {
    if (!deleteTarget) return
    setDreams((prev) => prev.filter((d) => d.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const grouped = CATEGORIES.reduce((acc, cat) => {
    if (!activeCategory || activeCategory === cat) {
      acc[cat] = dreams.filter((d) => d.category === cat)
    }
    return acc
  }, {} as Record<string, Dream[]>)

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        <motion.div className="flex items-start sm:items-end justify-between mb-8 gap-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-light" style={{ color: '#f2a8b8' }}>Shared Dreams</h1>
            <p className="font-sans text-sm mt-1" style={{ color: 'rgba(201,191,232,0.5)' }}>Visions of our future</p>
          </div>
          <motion.button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-sans flex-shrink-0"
            style={{ background: 'rgba(242,168,184,0.13)', color: '#f2a8b8', border: '1px solid rgba(242,168,184,0.28)' }}
            whileHover={{ scale: 1.03 }} onClick={() => setShowAdd(true)}>
            <Plus size={15} /> Add Dream
          </motion.button>
        </motion.div>

        <div className="flex flex-wrap gap-2 mb-8">
          {[null, ...CATEGORIES].map((cat) => (
            <motion.button key={cat ?? 'all'} className="px-3 py-1.5 rounded-full font-sans text-xs"
              style={{ background: activeCategory === cat ? 'rgba(242,168,184,0.18)' : 'rgba(255,255,255,0.05)', color: activeCategory === cat ? '#f2a8b8' : 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.07)' }}
              onClick={() => setActiveCategory(cat)} whileHover={{ scale: 1.05 }}>
              {cat ? `${CATEGORY_EMOJIS[cat]} ${cat}` : 'All'}
            </motion.button>
          ))}
        </div>

        <div className="space-y-10">
          {Object.entries(grouped).map(([cat, items], ci) =>
            items.length > 0 || !activeCategory ? (
              <motion.div key={cat} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.1 }}>
                <h2 className="font-serif text-xl font-light mb-4 flex items-center gap-2" style={{ color: '#f0eefc' }}>
                  <span>{CATEGORY_EMOJIS[cat]}</span><span>{cat}</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((dream, i) => (
                    <motion.div key={dream.id} className="glass rounded-2xl p-5 cursor-pointer group"
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
                      whileHover={{ scale: 1.03, background: 'rgba(242,168,184,0.065)' }}>
                      <div className="w-full h-20 rounded-xl mb-4 flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.035)', border: '1px dashed rgba(255,255,255,0.08)' }}>
                        <ImageIcon size={18} style={{ color: 'rgba(201,191,232,0.28)' }} />
                      </div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-serif text-base font-medium flex-1" style={{ color: '#f0eefc' }}>{dream.title}</h3>
                        <motion.button className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
                          style={{ color: 'rgba(220,80,100,0.65)' }} whileTap={{ scale: 0.9 }}
                          onClick={() => setDeleteTarget(dream)}>
                          <Trash2 size={13} />
                        </motion.button>
                      </div>
                      <p className="font-sans text-xs leading-relaxed" style={{ color: 'rgba(240,238,252,0.48)' }}>{dream.description}</p>
                    </motion.div>
                  ))}
                  <motion.div className="glass rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer min-h-[140px]"
                    style={{ border: '1px dashed rgba(242,168,184,0.18)' }} whileHover={{ scale: 1.02 }} onClick={() => setShowAdd(true)}>
                    <Plus size={18} style={{ color: 'rgba(242,168,184,0.38)' }} />
                    <p className="font-sans text-xs" style={{ color: 'rgba(242,168,184,0.38)' }}>Add a dream</p>
                  </motion.div>
                </div>
              </motion.div>
            ) : null
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(6,9,26,0.88)', backdropFilter: 'blur(10px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdd(false)}>
            <motion.div className="glass-strong rounded-3xl p-8 w-full max-w-md"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}>
              <h2 className="font-serif text-2xl font-light mb-6" style={{ color: '#f2a8b8' }}>Dream Together ✨</h2>
              <div className="space-y-4">
                <select className="w-full rounded-xl px-4 py-3 text-sm font-sans outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <input type="text" placeholder="Dream title" className="w-full rounded-xl px-4 py-3 text-sm font-sans outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }} />
                <textarea placeholder="Paint the picture..." rows={4} className="w-full rounded-xl px-4 py-3 text-sm font-sans outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }} />
                <div className="flex gap-3">
                  <motion.button className="flex-1 py-3 rounded-xl font-sans text-sm"
                    style={{ background: 'rgba(242,168,184,0.18)', color: '#f2a8b8', border: '1px solid rgba(242,168,184,0.28)' }}
                    whileHover={{ background: 'rgba(242,168,184,0.28)' }} onClick={() => setShowAdd(false)}>
                    Plant this dream ✨
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
