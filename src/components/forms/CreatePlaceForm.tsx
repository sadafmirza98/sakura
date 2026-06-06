'use client'
import { useState } from 'react'
import { useContentStore } from '@/store/useContentStore'
import { useAppStore } from '@/store/useAppStore'
import { Field, SakuraInput, SakuraTextarea, SaveButton, SuccessState } from './shared'

const ACCENT = '#a8d0e8'
const BLOSSOMS = 0

interface Props {
  onSave: () => void
}

export default function CreatePlaceForm({ onSave }: Readonly<Props>) {
  const { add } = useContentStore()
  const { addBlossoms } = useAppStore()

  const [place, setPlace]     = useState('')
  const [country, setCountry] = useState('')
  const [date, setDate]       = useState('')
  const [notes, setNotes]     = useState('')
  const [beenHere, setBeenHere] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      await add('places', {
        place: place.trim() || 'Unnamed Place',
        country,
        date,
        notes,
        visited: beenHere,
      })
      if (BLOSSOMS > 0) addBlossoms(BLOSSOMS)
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
        <span style={{ fontSize: 28, filter: `drop-shadow(0 0 10px ${ACCENT}88)` }}>📍</span>
        <div>
          <p className="font-serif" style={{ fontSize: 16, color: '#f0eefc', fontWeight: 300 }}>Mark a Footprint</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="Place name">
          <SakuraInput
            type="text"
            placeholder="Kyoto..."
            value={place}
            onChange={(e) => setPlace(e.target.value)}
          />
        </Field>
        <Field label="Country">
          <SakuraInput
            type="text"
            placeholder="Japan..."
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </Field>
      </div>

      <Field label="Date">
        <SakuraInput
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </Field>
      <Field label="Notes">
        <SakuraTextarea
          rows={3}
          placeholder="What you felt, what you saw..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <input
          id="been-here"
          type="checkbox"
          checked={beenHere}
          onChange={(e) => setBeenHere(e.target.checked)}
          style={{ accentColor: ACCENT, width: 15, height: 15, cursor: 'pointer' }}
        />
        <label
          htmlFor="been-here"
          style={{
            fontSize: 13,
            color: 'rgba(240,238,252,0.65)',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          We&apos;ve been here together
        </label>
      </div>

      <SaveButton
        accent={ACCENT}
        emoji="📍"
        label="Mark this footprint"
        onClick={handleSave}
        disabled={saving}
      />
    </div>
  )
}
