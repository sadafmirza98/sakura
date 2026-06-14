'use client'
/**
 * Shared form primitives used across all creation forms.
 */
import { motion } from 'framer-motion'
import SakuraCalendar from '@/components/ui/SakuraCalendar'

/* ─── Re-export SakuraCalendar as SakuraDatePicker ─────────────────────── */
export { SakuraCalendar as SakuraDatePicker }

/* ─── Base style objects ───────────────────────────────────────────────── */
export const baseInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 12,
  outline: 'none',
  color: 'rgba(240,238,252,0.9)',
  fontSize: 13,
  fontFamily: 'Inter, sans-serif',
  fontWeight: 300,
  boxSizing: 'border-box' as const,
}

/* ─── SakuraInput ──────────────────────────────────────────────────────── */
export interface SakuraInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  style?: React.CSSProperties
}

export function SakuraInput({ style, ...props }: SakuraInputProps) {
  return (
    <input
      style={{ ...baseInputStyle, ...style }}
      {...props}
    />
  )
}

/* ─── SakuraTextarea ───────────────────────────────────────────────────── */
export interface SakuraTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  style?: React.CSSProperties
}

export function SakuraTextarea({ style, ...props }: SakuraTextareaProps) {
  return (
    <textarea
      style={{ ...baseInputStyle, resize: 'none', lineHeight: 1.7, ...style }}
      {...props}
    />
  )
}

/* ─── SakuraSelect ─────────────────────────────────────────────────────── */
export interface SakuraSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  style?: React.CSSProperties
}

export function SakuraSelect({ style, children, ...props }: SakuraSelectProps) {
  return (
    <select
      style={{
        ...baseInputStyle,
        appearance: 'none' as const,
        cursor: 'pointer',
        ...style,
      }}
      {...props}
    >
      {children}
    </select>
  )
}

/* ─── MoodChipGroup ────────────────────────────────────────────────────── */
const MOODS: { label: string; color: string }[] = [
  { label: 'Love',        color: '#f2a8b8' },
  { label: 'Comfort',     color: '#8aa0ff' },
  { label: 'Dreams',      color: '#b48cf0' },
  { label: 'Milestones',  color: '#e8c97a' },
  { label: 'Nostalgia',   color: '#c9bfe8' },
  { label: 'Hope',        color: '#a8e8c0' },
  { label: 'Missing You', color: '#d4aaff' },
]

export interface MoodChipGroupProps {
  value: string | null
  onChange: (mood: string | null) => void
}

export function MoodChipGroup({ value, onChange }: MoodChipGroupProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {MOODS.map(({ label, color }) => {
        const active = value === label
        return (
          <motion.button
            key={label}
            type="button"
            onClick={() => onChange(active ? null : label)}
            style={{
              padding: '5px 12px',
              borderRadius: 100,
              cursor: 'pointer',
              fontSize: 11,
              fontFamily: 'Inter, sans-serif',
              background: active ? `${color}22` : 'rgba(255,255,255,0.04)',
              border: active ? `1px solid ${color}66` : '1px solid rgba(255,255,255,0.08)',
              color: active ? color : 'rgba(240,238,252,0.5)',
              boxShadow: active ? `0 0 10px ${color}33` : 'none',
              transition: 'all 0.2s',
            }}
            whileTap={{ scale: 0.93 }}
          >
            {label}
          </motion.button>
        )
      })}
    </div>
  )
}

/* ─── FieldLabel ───────────────────────────────────────────────────────── */
export function FieldLabel({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <p
      className="font-sans"
      style={{
        display: 'block',
        marginBottom: 6,
        fontSize: 10,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'rgba(201,191,232,0.4)',
      }}
    >
      {children}
    </p>
  )
}

/* ─── Field wrapper ────────────────────────────────────────────────────── */
export function Field({ label, children }: Readonly<{ label?: string; children: React.ReactNode }>) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      {children}
    </div>
  )
}

/* ─── SaveButton ───────────────────────────────────────────────────────── */
export interface SaveButtonProps {
  accent: string
  icon: string
  label: string
  onClick: () => void
  disabled?: boolean
}

export function SaveButton({ accent, icon, label, onClick, disabled }: SaveButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '13px 20px',
        marginTop: 6,
        borderRadius: 14,
        border: `1px solid ${accent}44`,
        background: `linear-gradient(135deg, ${accent}1e 0%, ${accent}12 100%)`,
        color: accent,
        fontSize: 14,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        letterSpacing: '0.03em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative',
        overflow: 'hidden',
        opacity: disabled ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
      whileHover={disabled ? {} : {
        boxShadow: `0 0 24px ${accent}28`,
        borderColor: `${accent}88`,
        scale: 1.01,
      }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={icon} alt="" aria-hidden="true" style={{ width: 16, height: 16, objectFit: 'contain', filter: `drop-shadow(0 0 5px ${accent}88)`, flexShrink: 0 }} />
      {label}
    </motion.button>
  )
}

/* ─── Success state ────────────────────────────────────────────────────── */
export function SuccessState({ accent, blossoms, icon = '/assets/ui/memories.png' }: Readonly<{ accent: string; blossoms: number; icon?: string }>) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
        gap: 16,
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }}
        transition={{ duration: 0.8 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon} alt="" aria-hidden="true" style={{ width: 56, height: 56, objectFit: 'contain', filter: `drop-shadow(0 0 16px ${accent}88)` }} />
      </motion.div>
      <p
        className="font-serif"
        style={{ fontSize: 17, color: accent, fontStyle: 'italic', textAlign: 'center' }}
      >
        Growing on the tree…
      </p>
      {blossoms > 0 && (
        <p
          className="font-sans"
          style={{ fontSize: 12, color: 'rgba(201,191,232,0.4)', textAlign: 'center' }}
        >
          +{blossoms} blossom{blossoms === 1 ? '' : 's'} added
        </p>
      )}
    </div>
  )
}
