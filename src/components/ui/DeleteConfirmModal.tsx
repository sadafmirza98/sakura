'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, X } from 'lucide-react'

interface DeleteConfirmModalProps {
  open: boolean
  itemName?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirmModal({
  open,
  itemName,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgba(6,9,26,0.88)', backdropFilter: 'blur(12px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="glass-strong rounded-3xl p-8 w-full max-w-sm text-center"
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 160, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <motion.div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(220,80,100,0.15)', border: '1px solid rgba(220,80,100,0.25)' }}
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Trash2 size={22} style={{ color: '#e87a8a' }} />
            </motion.div>

            <h3 className="font-serif text-xl font-light mb-2" style={{ color: '#f0eefc' }}>
              Remove this memory?
            </h3>

            {itemName && (
              <p className="font-sans text-sm mb-1" style={{ color: 'rgba(242,168,184,0.8)' }}>
                &ldquo;{itemName}&rdquo;
              </p>
            )}

            <p className="font-sans text-xs mb-7" style={{ color: 'rgba(201,191,232,0.45)' }}>
              This petal will fall from the tree forever.
            </p>

            <div className="flex gap-3">
              <motion.button
                className="flex-1 py-3 rounded-xl font-sans text-sm flex items-center justify-center gap-2"
                style={{
                  background: 'rgba(220,80,100,0.18)',
                  color: '#e87a8a',
                  border: '1px solid rgba(220,80,100,0.3)',
                }}
                whileHover={{ background: 'rgba(220,80,100,0.28)' }}
                whileTap={{ scale: 0.96 }}
                onClick={onConfirm}
              >
                <Trash2 size={14} />
                Yes, remove it
              </motion.button>

              <motion.button
                className="flex-1 py-3 rounded-xl font-sans text-sm flex items-center justify-center gap-2"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(240,238,252,0.55)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                whileHover={{ background: 'rgba(255,255,255,0.09)' }}
                whileTap={{ scale: 0.96 }}
                onClick={onCancel}
              >
                <X size={14} />
                Keep it
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
