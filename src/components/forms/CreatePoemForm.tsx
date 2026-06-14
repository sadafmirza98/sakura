'use client'
import { useState } from 'react'
import { useContentStore } from '@/store/useContentStore'
import { useAppStore } from '@/store/useAppStore'
import { Field, SakuraInput, SakuraTextarea, SaveButton, SuccessState } from './shared'

const ACCENT = '#c9bfe8'
const BLOSSOMS = 2

interface Props {
  onSave: () => void
}

export default function CreatePoemForm({ onSave }: Readonly<Props>) {
  const { add } = useContentStore()
  const { addBlossoms } = useAppStore()

  const [title, setTitle] = useState('')
  const [poem, setPoem]   = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      await add('poems', {
        title: title.trim() || 'Untitled Poem',
        poem,
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

  if (success) return <SuccessState accent={ACCENT} blossoms={BLOSSOMS} icon="/assets/ui/letter.png" />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/ui/letter.png" alt="" aria-hidden="true" style={{ width: 32, height: 32, objectFit: 'contain', filter: `drop-shadow(0 0 10px ${ACCENT}88)` }} />
        <div>
          <p className="font-serif" style={{ fontSize: 16, color: '#f0eefc', fontWeight: 300 }}>Release a Petal</p>
          <p className="font-sans" style={{ fontSize: 11, color: `${ACCENT}99`, marginTop: 2 }}>+{BLOSSOMS} blossoms will bloom</p>
        </div>
      </div>

      <Field label="Title">
        <SakuraInput
          type="text"
          placeholder="Name this petal..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Field>
      <Field label="Poem">
        <SakuraTextarea
          rows={9}
          placeholder="Let the words fall like petals..."
          value={poem}
          onChange={(e) => setPoem(e.target.value)}
          style={{
            fontFamily: 'Playfair Display, serif',
            fontStyle: 'italic',
            fontSize: 14,
            lineHeight: 2,
          }}
        />
      </Field>

      <SaveButton accent={ACCENT} icon="/assets/ui/letter.png" label="Release this petal" onClick={handleSave} disabled={saving} />
    </div>
  )
}
