'use client'
import { useState } from 'react'
import { useContentStore } from '@/store/useContentStore'
import { useAppStore } from '@/store/useAppStore'
import { Field, SakuraTextarea, SaveButton, SuccessState } from './shared'

const ACCENT = '#a8d8a0'
const BLOSSOMS = 0

interface Props {
  onSave: () => void
}

export default function CreateWhisperForm({ onSave }: Readonly<Props>) {
  const { add } = useContentStore()
  const { addBlossoms } = useAppStore()

  const [text, setText]     = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      await add('whispers', { text })
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

  if (success) return <SuccessState accent={ACCENT} blossoms={BLOSSOMS} icon="/assets/ui/petal.png" />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/ui/petal.png" alt="" aria-hidden="true" style={{ width: 32, height: 32, objectFit: 'contain', filter: `drop-shadow(0 0 10px ${ACCENT}88)` }} />
        <div>
          <p className="font-serif" style={{ fontSize: 16, color: '#f0eefc', fontWeight: 300 }}>Whisper a Leaf</p>
        </div>
      </div>

      <Field>
        <SakuraTextarea
          rows={6}
          placeholder="An inside joke, a quiet thought, a tiny love note..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ fontStyle: 'italic', fontSize: 14, lineHeight: 1.8 }}
        />
      </Field>

      <SaveButton
        accent={ACCENT}
        icon="/assets/ui/petal.png"
        label="Release this whisper"
        onClick={handleSave}
        disabled={saving}
      />
    </div>
  )
}
