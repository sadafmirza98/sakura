'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppShell from '@/components/layout/AppShell'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'
import { Plus, Lock, Unlock, Mail, Trash2 } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

interface Letter {
  id: string; title: string; unlockDate: string; isSealed: boolean
  preview: string; content?: string; author: string; createdAt: string
}

const INITIAL: Letter[] = []

export default function LettersPage() {
  const [letters, setLetters] = useState<Letter[]>(INITIAL)
  const [openLetter, setOpenLetter] = useState<Letter | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Letter | null>(null)
  const addBlossoms = useAppStore((s) => s.addBlossoms)

  const handleDelete = () => {
    if (!deleteTarget) return
    setLetters((prev) => prev.filter((l) => l.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const handleOpen = (letter: Letter) => {
    const canOpen = !letter.isSealed || new Date(letter.unlockDate) <= new Date()
    if (canOpen) setOpenLetter(letter)
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <motion.div className="flex items-start sm:items-end justify-between mb-10 gap-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-light" style={{ color: '#f2a8b8' }}>Sealed Petals</h1>
            <p className="font-sans text-sm mt-1" style={{ color: 'rgba(201,191,232,0.5)' }}>Letters that wait for the right moment</p>
          </div>
          <motion.button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-sans flex-shrink-0"
            style={{ background: 'rgba(242,168,184,0.13)', color: '#f2a8b8', border: '1px solid rgba(242,168,184,0.28)' }}
            whileHover={{ scale: 1.03 }} onClick={() => setShowAdd(true)}>
            <Plus size={15} /> Write a Letter
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {letters.map((letter, i) => {
            const canOpen = !letter.isSealed || new Date(letter.unlockDate) <= new Date()
            return (
              <motion.div key={letter.id} className="glass rounded-2xl p-6 cursor-pointer group"
                style={{ background: canOpen ? 'rgba(242,168,184,0.07)' : 'rgba(255,255,255,0.03)', border: canOpen ? '1px solid rgba(242,168,184,0.18)' : '1px solid rgba(255,255,255,0.055)' }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }} onClick={() => handleOpen(letter)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: canOpen ? 'rgba(242,168,184,0.18)' : 'rgba(255,255,255,0.055)' }}>
                    {canOpen ? <Unlock size={17} style={{ color: '#f2a8b8' }} /> : <Lock size={17} style={{ color: 'rgba(255,255,255,0.28)' }} />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-xs px-2.5 py-1 rounded-full"
                      style={{ background: canOpen ? 'rgba(242,168,184,0.13)' : 'rgba(255,255,255,0.055)', color: canOpen ? '#f2a8b8' : 'rgba(255,255,255,0.35)' }}>
                      {canOpen ? 'Ready to open' : `Opens ${new Date(letter.unlockDate).toLocaleDateString()}`}
                    </span>
                    <motion.button className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      style={{ color: 'rgba(220,80,100,0.7)' }} whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(letter) }}>
                      <Trash2 size={13} />
                    </motion.button>
                  </div>
                </div>
                <h3 className="font-serif text-lg font-medium mb-2" style={{ color: canOpen ? '#f0eefc' : 'rgba(240,238,252,0.45)' }}>
                  {letter.title}
                </h3>
                <p className="font-sans text-sm italic mb-4" style={{ color: 'rgba(240,238,252,0.38)' }}>
                  {canOpen ? letter.preview : '✦ ✦ ✦ sealed ✦ ✦ ✦'}
                </p>
                <p className="font-sans text-xs" style={{ color: 'rgba(201,191,232,0.28)' }}>
                  Written by {letter.author} · {new Date(letter.createdAt).toLocaleDateString()}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Letter reading overlay */}
      <AnimatePresence>
        {openLetter && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(2,5,16,0.96)', backdropFilter: 'blur(18px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpenLetter(null)}>
            {[...Array(10)].map((_, i) => (
              <motion.div key={i} className="absolute w-3 h-2 rounded-full pointer-events-none"
                style={{ background: 'rgba(242,168,184,0.55)', left: `${15 + Math.random() * 70}%`, top: `${10 + Math.random() * 80}%` }}
                initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0, 0.8, 0], scale: [0, 1, 0.4], y: [0, -50] }}
                transition={{ delay: i * 0.07, duration: 2 }} />
            ))}
            <motion.div className="glass-strong rounded-3xl p-8 sm:p-10 w-full max-w-lg relative max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 110 }} onClick={(e) => e.stopPropagation()}>
              <Mail size={18} style={{ color: '#f2a8b8', margin: '0 auto 18px', display: 'block' }} />
              <h2 className="font-serif text-xl sm:text-2xl font-light text-center mb-8" style={{ color: '#f2a8b8' }}>{openLetter.title}</h2>
              <p className="font-serif text-base leading-loose" style={{ color: 'rgba(240,238,252,0.85)', whiteSpace: 'pre-line' }}>{openLetter.content}</p>
              <motion.button className="mt-8 w-full py-3 rounded-xl font-sans text-sm"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(240,238,252,0.45)' }}
                whileHover={{ background: 'rgba(255,255,255,0.09)' }} onClick={() => setOpenLetter(null)}>
                Close gently
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {showAdd && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(6,9,26,0.88)', backdropFilter: 'blur(10px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdd(false)}>
            <motion.div className="glass-strong rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}>
              <h2 className="font-serif text-2xl font-light mb-6" style={{ color: '#f2a8b8' }}>Seal a Letter</h2>
              <div className="space-y-4">
                <input type="text" placeholder="e.g. Open on our anniversary" className="w-full rounded-xl px-4 py-3 text-sm font-sans outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }} />
                <div>
                  <label className="font-sans text-xs mb-2 block" style={{ color: 'rgba(201,191,232,0.45)' }}>Unlock date</label>
                  <input type="date" className="w-full rounded-xl px-4 py-3 text-sm font-sans outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }} />
                </div>
                <textarea placeholder="Write from your heart..." rows={6} className="w-full rounded-xl px-4 py-3 text-sm font-serif outline-none resize-none italic leading-loose"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }} />
                <div className="flex gap-3">
                  <motion.button className="flex-1 py-3 rounded-xl font-sans text-sm"
                    style={{ background: 'rgba(242,168,184,0.18)', color: '#f2a8b8', border: '1px solid rgba(242,168,184,0.28)' }}
                    whileHover={{ background: 'rgba(242,168,184,0.28)' }}
                    onClick={() => { addBlossoms(3); setShowAdd(false) }}>
                    Seal with love ✉️
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
