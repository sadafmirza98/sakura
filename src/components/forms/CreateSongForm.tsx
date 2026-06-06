'use client'
import { useState } from 'react'
import { useContentStore } from '@/store/useContentStore'
import { useAppStore } from '@/store/useAppStore'
import { Field, FieldLabel, SakuraInput, SakuraTextarea, MoodChipGroup, SaveButton, SuccessState } from './shared'

const ACCENT = '#ffb450'
const BLOSSOMS = 1

interface Props {
  onSave: () => void
}

export default function CreateSongForm({ onSave }: Readonly<Props>) {
  const { add } = useContentStore()
  const { addBlossoms } = useAppStore()

  const [url, setUrl]       = useState('')
  const [title, setTitle]   = useState('')
  const [artist, setArtist] = useState('')
  const [mood, setMood]     = useState<string | null>(null)
  const [why, setWhy]       = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      await add('songs', {
        url,
        title: title.trim() || 'Untitled Song',
        artist,
        mood,
        why,
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
        <span style={{ fontSize: 28, filter: `drop-shadow(0 0 10px ${ACCENT}88)` }}>🏮</span>
        <div>
          <p className="font-serif" style={{ fontSize: 16, color: '#f0eefc', fontWeight: 300 }}>Hang a Lantern</p>
          <p className="font-sans" style={{ fontSize: 11, color: `${ACCENT}99`, marginTop: 2 }}>+{BLOSSOMS} blossom will bloom</p>
        </div>
      </div>

      <Field label="Link (optional)">
        <SakuraInput
          type="url"
          placeholder="YouTube or Spotify URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="Song title">
          <SakuraInput
            type="text"
            placeholder="Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Field label="Artist">
          <SakuraInput
            type="text"
            placeholder="Artist..."
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
          />
        </Field>
      </div>

      <div style={{ marginBottom: 14 }}>
        <FieldLabel>Mood</FieldLabel>
        <MoodChipGroup value={mood} onChange={setMood} />
      </div>

      <Field label="Why this song matters">
        <SakuraTextarea
          rows={3}
          placeholder="The story behind this song..."
          value={why}
          onChange={(e) => setWhy(e.target.value)}
          style={{ fontStyle: 'italic' }}
        />
      </Field>

      <SaveButton
        accent={ACCENT}
        emoji="🏮"
        label="Hang this lantern"
        onClick={handleSave}
        disabled={saving}
      />
    </div>
  )
}
