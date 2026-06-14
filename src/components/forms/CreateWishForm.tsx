'use client'
import { useState } from 'react'
import { useContentStore } from '@/store/useContentStore'
import { useAppStore } from '@/store/useAppStore'
import { Field, SakuraInput, SakuraSelect, SaveButton, SuccessState } from './shared'

const ACCENT = '#a8d8a0'
const BLOSSOMS = 0
const WISH_CATS = [
  'Travel', 'Food', 'Experiences', 'Marriage',
  'Faith', 'Personal Growth', 'Career', 'Life Goals',
]

interface Props {
  onSave: (id: string) => void
}

export default function CreateWishForm({ onSave }: Readonly<Props>) {
  const { add } = useContentStore()
  const { addBlossoms } = useAppStore()

  const [wish, setWish]         = useState('')
  const [category, setCategory] = useState('')
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState(false)

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      const id = await add('wishes', {
        wish: wish.trim() || 'A shared wish',
        category,
        completed: false,
      })
      if (BLOSSOMS > 0) addBlossoms(BLOSSOMS)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onSave(id)
      }, 1600)
    } catch {
      setSaving(false)
    }
  }

  if (success) return <SuccessState accent={ACCENT} blossoms={BLOSSOMS} icon="/assets/ui/lantern.png" />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/ui/lantern.png" alt="" aria-hidden="true" style={{ width: 32, height: 32, objectFit: 'contain', filter: `drop-shadow(0 0 10px ${ACCENT}88)` }} />
        <div>
          <p className="font-serif" style={{ fontSize: 16, color: '#f0eefc', fontWeight: 300 }}>Plant a Wish</p>
        </div>
      </div>

      <Field label="The wish">
        <SakuraInput
          type="text"
          placeholder="What do you wish for together..."
          value={wish}
          onChange={(e) => setWish(e.target.value)}
        />
      </Field>
      <Field label="Category">
        <SakuraSelect
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Choose a category...</option>
          {WISH_CATS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </SakuraSelect>
      </Field>

      <SaveButton accent={ACCENT} icon="/assets/ui/lantern.png" label="Plant this wish" onClick={handleSave} disabled={saving} />
    </div>
  )
}
