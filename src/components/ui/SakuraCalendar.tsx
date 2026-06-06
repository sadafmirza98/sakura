'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'

/* ─── types ───────────────────────────────────────────────────────────── */

interface SakuraCalendarProps {
  /** ISO date string "YYYY-MM-DD" */
  value: string
  onChange: (iso: string) => void
  placeholder?: string
}

/* ─── helpers ─────────────────────────────────────────────────────────── */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function firstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function isoToDate(iso: string): { y: number; m: number; d: number } | null {
  if (!iso) return null
  const parts = iso.split('-')
  if (parts.length !== 3) return null
  return { y: Number.parseInt(parts[0]), m: Number.parseInt(parts[1]) - 1, d: Number.parseInt(parts[2]) }
}

function toISO(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function formatDisplay(iso: string): string {
  if (!iso) return ''
  try {
    const [y, m, d] = iso.split('-').map(Number)
    return `${MONTH_NAMES[m - 1]} ${d}, ${y}`
  } catch {
    return iso
  }
}

/* ─── component ───────────────────────────────────────────────────────── */

export default function SakuraCalendar({ value, onChange, placeholder = 'Choose a date' }: Readonly<SakuraCalendarProps>) {
  const relationshipStartDate = useAppStore((s) => s.relationshipStartDate)
  const anniversaryParts = isoToDate(relationshipStartDate)

  const today = new Date()
  const selectedParts = isoToDate(value)

  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(() => selectedParts?.y ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(() => selectedParts?.m ?? today.getMonth())

  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const handleSelect = (day: number) => {
    onChange(toISO(viewYear, viewMonth, day))
    setOpen(false)
  }

  const isSelected = (day: number) =>
    selectedParts?.y === viewYear &&
    selectedParts?.m === viewMonth &&
    selectedParts?.d === day

  const isToday = (day: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day

  const isAnniversary = (day: number) =>
    anniversaryParts !== null &&
    anniversaryParts.m === viewMonth &&
    anniversaryParts.d === day

  const totalDays = daysInMonth(viewYear, viewMonth)
  const startOffset = firstDayOfWeek(viewYear, viewMonth)

  // Build calendar grid — null = empty cell
  const cells: Array<number | null> = [
    ...new Array<null>(startOffset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      {/* Trigger input */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        style={{
          width: '100%',
          padding: '12px 14px',
          background: 'rgba(255,255,255,0.04)',
          border: open
            ? '1px solid rgba(242,168,184,0.45)'
            : '1px solid rgba(255,255,255,0.09)',
          borderRadius: 12,
          outline: 'none',
          color: value ? 'rgba(240,238,252,0.9)' : 'rgba(201,191,232,0.35)',
          fontSize: 13,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 300,
          cursor: 'pointer',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'border-color 0.2s',
          boxSizing: 'border-box',
        }}
      >
        <span>{value ? formatDisplay(value) : placeholder}</span>
        <span
          style={{
            fontSize: 14,
            opacity: 0.4,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            display: 'inline-block',
          }}
        >
          🌸
        </span>
      </button>

      {/* Calendar popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Sakura calendar"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              zIndex: 100,
              background: 'linear-gradient(160deg, rgba(10,7,30,0.97) 0%, rgba(6,4,20,0.98) 100%)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(242,168,184,0.15)',
              borderRadius: 20,
              padding: '18px 16px 14px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(242,168,184,0.08)',
            }}
          >
            {/* Month navigation */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <motion.button
                type="button"
                onClick={prevMonth}
                whileHover={{ scale: 1.15, color: '#f2a8b8' }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(201,191,232,0.5)',
                  cursor: 'pointer',
                  fontSize: 18,
                  padding: '2px 8px',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label="Previous month"
              >
                ‹
              </motion.button>

              <div style={{ textAlign: 'center' }}>
                <p className="font-serif" style={{ fontSize: 16, fontWeight: 300, color: '#f0eefc', lineHeight: 1.2 }}>
                  {MONTH_NAMES[viewMonth]}
                </p>
                <p className="font-sans" style={{ fontSize: 11, color: 'rgba(201,191,232,0.4)', marginTop: 1 }}>
                  {viewYear}
                </p>
              </div>

              <motion.button
                type="button"
                onClick={nextMonth}
                whileHover={{ scale: 1.15, color: '#f2a8b8' }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(201,191,232,0.5)',
                  cursor: 'pointer',
                  fontSize: 18,
                  padding: '2px 8px',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label="Next month"
              >
                ›
              </motion.button>
            </div>

            {/* Day labels */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                marginBottom: 6,
              }}
            >
              {DAY_LABELS.map(d => (
                <div
                  key={d}
                  style={{
                    textAlign: 'center',
                    fontSize: 10,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    color: 'rgba(201,191,232,0.3)',
                    padding: '2px 0 6px',
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {cells.map((day, idx) => {
              const cellKey = day !== null ? `day-${day}` : `empty-${idx}`
              return (
                <DayCell
                  key={cellKey}
                  day={day}
                  selected={day !== null && isSelected(day)}
                  today={day !== null && isToday(day)}
                  anniversary={day !== null && isAnniversary(day)}
                  onSelect={day !== null ? () => handleSelect(day) : undefined}
                />
              )
            })}
            </div>

            {/* Legend */}
            <div
              style={{
                marginTop: 12,
                paddingTop: 10,
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                gap: 14,
                justifyContent: 'center',
              }}
            >
              <LegendItem emoji="🌸" label="Selected" />
              <LegendItem emoji="✦" label="Today" color="rgba(201,191,232,0.6)" />
              <LegendItem emoji="✦" label="Anniversary" color="#e8c97a" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Day cell ────────────────────────────────────────────────────────── */

interface DayCellProps {
  readonly day: number | null
  readonly selected: boolean
  readonly today: boolean
  readonly anniversary: boolean
  readonly onSelect: (() => void) | undefined
}

function DayCell({ day, selected, today, anniversary, onSelect }: DayCellProps) {
  if (day === null) {
    return <div style={{ aspectRatio: '1' }} aria-hidden="true" />
  }

  const bg = selected
    ? 'rgba(242,168,184,0.22)'
    : 'transparent'

  const border = selected
    ? '1px solid rgba(242,168,184,0.5)'
    : '1px solid transparent'

  const textColor = selected
    ? '#f2a8b8'
    : today
    ? 'rgba(201,191,232,0.9)'
    : anniversary
    ? '#e8c97a'
    : 'rgba(240,238,252,0.65)'

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{
        background: selected ? 'rgba(242,168,184,0.28)' : 'rgba(242,168,184,0.1)',
        scale: 1.12,
      }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      style={{
        position: 'relative',
        aspectRatio: '1',
        borderRadius: 10,
        background: bg,
        border,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 1,
        outline: 'none',
        padding: 0,
      }}
      aria-label={`${day}`}
      aria-pressed={selected}
    >
      {/* Sakura blossom marker for selected day */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: 22, opacity: 0.18 }}>🌸</span>
        </motion.div>
      )}

      {/* Golden blossom for anniversary */}
      {anniversary && !selected && (
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
          animate={{
            filter: [
              'drop-shadow(0 0 3px rgba(232,201,122,0.3))',
              'drop-shadow(0 0 8px rgba(232,201,122,0.7))',
              'drop-shadow(0 0 3px rgba(232,201,122,0.3))',
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <span style={{ fontSize: 18, opacity: 0.25 }}>✦</span>
        </motion.div>
      )}

      {/* Day number */}
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          fontFamily: 'Inter, sans-serif',
          fontSize: 12,
          fontWeight: selected ? 500 : 400,
          color: textColor,
          lineHeight: 1,
        }}
      >
        {day}
      </span>

      {/* Today indicator dot */}
      {today && !selected && (
        <div
          style={{
            width: 3,
            height: 3,
            borderRadius: '50%',
            background: 'rgba(201,191,232,0.6)',
          }}
        />
      )}
    </motion.button>
  )
}

/* ─── Legend item ─────────────────────────────────────────────────────── */

function LegendItem({
  emoji,
  label,
  color = '#f2a8b8',
}: Readonly<{ emoji: string; label: string; color?: string }>) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 10, color }}>{emoji}</span>
      <span
        className="font-sans"
        style={{ fontSize: 9, color: 'rgba(201,191,232,0.3)', letterSpacing: '0.06em' }}
      >
        {label}
      </span>
    </div>
  )
}
