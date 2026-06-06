'use client'
import { useState } from 'react'
import { useContentStore } from '@/store/useContentStore'
import { useAppStore } from '@/store/useAppStore'
import { Field, SakuraInput, SakuraTextarea, SaveButton, SuccessState } from './shared'

const ACCENT = '#d4aaff'
const BLOSSOMS = 3

interface Props {
  onSave: () => void
}

export default function CreateLetterForm({ onSave }: Readonly<Props>) {
  const { add } = useContentStore()
  const { addBlossoms } = useAppStore()

  const [openWhen, setOpenWhen]     = useState('')
  const [unlockDate, setUnlockDate] = useState('')
  const [letter, setLetter]         = useState('')
  const [saving, setSaving]         = useState(false)
  const [success, setSuccess]       = useState(false)

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      await add('letters', {
        openWhen: openWhen.trim() || 'When you need me most',
        unlockDate,
        letter,
        locked: unlockDate ? new Date(unlockDate) > new Date() : false,
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
        <span style={{ fontSize: 28, filter: `drop-shadow(0 0 10px ${ACCENT}88)` }}>🕊️</span>
        <div>
          <p className="font-serif" style={{ fontSize: 16, color: '#f0eefc', fontWeight: 300 }}>Seal a Letter</p>
          <p className="font-sans" style={{ fontSize: 11, color: `${ACCENT}99`, marginTop: 2 }}>+{BLOSSOMS} blossoms will bloom</p>
        </div>
      </div>

      <Field label="Open when...">
        <SakuraInput
          type="text"
          placeholder="Open on our anniversary..."
          value={openWhen}
          onChange={(e) => setOpenWhen(e.target.value)}
        />
      </Field>
      <Field label="Unlock date">
        <SakuraInput
          type="date"
          value={unlockDate}
          onChange={(e) => setUnlockDate(e.target.value)}
        />
      </Field>
      <Field label="Your letter">
        <SakuraTextarea
          rows={8}
          placeholder="Write from your heart..."
          value={letter}
          onChange={(e) => setLetter(e.target.value)}
          style={{
            fontFamily: 'Playfair Display, serif',
            fontStyle: 'italic',
            fontSize: 14,
            lineHeight: 2,
          }}
        />
      </Field>

      <SaveButton
        accent={ACCENT}
        emoji="🕊️"
        label="Seal this letter"
        onClick={handleSave}
        disabled={saving}
      />
    </div>
  )
}
