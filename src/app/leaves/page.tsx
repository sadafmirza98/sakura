'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppShell from '@/components/layout/AppShell'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'
import { Plus, MessageCircle, Trash2 } from 'lucide-react'

interface Leaf {
  id: string; text: string; author: string; date: string; color: string; rotation: number
}

const LEAF_COLORS = [
  'rgba(242,168,184,0.12)', 'rgba(201,191,232,0.12)', 'rgba(232,201,122,0.1)',
  'rgba(168,212,242,0.1)', 'rgba(200,240,210,0.08)',
]

const INITIAL: Leaf[] = []

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<Leaf[]>(INITIAL)
  const [showAdd, setShowAdd] = useState(false)
  const [newText, setNewText] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Leaf | null>(null)

  const handleDelete = () => {
    if (!deleteTarget) return
    setLeaves((prev) => prev.filter((l) => l.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        <motion.div className="flex items-start sm:items-end justify-between mb-10 gap-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-light" style={{ color: '#f2a8b8' }}>Whispered Leaves</h1>
            <p className="font-sans text-sm mt-1" style={{ color: 'rgba(201,191,232,0.5)' }}>Tiny thoughts floating in the garden</p>
          </div>
          <motion.button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-sans flex-shrink-0"
            style={{ background: 'rgba(242,168,184,0.13)', color: '#f2a8b8', border: '1px solid rgba(242,168,184,0.28)' }}
            whileHover={{ scale: 1.03 }} onClick={() => setShowAdd(true)}>
            <Plus size={15} /> Whisper
          </motion.button>
        </motion.div>

        <div className="flex flex-wrap gap-4">
          {leaves.map((leaf, i) => (
            <motion.div key={leaf.id} className="glass rounded-2xl p-5 cursor-pointer group"
              style={{ background: leaf.color, maxWidth: 220, transform: `rotate(${leaf.rotation}deg)` }}
              initial={{ opacity: 0, scale: 0.85, rotate: leaf.rotation - 18 }}
              animate={{ opacity: 1, scale: 1, rotate: leaf.rotation }}
              transition={{ delay: i * 0.09, type: 'spring', stiffness: 110 }}
              whileHover={{ scale: 1.06, rotate: 0, zIndex: 10, boxShadow: '0 10px 36px rgba(242,168,184,0.18)' }}>
              <div className="flex items-start justify-between mb-2">
                <MessageCircle size={11} style={{ color: 'rgba(242,168,184,0.45)', marginTop: 2 }} />
                <motion.button className="opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'rgba(220,80,100,0.7)' }} whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(leaf) }}>
                  <Trash2 size={12} />
                </motion.button>
              </div>
              <p className="font-serif text-sm italic leading-relaxed mb-3" style={{ color: 'rgba(240,238,252,0.85)' }}>
                &ldquo;{leaf.text}&rdquo;
              </p>
              <p className="font-sans text-xs" style={{ color: 'rgba(201,191,232,0.38)' }}>— {leaf.author}</p>
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
              <h2 className="font-serif text-2xl font-light mb-6" style={{ color: '#f2a8b8' }}>Whisper a Leaf</h2>
              <textarea placeholder="An inside joke, a random thought, a tiny love note..." rows={4}
                value={newText} onChange={(e) => setNewText(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm font-serif outline-none resize-none italic"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }} />
              <div className="flex gap-3 mt-4">
                <motion.button className="flex-1 py-3 rounded-xl font-sans text-sm"
                  style={{ background: 'rgba(242,168,184,0.18)', color: '#f2a8b8', border: '1px solid rgba(242,168,184,0.28)' }}
                  whileHover={{ background: 'rgba(242,168,184,0.28)' }}
                  onClick={() => { setNewText(''); setShowAdd(false) }}>
                  Let it float 🍃
                </motion.button>
                <motion.button className="px-5 py-3 rounded-xl font-sans text-sm"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(240,238,252,0.45)' }}
                  onClick={() => setShowAdd(false)}>Cancel</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteConfirmModal open={!!deleteTarget} itemName={deleteTarget ? `"${deleteTarget.text.slice(0, 30)}..."` : undefined}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </AppShell>
  )
}
