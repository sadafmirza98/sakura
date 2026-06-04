'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppShell from '@/components/layout/AppShell'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'
import { Plus, Search, Heart, Grid, List, Trash2 } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

interface Memory {
  id: string
  title: string
  date: string
  tags: string[]
  type: 'photo' | 'note' | 'video' | 'voice'
  favorite: boolean
  description: string
  color: string
}

const COLORS = [
  'rgba(242,168,184,0.1)',
  'rgba(201,191,232,0.1)',
  'rgba(232,201,122,0.08)',
  'rgba(168,200,255,0.08)',
]

const INITIAL: Memory[] = []

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>(INITIAL)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Memory | null>(null)
  const addBlossoms = useAppStore((s) => s.addBlossoms)

  const filtered = memories.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.tags.some((t) => t.includes(search.toLowerCase()))
  )

  const handleDelete = () => {
    if (!deleteTarget) return
    setMemories((prev) => prev.filter((m) => m.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="flex items-start sm:items-end justify-between mb-8 gap-4"
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-light" style={{ color: '#f2a8b8' }}>Memory Vault</h1>
            <p className="font-sans text-sm mt-1" style={{ color: 'rgba(201,191,232,0.5)' }}>
              {memories.length} memories preserved
            </p>
          </div>
          <motion.button
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-sans flex-shrink-0"
            style={{ background: 'rgba(242,168,184,0.13)', color: '#f2a8b8', border: '1px solid rgba(242,168,184,0.28)' }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAdd(true)}
          >
            <Plus size={15} />
            New Memory
          </motion.button>
        </motion.div>

        {/* Search & controls */}
        <motion.div className="flex items-center gap-3 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="flex-1 flex items-center gap-3 glass rounded-2xl px-4 py-3">
            <Search size={15} style={{ color: 'rgba(201,191,232,0.45)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search memories, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none font-sans text-sm"
              style={{ color: '#f0eefc', minWidth: 0 }}
            />
          </div>
          <div className="flex gap-2">
            {([['grid', Grid], ['list', List]] as const).map(([v, Icon]) => (
              <motion.button
                key={v}
                className="p-2.5 rounded-xl"
                style={{
                  background: view === v ? 'rgba(242,168,184,0.18)' : 'rgba(255,255,255,0.05)',
                  color: view === v ? '#f2a8b8' : 'rgba(255,255,255,0.35)',
                }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setView(v)}
              >
                <Icon size={15} />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Cards */}
        <motion.div
          className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-4'}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          {filtered.map((mem, i) => (
            <MemoryCard
              key={mem.id}
              memory={mem}
              index={i}
              onDelete={() => setDeleteTarget(mem)}
              onToggleFav={() =>
                setMemories((prev) =>
                  prev.map((m) => m.id === mem.id ? { ...m, favorite: !m.favorite } : m)
                )
              }
            />
          ))}
          <motion.div
            className="glass rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer min-h-[160px]"
            style={{ border: '1px dashed rgba(242,168,184,0.2)' }}
            whileHover={{ scale: 1.02, background: 'rgba(242,168,184,0.04)' }}
            onClick={() => setShowAdd(true)}
          >
            <Plus size={22} style={{ color: 'rgba(242,168,184,0.45)' }} />
            <p className="font-sans text-sm" style={{ color: 'rgba(242,168,184,0.45)' }}>Preserve a memory</p>
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showAdd && <AddMemoryModal onClose={() => setShowAdd(false)} onSave={() => { addBlossoms(1); setShowAdd(false) }} />}
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

function MemoryCard({
  memory, index, onDelete, onToggleFav
}: {
  memory: Memory
  index: number
  onDelete: () => void
  onToggleFav: () => void
}) {
  return (
    <motion.div
      className="glass rounded-2xl p-5 group"
      style={{ background: memory.color }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ scale: 1.015, y: -2 }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="font-sans text-xs" style={{ color: 'rgba(240,238,252,0.45)' }}>
          {new Date(memory.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
        <div className="flex items-center gap-2">
          <motion.button onClick={onToggleFav} whileTap={{ scale: 1.3 }}>
            <Heart size={14} fill={memory.favorite ? '#f2a8b8' : 'none'} style={{ color: '#f2a8b8' }} />
          </motion.button>
          <motion.button
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: 'rgba(220,80,100,0.7)' }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDelete}
          >
            <Trash2 size={13} />
          </motion.button>
        </div>
      </div>
      <h3 className="font-serif text-lg font-medium mb-2" style={{ color: '#f0eefc' }}>{memory.title}</h3>
      <p className="font-sans text-sm leading-relaxed mb-4" style={{ color: 'rgba(240,238,252,0.58)' }}>
        {memory.description}
      </p>
      <div className="flex flex-wrap gap-2">
        {memory.tags.map((tag) => (
          <span
            key={tag}
            className="font-sans text-xs px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(201,191,232,0.75)' }}
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

function AddMemoryModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
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
        <h2 className="font-serif text-2xl font-light mb-6" style={{ color: '#f2a8b8' }}>Preserve a Memory ✦</h2>
        <div className="space-y-4">
          <input type="text" placeholder="Title"
            className="w-full rounded-xl px-4 py-3 text-sm font-sans outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }} />
          <input type="date"
            className="w-full rounded-xl px-4 py-3 text-sm font-sans outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }} />
          <textarea placeholder="What do you want to remember?" rows={4}
            className="w-full rounded-xl px-4 py-3 text-sm font-sans outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }} />
          <input type="text" placeholder="Tags (comma separated)"
            className="w-full rounded-xl px-4 py-3 text-sm font-sans outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0eefc' }} />
          <div className="flex gap-3">
            <motion.button className="flex-1 py-3 rounded-xl font-sans text-sm"
              style={{ background: 'rgba(242,168,184,0.18)', color: '#f2a8b8', border: '1px solid rgba(242,168,184,0.28)' }}
              whileHover={{ background: 'rgba(242,168,184,0.28)' }} onClick={onSave}>
              Save Memory 🌸
            </motion.button>
            <motion.button className="px-5 py-3 rounded-xl font-sans text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(240,238,252,0.45)' }}
              whileHover={{ background: 'rgba(255,255,255,0.08)' }} onClick={onClose}>
              Cancel
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
