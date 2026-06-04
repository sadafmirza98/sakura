'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppShell from '@/components/layout/AppShell'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'
import { Plus, Flame, MapPin, Music, Image as ImageIcon, Trash2 } from 'lucide-react'

interface Milestone {
  id: string
  title: string
  date: string
  description: string
  type: 'moment' | 'trip' | 'milestone' | 'future'
}

const INITIAL: Milestone[] = []

export default function StoryPage() {
  const [milestones, setMilestones] = useState<Milestone[]>(INITIAL)
  const [showAdd, setShowAdd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Milestone | null>(null)

  const handleDelete = () => {
    if (!deleteTarget) return
    setMilestones((prev) => prev.filter((m) => m.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="flex items-start sm:items-end justify-between mb-10 gap-4"
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-light" style={{ color: '#f2a8b8' }}>Our Story</h1>
            <p className="font-sans text-sm mt-1" style={{ color: 'rgba(201,191,232,0.5)' }}>
              Every milestone, a lantern in the night
            </p>
          </div>
          <motion.button
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-sans flex-shrink-0"
            style={{ background: 'rgba(242,168,184,0.13)', color: '#f2a8b8', border: '1px solid rgba(242,168,184,0.28)' }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowAdd(true)}
          >
            <Plus size={15} />
            Add Milestone
          </motion.button>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Center line — hidden on mobile, shown md+ */}
          <div
            className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px"
            style={{ background: 'linear-gradient(180deg, rgba(242,168,184,0.5) 0%, rgba(242,168,184,0.08) 100%)', transform: 'translateX(-50%)' }}
          />
          {/* Left line on mobile */}
          <div
            className="md:hidden absolute left-4 top-0 bottom-0 w-px"
            style={{ background: 'linear-gradient(180deg, rgba(242,168,184,0.5) 0%, rgba(242,168,184,0.08) 100%)' }}
          />

          <div className="space-y-10 md:space-y-12">
            {milestones.map((m, i) => (
              <MilestoneCard
                key={m.id}
                milestone={m}
                index={i}
                onDelete={() => setDeleteTarget(m)}
              />
            ))}

            <motion.div
              className="relative flex md:justify-center justify-start md:pl-0 pl-10"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            >
              {/* Mobile dot */}
              <div className="md:hidden absolute left-2.5 top-3 w-3 h-3 rounded-full" style={{ background: 'rgba(242,168,184,0.4)' }} />
              <div
                className="glass rounded-2xl px-6 py-3 text-center cursor-pointer"
                style={{ border: '1px dashed rgba(242,168,184,0.25)' }}
                onClick={() => setShowAdd(true)}
              >
                <p className="font-serif text-sm italic" style={{ color: 'rgba(242,168,184,0.45)' }}>
                  The story continues...
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {showAdd && <AddMilestoneModal onClose={() => setShowAdd(false)} />}
        </AnimatePresence>
      </div>

      <DeleteConfirmModal
        open={!!deleteTarget}
        itemName={deleteTarget?.title}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppShell>
  )
}

function MilestoneCard({ milestone, index, onDelete }: {
  milestone: Milestone
  index: number
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const isLeft = index % 2 === 0

  return (
    <>
      {/* Desktop alternating layout */}
      <motion.div
        className={`hidden md:flex relative ${isLeft ? 'justify-end pr-[52%]' : 'justify-start pl-[52%]'}`}
        initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, delay: index * 0.13 }}
      >
        <div className="absolute left-1/2 top-6 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ transform: 'translateX(-50%)', background: 'rgba(242,168,184,0.85)', boxShadow: '0 0 14px rgba(242,168,184,0.5)' }}>
          <div className="w-2 h-2 rounded-full bg-white/80" />
        </div>
        <MilestoneCardInner milestone={milestone} open={open} setOpen={setOpen} onDelete={onDelete} />
      </motion.div>

      {/* Mobile single-column layout */}
      <motion.div
        className="md:hidden relative flex justify-start pl-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        <div className="absolute left-2.5 top-6 w-3.5 h-3.5 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(242,168,184,0.85)', boxShadow: '0 0 10px rgba(242,168,184,0.4)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
        </div>
        <MilestoneCardInner milestone={milestone} open={open} setOpen={setOpen} onDelete={onDelete} />
      </motion.div>
    </>
  )
}

function MilestoneCardInner({ milestone, open, setOpen, onDelete }: {
  milestone: Milestone
  open: boolean
  setOpen: (v: boolean) => void
  onDelete: () => void
}) {
  return (
    <motion.div
      className="glass rounded-2xl p-5 w-full max-w-xs group cursor-pointer"
      whileHover={{ scale: 1.02 }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Flame size={13} style={{ color: '#f2a8b8' }} />
          <span className="font-sans text-xs" style={{ color: 'rgba(201,191,232,0.55)' }}>
            {new Date(milestone.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <motion.button
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: 'rgba(220,80,100,0.7)' }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); onDelete() }}
        >
          <Trash2 size={13} />
        </motion.button>
      </div>
      <h3 className="font-serif text-lg font-medium mb-2" style={{ color: '#f0eefc' }}>{milestone.title}</h3>
      <AnimatePresence>
        {open && (
          <motion.p
            className="font-sans text-sm leading-relaxed mb-3"
            style={{ color: 'rgba(240,238,252,0.58)' }}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
          >
            {milestone.description}
          </motion.p>
        )}
      </AnimatePresence>
      <div className="flex gap-2 mt-2">
        {[ImageIcon, Music, MapPin].map((Icon, i) => (
          <div key={i} className="p-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.045)' }}>
            <Icon size={11} style={{ color: 'rgba(201,191,232,0.35)' }} />
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function AddMilestoneModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(6,9,26,0.88)', backdropFilter: 'blur(10px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass-strong rounded-3xl p-8 w-full max-w-md"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-serif text-2xl font-light mb-6" style={{ color: '#f2a8b8' }}>Add a Milestone</h2>
        <div className="space-y-4">
          <input type="text" placeholder="Title"
            className="w-full rounded-xl px-4 py-3 text-sm font-sans outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }} />
          <input type="date"
            className="w-full rounded-xl px-4 py-3 text-sm font-sans outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }} />
          <textarea placeholder="Tell your story..." rows={4}
            className="w-full rounded-xl px-4 py-3 text-sm font-sans outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }} />
          <div className="flex gap-3">
            <motion.button className="flex-1 py-3 rounded-xl font-sans text-sm"
              style={{ background: 'rgba(242,168,184,0.18)', color: '#f2a8b8', border: '1px solid rgba(242,168,184,0.28)' }}
              whileHover={{ background: 'rgba(242,168,184,0.28)' }} onClick={onClose}>
              Plant this Milestone ✦
            </motion.button>
            <motion.button className="px-5 py-3 rounded-xl font-sans text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(240,238,252,0.45)' }}
              onClick={onClose}>
              Cancel
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
