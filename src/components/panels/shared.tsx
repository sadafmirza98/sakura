'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import type { ContentItem } from '@/store/useContentStore'
import { Field, SakuraInput, SakuraTextarea, SakuraDatePicker, SaveButton } from '@/components/forms/shared'

interface DeleteButtonProps {
  readonly label: string
  readonly onDelete: () => void
}

/**
 * Two-step delete control — first click arms it ("Confirm delete…"),
 * second click within 3s actually deletes. Re-arms automatically so a
 * stray click never destroys something by accident.
 */
export function DeleteButton({ label, onDelete }: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false)

  return (
    <motion.button
      type="button"
      onClick={() => {
        if (confirming) { onDelete(); return }
        setConfirming(true)
        setTimeout(() => setConfirming(false), 3000)
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
        padding: '11px 18px',
        borderRadius: 12,
        background: confirming ? 'rgba(224,100,100,0.16)' : 'rgba(255,255,255,0.04)',
        border: confirming ? '1px solid rgba(224,100,100,0.45)' : '1px solid rgba(255,255,255,0.08)',
        color: confirming ? '#ff9a9a' : 'rgba(240,238,252,0.4)',
        fontSize: 13,
        fontFamily: 'Inter, sans-serif',
        cursor: 'pointer',
        transition: 'background 0.2s, border-color 0.2s, color 0.2s',
      }}
    >
      <span style={{ fontSize: 14 }}>🗑</span>
      {confirming ? `Confirm delete ${label}?` : `Delete this ${label}`}
    </motion.button>
  )
}

/* ─── Edit memory form — reused by MemoryPanel and the timeline section modal ── */
const MEMORY_ACCENT = '#f2a8b8'

export interface EditMemoryFormProps {
  readonly item: ContentItem
  readonly onCancel: () => void
  readonly onSave: (data: Record<string, unknown>) => Promise<void>
}

export function EditMemoryForm({ item, onCancel, onSave }: EditMemoryFormProps) {
  const [title, setTitle] = useState((item.title as string) ?? '')
  const [date, setDate]   = useState((item.date as string) ?? '')
  const [story, setStory] = useState((item.story as string) ?? '')
  const [tags, setTags]   = useState(((item.tags as string[]) ?? []).join(', '))
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    await onSave({
      title: title.trim() || 'Untitled Memory',
      date,
      story,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <p className="font-serif" style={{ fontSize: 16, color: '#f0eefc', fontWeight: 300, marginBottom: 18 }}>
        Edit memory
      </p>

      <Field label="Title">
        <SakuraInput type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Date">
        <SakuraDatePicker value={date} onChange={setDate} placeholder="When did this happen?" />
      </Field>
      <Field label="Your story">
        <SakuraTextarea rows={4} value={story} onChange={(e) => setStory(e.target.value)} />
      </Field>
      <Field label="Tags">
        <SakuraInput type="text" value={tags} onChange={(e) => setTags(e.target.value)} />
      </Field>

      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
        <div style={{ flex: 1 }}>
          <SaveButton accent={MEMORY_ACCENT} icon="/assets/ui/memories.png" label="Save changes" onClick={handleSave} disabled={saving} />
        </div>
        <motion.button
          onClick={onCancel}
          whileHover={{ background: 'rgba(255,255,255,0.06)' }}
          whileTap={{ scale: 0.97 }}
          style={{
            padding: '13px 18px',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)',
            color: 'rgba(240,238,252,0.55)',
            fontSize: 14,
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer',
          }}
        >
          Cancel
        </motion.button>
      </div>
    </motion.div>
  )
}
