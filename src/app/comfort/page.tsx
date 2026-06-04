'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppShell from '@/components/layout/AppShell'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'
import { Heart, Sparkles, Plus, Trash2 } from 'lucide-react'

const AFFIRMATIONS = [
  'You are enough.',
  'You are deeply loved.',
  'Spring always returns.',
  'This too shall pass.',
  'We will be okay.',
]

interface Reason { id: string; text: string }

const INITIAL_REASONS: Reason[] = []

export default function ComfortPage() {
  const [affirmation] = useState(() => AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)])
  const [revealed, setRevealed] = useState<string[]>([])
  const [reasons, setReasons] = useState<Reason[]>(INITIAL_REASONS)
  const [showAdd, setShowAdd] = useState(false)
  const [newReason, setNewReason] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Reason | null>(null)

  const handleDelete = () => {
    if (!deleteTarget) return
    setReasons((prev) => prev.filter((r) => r.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const handleAdd = () => {
    if (!newReason.trim()) return
    setReasons((prev) => [...prev, { id: Date.now().toString(), text: newReason.trim() }])
    setNewReason('')
    setShowAdd(false)
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Heart size={30} style={{ color: '#f2a8b8', margin: '0 auto 14px' }} />
          <h1 className="font-serif text-3xl sm:text-4xl font-light mb-3" style={{ color: '#f2a8b8' }}>Comfort Space</h1>
          <p className="font-sans text-sm" style={{ color: 'rgba(201,191,232,0.45)' }}>For the days when you need to feel loved</p>
        </motion.div>

        {/* Affirmation */}
        <motion.div className="glass rounded-3xl p-8 text-center mb-8"
          style={{ background: 'rgba(242,168,184,0.06)', border: '1px solid rgba(242,168,184,0.12)' }}
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Sparkles size={18} style={{ color: 'rgba(242,168,184,0.55)', margin: '0 auto 14px' }} />
          <p className="font-serif text-xl sm:text-2xl font-light italic" style={{ color: '#f2a8b8' }}>
            &ldquo;{affirmation}&rdquo;
          </p>
        </motion.div>

        {/* Reasons */}
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-light flex items-center gap-2" style={{ color: '#f0eefc' }}>
              <span>✦</span><span>Reasons I Love You</span>
            </h2>
            <motion.button className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-sans text-xs"
              style={{ background: 'rgba(242,168,184,0.1)', color: '#f2a8b8', border: '1px solid rgba(242,168,184,0.2)' }}
              whileHover={{ scale: 1.05 }} onClick={() => setShowAdd(true)}>
              <Plus size={13} /> Add
            </motion.button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reasons.map((reason, i) => (
              <motion.div key={reason.id} className="glass rounded-2xl p-4 cursor-pointer group"
                style={{ background: revealed.includes(reason.id) ? 'rgba(242,168,184,0.08)' : 'rgba(255,255,255,0.035)', border: revealed.includes(reason.id) ? '1px solid rgba(242,168,184,0.18)' : '1px solid rgba(255,255,255,0.055)' }}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }}
                whileHover={{ scale: 1.02 }} onClick={() => setRevealed((p) => p.includes(reason.id) ? p : [...p, reason.id])}>
                <div className="flex items-start justify-between">
                  {revealed.includes(reason.id) ? (
                    <motion.p className="font-serif text-sm italic leading-relaxed flex-1" style={{ color: 'rgba(240,238,252,0.85)' }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {reason.text}
                    </motion.p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Heart size={13} style={{ color: 'rgba(242,168,184,0.38)' }} />
                      <p className="font-sans text-xs" style={{ color: 'rgba(240,238,252,0.28)' }}>Tap to reveal...</p>
                    </div>
                  )}
                  <motion.button className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
                    style={{ color: 'rgba(220,80,100,0.6)' }} whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(reason) }}>
                    <Trash2 size={12} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Comfort quote — only shown when reasons exist */}
        {reasons.length > 0 && (
          <motion.div className="glass rounded-3xl p-8 text-center"
            style={{ background: 'rgba(201,191,232,0.05)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <p className="font-serif text-base sm:text-lg italic mb-4" style={{ color: 'rgba(240,238,252,0.78)' }}>
              &ldquo;Every reason you write here becomes a blossom on the tree.&rdquo;
            </p>
            <p className="font-sans text-sm" style={{ color: 'rgba(201,191,232,0.38)' }}>— Sakura</p>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(6,9,26,0.88)', backdropFilter: 'blur(10px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdd(false)}>
            <motion.div className="glass-strong rounded-3xl p-8 w-full max-w-md"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}>
              <h2 className="font-serif text-2xl font-light mb-6" style={{ color: '#f2a8b8' }}>Add a Reason 💕</h2>
              <textarea placeholder="I love you because..." rows={3} value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm font-serif outline-none resize-none italic"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }} />
              <div className="flex gap-3 mt-4">
                <motion.button className="flex-1 py-3 rounded-xl font-sans text-sm"
                  style={{ background: 'rgba(242,168,184,0.18)', color: '#f2a8b8', border: '1px solid rgba(242,168,184,0.28)' }}
                  whileHover={{ background: 'rgba(242,168,184,0.28)' }} onClick={handleAdd}>
                  Save this reason 💕
                </motion.button>
                <motion.button className="px-5 py-3 rounded-xl font-sans text-sm"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(240,238,252,0.45)' }}
                  onClick={() => setShowAdd(false)}>Cancel</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteConfirmModal open={!!deleteTarget} itemName={deleteTarget?.text} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </AppShell>
  )
}
