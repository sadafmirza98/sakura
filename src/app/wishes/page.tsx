'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppShell from '@/components/layout/AppShell'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'
import { Plus, Star, Check, Trash2 } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

const CATEGORIES = ['Travel', 'Food', 'Experiences', 'Marriage', 'Faith', 'Personal Growth', 'Career', 'Life Goals']

interface Wish {
  id: string; text: string; category: string; completed: boolean; completedDate?: string
}

const INITIAL: Wish[] = []

export default function WishesPage() {
  const [wishes, setWishes] = useState<Wish[]>(INITIAL)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Wish | null>(null)
  const addBlossoms = useAppStore((s) => s.addBlossoms)

  const filtered = activeCategory ? wishes.filter((w) => w.category === activeCategory) : wishes
  const completed = filtered.filter((w) => w.completed).length

  const toggleWish = (id: string) => {
    setWishes((prev) => prev.map((w) => {
      if (w.id !== id) return w
      if (!w.completed) addBlossoms(5)
      return { ...w, completed: !w.completed, completedDate: new Date().toISOString().split('T')[0] }
    }))
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setWishes((prev) => prev.filter((w) => w.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <motion.div className="flex items-start sm:items-end justify-between mb-8 gap-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-light" style={{ color: '#f2a8b8' }}>Spring Wishes</h1>
            <p className="font-sans text-sm mt-1" style={{ color: 'rgba(201,191,232,0.5)' }}>
              {completed} of {filtered.length} wishes fulfilled
            </p>
          </div>
          <motion.button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-sans flex-shrink-0"
            style={{ background: 'rgba(242,168,184,0.13)', color: '#f2a8b8', border: '1px solid rgba(242,168,184,0.28)' }}
            whileHover={{ scale: 1.03 }} onClick={() => setShowAdd(true)}>
            <Plus size={15} /> Add a Wish
          </motion.button>
        </motion.div>

        {/* Progress */}
        <motion.div className="glass rounded-2xl p-5 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans text-xs" style={{ color: 'rgba(201,191,232,0.55)' }}>Garden progress</span>
            <span className="font-sans text-xs" style={{ color: '#f2a8b8' }}>
              {filtered.length ? Math.round((completed / filtered.length) * 100) : 0}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <motion.div className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #f2a8b8, #c9bfe8)' }}
              initial={{ width: 0 }}
              animate={{ width: `${filtered.length ? (completed / filtered.length) * 100 : 0}%` }}
              transition={{ duration: 1, delay: 0.5 }} />
          </div>
        </motion.div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[null, ...CATEGORIES].map((cat) => (
            <motion.button key={cat ?? 'all'}
              className="px-3 py-1.5 rounded-full font-sans text-xs"
              style={{
                background: activeCategory === cat ? 'rgba(242,168,184,0.18)' : 'rgba(255,255,255,0.05)',
                color: activeCategory === cat ? '#f2a8b8' : 'rgba(255,255,255,0.45)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
              onClick={() => setActiveCategory(cat)}
              whileHover={{ scale: 1.05 }}>
              {cat ?? 'All'}
            </motion.button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((wish, i) => (
            <motion.div key={wish.id} className="glass rounded-2xl p-4 flex items-center gap-4 group"
              style={{ background: wish.completed ? 'rgba(242,168,184,0.055)' : 'rgba(255,255,255,0.035)' }}
              initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.01 }}>
              <motion.button className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: wish.completed ? 'rgba(242,168,184,0.28)' : 'rgba(255,255,255,0.055)',
                  border: wish.completed ? '1.5px solid rgba(242,168,184,0.45)' : '1.5px solid rgba(255,255,255,0.09)',
                }}
                whileTap={{ scale: 0.85 }} onClick={() => toggleWish(wish.id)}>
                {wish.completed && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                    <Check size={13} style={{ color: '#f2a8b8' }} />
                  </motion.div>
                )}
              </motion.button>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm truncate" style={{ color: wish.completed ? 'rgba(240,238,252,0.38)' : 'rgba(240,238,252,0.85)', textDecoration: wish.completed ? 'line-through' : 'none' }}>
                  {wish.text}
                </p>
                {wish.completed && wish.completedDate && (
                  <p className="font-sans text-xs mt-0.5" style={{ color: 'rgba(242,168,184,0.45)' }}>
                    Fulfilled {new Date(wish.completedDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <span className="font-sans text-xs px-2.5 py-1 rounded-full flex-shrink-0 hidden sm:block"
                style={{ background: 'rgba(255,255,255,0.055)', color: 'rgba(201,191,232,0.55)' }}>
                {wish.category}
              </span>
              {!wish.completed && <Star size={13} style={{ color: 'rgba(232,201,122,0.45)', flexShrink: 0 }} />}
              <motion.button className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                style={{ color: 'rgba(220,80,100,0.65)' }} whileTap={{ scale: 0.9 }}
                onClick={() => setDeleteTarget(wish)}>
                <Trash2 size={13} />
              </motion.button>
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
              <h2 className="font-serif text-2xl font-light mb-6" style={{ color: '#f2a8b8' }}>Plant a Wish ⭐</h2>
              <div className="space-y-4">
                <input type="text" placeholder="What do you wish for together?" className="w-full rounded-xl px-4 py-3 text-sm font-sans outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }} />
                <select className="w-full rounded-xl px-4 py-3 text-sm font-sans outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }}>
                  <option value="">Select category...</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <div className="flex gap-3">
                  <motion.button className="flex-1 py-3 rounded-xl font-sans text-sm"
                    style={{ background: 'rgba(242,168,184,0.18)', color: '#f2a8b8', border: '1px solid rgba(242,168,184,0.28)' }}
                    whileHover={{ background: 'rgba(242,168,184,0.28)' }} onClick={() => setShowAdd(false)}>
                    Make a wish ✦
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

      <DeleteConfirmModal open={!!deleteTarget} itemName={deleteTarget?.text} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </AppShell>
  )
}
