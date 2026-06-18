'use client'
import { useState } from 'react'
import { useContentStore } from '@/store/useContentStore'
import { useAppStore } from '@/store/useAppStore'
import { Field, SakuraInput, SakuraTextarea, SakuraSelect, SaveButton, SuccessState, SakuraDatePicker } from './shared'

const ACCENT = '#f2a8b8'
const BLOSSOMS = 1

interface Props {
  onSave: (id: string) => void
}

export default function CreateMemoryForm({ onSave }: Readonly<Props>) {
  const { add } = useContentStore()
  const songs = useContentStore((s) => s.songs)
  const { addBlossoms } = useAppStore()

  const [title, setTitle]   = useState('')
  const [date, setDate]     = useState('')
  const [story, setStory]   = useState('')
  const [tags, setTags]     = useState('')
  const [relatedSong, setRelatedSong] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      const id = await add('memories', {
        title: title.trim() || 'Untitled Memory',
        date,
        story,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        relatedSong: relatedSong || undefined,
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
      {songs.length > 0 && (
        <Field label="Related Song">
          <SakuraSelect value={relatedSong} onChange={(e) => setRelatedSong(e.target.value)}>
            <option value="">None</option>
            {songs.map((s) => (
              <option key={s.id} value={s.id}>{(s.title as string) ?? s.id}</option>
            ))}
          </SakuraSelect>
        </Field>
      )}

      <SaveButton
        accent={ACCENT}
        icon="/assets/ui/memories.png"
        label="Plant this memory"
        onClick={handleSave}
        disabled={saving}
      />
    </div>
  )
}
