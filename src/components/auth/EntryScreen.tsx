'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import GardenBackground from '@/components/ui/GardenBackground'
import SakuraPetals from '@/components/ui/SakuraPetals'

const CORRECT_PIN = process.env.NEXT_PUBLIC_SAKURA_PIN ?? ''

type Phase = 'idle' | 'wrong' | 'blooming' | 'entered'

export default function EntryScreen() {
  const [pin, setPin] = useState(['', '', '', '', '', ''])
  const [phase, setPhase] = useState<Phase>('idle')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const setAuthenticated = useAppStore((s) => s.setAuthenticated)

  const displayPin = pin.join('')

  const handleKey = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...pin]
    next[idx] = val.slice(-1)
    setPin(next)
    if (val && idx < 5) {
      inputRefs.current[idx + 1]?.focus()
    }
    // Auto-check when full
    if (val && idx === 5) {
      const full = next.join('')
      checkPin(full)
    }
  }

  const handleBackspace = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  const checkPin = (full: string) => {
    if (full === CORRECT_PIN) {
      setPhase('blooming')
      setTimeout(() => {
        setPhase('entered')
        setTimeout(() => setAuthenticated(true), 1200)
      }, 2800)
    } else {
      setPhase('wrong')
      setTimeout(() => {
        setPhase('idle')
        setPin(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }, 900)
    }
  }

  useEffect(() => {
    if (displayPin.length === 6 && pin.every(Boolean)) {
      // handled inline above
    }
  }, [displayPin, pin])

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <GardenBackground petalCount={18} />

      <motion.div
        className="relative z-20 flex flex-col items-center gap-8 px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        {/* Logo */}
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h1
            className="font-serif text-6xl md:text-7xl font-light tracking-widest mb-2"
            style={{ color: '#f2a8b8', textShadow: '0 0 40px rgba(242,168,184,0.4)' }}
          >
            Sakura
          </h1>
          <p className="font-sans text-sm tracking-[0.3em] uppercase" style={{ color: 'rgba(201,191,232,0.7)' }}>
            Where I Found My Spring
          </p>
        </motion.div>

        {/* Sapling / Tree */}
        <motion.div
          className="relative"
          animate={phase === 'blooming' ? { scale: [1, 1.15, 1.05], filter: ['brightness(1)', 'brightness(1.8)', 'brightness(1.3)'] } : {}}
          transition={{ duration: 2.5, ease: 'easeInOut' }}
        >
          <SaplingIcon phase={phase} />
        </motion.div>

        {/* Prompt */}
        <AnimatePresence mode="wait">
          {phase !== 'blooming' && phase !== 'entered' && (
            <motion.p
              key="prompt"
              className="font-sans text-sm tracking-wider text-center"
              style={{ color: 'rgba(240,238,252,0.6)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              Enter the day our story began
            </motion.p>
          )}
          {phase === 'blooming' && (
            <motion.p
              key="blooming"
              className="font-serif text-lg text-center"
              style={{ color: '#f2a8b8' }}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            >
              Welcome home ✦
            </motion.p>
          )}
        </AnimatePresence>

        {/* PIN Input */}
        <AnimatePresence>
          {phase !== 'blooming' && phase !== 'entered' && (
            <motion.div
              key="pin"
              className="flex gap-3"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.5 }}
            >
              {pin.map((digit, i) => (
                <motion.input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  className="pin-digit"
                  animate={phase === 'wrong' ? { x: [-6, 6, -4, 4, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  onChange={(e) => handleKey(i, e.target.value)}
                  onKeyDown={(e) => handleBackspace(i, e)}
                  autoFocus={i === 0}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {phase === 'wrong' && (
          <motion.p
            className="text-xs font-sans"
            style={{ color: 'rgba(242,168,184,0.7)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            That doesn&apos;t seem right...
          </motion.p>
        )}
      </motion.div>

      {/* Burst petals on bloom */}
      {phase === 'blooming' && <SakuraPetals count={60} />}
    </div>
  )
}

function SaplingIcon({ phase }: { phase: Phase }) {
  const bloomed = phase === 'blooming' || phase === 'entered'
  return (
    <motion.svg
      width="100" height="130"
      viewBox="0 0 100 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ground */}
      <ellipse cx="50" cy="118" rx="20" ry="5" fill="rgba(242,168,184,0.15)" />
      {/* Trunk */}
      <path d="M46 118 Q44 95 48 75 Q50 60 50 50" stroke="#6b3a21" strokeWidth="4" strokeLinecap="round" />
      {/* Branches */}
      <motion.path
        d="M48 80 Q38 70 28 65"
        stroke="#6b3a21" strokeWidth="2.5" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2, duration: 0.8 }}
      />
      <motion.path
        d="M49 70 Q60 58 72 52"
        stroke="#6b3a21" strokeWidth="2" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.8 }}
      />
      <motion.path
        d="M50 50 Q42 38 35 30"
        stroke="#6b3a21" strokeWidth="1.5" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.8 }}
      />
      <motion.path
        d="M50 50 Q60 40 68 32"
        stroke="#6b3a21" strokeWidth="1.5" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 0.8 }}
      />

      {/* Blossoms — appear on bloom */}
      {[
        { cx: 26, cy: 63, r: 7 },
        { cx: 73, cy: 50, r: 6 },
        { cx: 34, cy: 28, r: 6 },
        { cx: 69, cy: 30, r: 7 },
        { cx: 50, cy: 22, r: 8 },
        { cx: 55, cy: 42, r: 5 },
        { cx: 43, cy: 45, r: 5 },
      ].map((b, i) => (
        <motion.g key={i}>
          {[0, 1, 2, 3, 4].map((j) => {
            const a = (j / 5) * Math.PI * 2
            return (
              <motion.ellipse
                key={j}
                cx={b.cx + Math.cos(a) * b.r * 0.65}
                cy={b.cy + Math.sin(a) * b.r * 0.65}
                rx={b.r * 0.55}
                ry={b.r * 0.32}
                transform={`rotate(${(a * 180) / Math.PI} ${b.cx + Math.cos(a) * b.r * 0.65} ${b.cy + Math.sin(a) * b.r * 0.65})`}
                fill={bloomed ? `rgba(242,168,184,0.9)` : 'rgba(242,168,184,0.3)'}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: bloomed ? 1 : 0.4, opacity: bloomed ? 1 : 0.3 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: 'backOut' }}
              />
            )
          })}
          <motion.circle
            cx={b.cx} cy={b.cy} r={b.r * 0.2}
            fill={bloomed ? '#fff0f3' : 'rgba(255,255,255,0.3)'}
            animate={{ scale: bloomed ? 1 : 0.5 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          />
        </motion.g>
      ))}

      {/* Glow ring on bloom */}
      {bloomed && (
        <motion.circle
          cx="50" cy="50" r="40"
          fill="none"
          stroke="rgba(242,168,184,0.3)"
          strokeWidth="1"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      )}
    </motion.svg>
  )
}
