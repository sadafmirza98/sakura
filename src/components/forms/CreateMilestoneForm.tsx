'use client'
import { useState } from 'react'
import { useContentStore } from '@/store/useContentStore'
import { useAppStore } from '@/store/useAppStore'
import { Field, SakuraInput, SakuraTextarea, SaveButton, SuccessState } from './shared'

const ACCENT = '#e8c97a'
const BLOSSOMS = 5

interface Props {
  onSave: (id: string) => void
}

export default function CreateMilestoneForm({ onSave }: Readonly<Props>) {
  const { add } = useContentStore()
  const { addBlossoms } = useAppStore()

  const [name, setName]     = useState('')
  const [date, setDate]     = useState('')
  const [story, setStory]   = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      // Milestones are stored in 'memories' collection with a type flag,
      // as there is no dedicated 'milestones' Firestore collection in the store.
      const id = await add('memories', {
        title: name.trim() || 'Untitled Milestone',
        date,
        story,
        type: 'milestone',
      })
      addBlossoms(BLOSSOMS)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onSave(id)
      }, 1600)
    } catch {
      setSaving(false)
    }
  }

  if (success) return <SuccessState accent={ACCENT} blossoms={BLOSSOMS} icon="/assets/ui/memories.png" />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/ui/memories.png" alt="" aria-hidden="true" style={{ width: 32, height: 32, objectFit: 'contain', filter: `drop-shadow(0 0 10px ${ACCENT}88)` }} />
        <div>
          <p className="font-serif" style={{ fontSize: 16, color: '#f0eefc', fontWeight: 300 }}>Light a Milestone</p>
          <p className="font-sans" style={{ fontSize: 11, color: `${ACCENT}99`, marginTop: 2 }}>+{BLOSSOMS} blossoms will bloom</p>
        </div>
      </div>

      <Field label="Milestone">
        <SakuraInput
          type="text"
          placeholder="First conversation, first trip..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>
      <Field label="Date">
        <SakuraInput
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </Field>
      <Field label="The story">
        <SakuraTextarea
          rows={4}
          placeholder="Tell the story of this moment..."
          value={story}
          onChange={(e) => setStory(e.target.value)}
        />
      </Field>

      <SaveButton accent={ACCENT} icon="/assets/ui/memories.png" label="Light this milestone" onClick={handleSave} disabled={saving} />
    </div>
  )
}
