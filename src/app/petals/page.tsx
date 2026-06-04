'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppShell from '@/components/layout/AppShell'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'
import { Plus, Feather, Trash2 } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

interface Poem {
  id: string; title: string; content: string; author: string; date: string; mood: string
}

const INITIAL: Poem[] = []

export default function PetalsPage() {
  const [poems, setPoems] = useState<Poem[]>(INITIAL)
  const [selected, setSelected] = useState<Poem | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Poem | null>(null)
  const addBlossoms = useAppStore((s) => s.addBlossoms)

  const handleDelete = () => {
    if (!deleteTarget) return
    setPoems((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <motion.div className="flex items-start sm:items-end justify-between mb-10 gap-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-light" style={{ color: '#f2a8b8' }}>Petals</h1>
            <p className="font-sans text-sm mt-1" style={{ color: 'rgba(201,191,232,0.5)' }}>Poetry becomes blossoms on the tree</p>
          </div>
          <motion.button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-sans flex-shrink-0"
            style={{ background: 'rgba(242,168,184,0.13)', color: '#f2a8b8', border: '1px solid rgba(242,168,184,0.28)' }}
            whileHover={{ scale: 1.03 }} onClick={() => setShowAdd(true)}>
            <Plus size={15} /> Write a Petal
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {poems.map((poem, i) => (
            <motion.div key={poem.id} className="glass rounded-2xl p-6 cursor-pointer group"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, background: 'rgba(242,168,184,0.055)' }}
              onClick={() => setSelected(poem)}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Feather size={13} style={{ color: '#f2a8b8' }} />
                  <span className="font-sans text-xs" style={{ color: 'rgba(201,191,232,0.55)' }}>
                    {poem.author} · {new Date(poem.date).toLocaleDateString()}
                  </span>
                </div>
                <motion.button className="opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'rgba(220,80,100,0.7)' }} whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(poem) }}>
                  <Trash2 size={13} />
                </motion.button>
              </div>
              <h3 className="font-serif text-xl font-medium mb-3" style={{ color: '#f0eefc' }}>{poem.title}</h3>
              <p className="font-serif text-sm leading-loose italic" style={{ color: 'rgba(240,238,252,0.58)', whiteSpace: 'pre-line' }}>
                {poem.content.split('\n').slice(0, 3).join('\n')}{poem.content.split('\n').length > 3 && '...'}
              </p>
            </motion.div>
          ))}
          <motion.div className="glass rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer min-h-[200px]"
            style={{ border: '1px dashed rgba(242,168,184,0.2)' }} whileHover={{ scale: 1.02 }} onClick={() => setShowAdd(true)}>
            <Feather size={22} style={{ color: 'rgba(242,168,184,0.38)' }} />
            <p className="font-serif text-sm italic" style={{ color: 'rgba(242,168,184,0.38)' }}>Let words bloom...</p>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(6,9,26,0.92)', backdropFilter: 'blur(14px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}>
            <motion.div className="glass-strong rounded-3xl p-8 sm:p-10 w-full max-w-lg text-center max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}>
              <Feather size={18} style={{ color: '#f2a8b8', margin: '0 auto 18px', display: 'block' }} />
              <h2 className="font-serif text-2xl sm:text-3xl font-light mb-8" style={{ color: '#f2a8b8' }}>{selected.title}</h2>
              <p className="font-serif text-base leading-loose italic mb-8" style={{ color: 'rgba(240,238,252,0.82)', whiteSpace: 'pre-line' }}>{selected.content}</p>
              <p className="font-sans text-xs" style={{ color: 'rgba(201,191,232,0.38)' }}>— {selected.author}, {new Date(selected.date).toLocaleDateString()}</p>
            </motion.div>
          </motion.div>
        )}
        {showAdd && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(6,9,26,0.88)', backdropFilter: 'blur(10px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdd(false)}>
            <motion.div className="glass-strong rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}>
              <h2 className="font-serif text-2xl font-light mb-6" style={{ color: '#f2a8b8' }}>Write a Petal</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Title" className="w-full rounded-xl px-4 py-3 text-sm font-sans outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }} />
                <textarea placeholder="Your poem..." rows={8} className="w-full rounded-xl px-4 py-3 text-sm font-serif outline-none resize-none leading-loose italic"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }} />
                <div className="flex gap-3">
                  <motion.button className="flex-1 py-3 rounded-xl font-sans text-sm"
                    style={{ background: 'rgba(242,168,184,0.18)', color: '#f2a8b8', border: '1px solid rgba(242,168,184,0.28)' }}
                    whileHover={{ background: 'rgba(242,168,184,0.28)' }}
                    onClick={() => { addBlossoms(2); setShowAdd(false) }}>
                    Plant this Petal 🌸
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
