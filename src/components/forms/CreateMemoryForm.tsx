'use client'
import { useState } from 'react'
import { useContentStore } from '@/store/useContentStore'
import { useAppStore } from '@/store/useAppStore'
import { Field, SakuraInput, SakuraTextarea, SaveButton, SuccessState, SakuraDatePicker } from './shared'

const ACCENT = '#f2a8b8'
const BLOSSOMS = 1

interface Props {
  onSave: () => void
}

export default function CreateMemoryForm({ onSave }: Readonly<Props>) {
  const { add } = useContentStore()
  const { addBlossoms } = useAppStore()

  const [title, setTitle]   = useState('')
  const [date, setDate]     = useState('')
  const [story, setStory]   = useState('')
  const [tags, setTags]     = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      await add('memories', {
        title: title.trim() || 'Untitled Memory',
        date,
        story,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      })
      addBlossoms(BLOSSOMS)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onSave()
      }, 1600)
    } catch {
      setSaving(false)
    }
  }

  if (success) return <SuccessState accent={ACCENT} blossoms={BLOSSOMS} />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 28, filter: `drop-shadow(0 0 10px ${ACCENT}88)` }}>🌸</span>
        <div>
          <p className="font-serif" style={{ fontSize: 16, color: '#f0eefc', fontWeight: 300 }}>Plant a Memory</p>
          <p className="font-sans" style={{ fontSize: 11, color: `${ACCENT}99`, marginTop: 2 }}>+{BLOSSOMS} blossom will bloom</p>
        </div>
      </div>

      <Field label="Title">
        <SakuraInput
          type="text"
          placeholder="Name this memory..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Field>
      <Field label="Date">
        <SakuraDatePicker
          value={date}
          onChange={setDate}
          placeholder="When did this happen?"
        />
      </Field>
      <Field label="Your story">
        <SakuraTextarea
          rows={4}
          placeholder="What do you want to remember forever..."
          value={story}
          onChange={(e) => setStory(e.target.value)}
        />
      </Field>
      <Field label="Tags">
        <SakuraInput
          type="text"
          placeholder="first times, rain, laughter..."
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </Field>

      <SaveButton
        accent={ACCENT}
        emoji="🌸"
        label="Plant this memory"
        onClick={handleSave}
        disabled={saving}
      />
    </div>
  )
}
