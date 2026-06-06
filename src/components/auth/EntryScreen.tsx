'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import GardenBg from '@/components/world/GardenBg'

const CORRECT_PIN = process.env.NEXT_PUBLIC_SAKURA_PIN ?? ''

type Phase = 'idle' | 'wrong' | 'blooming' | 'entered'

export default function EntryScreen() {
  const [pin, setPin] = useState(['', '', '', '', '', ''])
  const [phase, setPhase] = useState<Phase>('idle')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const setAuthenticated = useAppStore((s) => s.setAuthenticated)

  const handleKey = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...pin]
    next[idx] = val.slice(-1)
    setPin(next)
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus()
    if (val && idx === 5) checkPin(next.join(''))
  }

  const handleBackspace = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[idx] && idx > 0) inputRefs.current[idx - 1]?.focus()
  }

  const checkPin = (full: string) => {
    if (full === CORRECT_PIN) {
      setPhase('blooming')
      setTimeout(() => {
        setPhase('entered')
        setTimeout(() => setAuthenticated(true), 1400)
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

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <GardenBg />
      {/* Animated star + petal canvas */}
      <EntryCanvas phase={phase} />

      <motion.div
        className="relative z-20 flex flex-col items-center gap-8 px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        {/* Logo */}
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <h1 className="font-serif font-light tracking-widest mb-2"
            style={{ fontSize: 'clamp(48px,8vw,80px)', color: '#f2a8b8', textShadow: '0 0 50px rgba(242,168,184,0.45)' }}>
            Sakura
          </h1>
          <p className="font-sans text-sm tracking-[0.35em] uppercase"
            style={{ color: 'rgba(201,191,232,0.65)' }}>
            Where I Found My Spring
          </p>
        </motion.div>

        {/* Sapling */}
        <motion.div
          animate={phase === 'blooming' ? { scale: [1, 1.15, 1.05], filter: ['brightness(1)', 'brightness(2)', 'brightness(1.3)'] } : {}}
          transition={{ duration: 2.5, ease: 'easeInOut' }}
        >
          <SaplingIcon phase={phase} />
        </motion.div>

        {/* Prompt + PIN */}
        <AnimatePresence mode="wait">
          {phase !== 'blooming' && phase !== 'entered' && (
            <motion.div key="pin-block" className="flex flex-col items-center gap-4"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.5 }}>
              <p className="font-sans text-sm tracking-wider text-center"
                style={{ color: 'rgba(240,238,252,0.55)' }}>
                Enter the day our story began
              </p>
              <div className="flex gap-3">
                {pin.map((digit, i) => (
                  <motion.input key={i}
                    ref={(el) => { inputRefs.current[i] = el }}
                    type="password" inputMode="numeric" maxLength={1} value={digit}
                    className="pin-digit"
                    animate={phase === 'wrong' ? { x: [-8, 8, -5, 5, 0] } : {}}
                    transition={{ duration: 0.35 }}
                    onChange={(e) => handleKey(i, e.target.value)}
                    onKeyDown={(e) => handleBackspace(i, e)}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              {phase === 'wrong' && (
                <motion.p className="font-sans text-xs" style={{ color: 'rgba(242,168,184,0.65)' }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  That doesn&apos;t seem right...
                </motion.p>
              )}
            </motion.div>
          )}
          {phase === 'blooming' && (
            <motion.p key="blooming" className="font-serif text-xl text-center"
              style={{ color: '#f2a8b8', textShadow: '0 0 30px rgba(242,168,184,0.5)' }}
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              Welcome home ✦
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// ─── Canvas: stars + drifting petals + bloom burst ───────────────────────────
function EntryCanvas({ phase }: { phase: Phase }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef(0)
  const tRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let W = window.innerWidth, H = window.innerHeight

    const resize = () => { W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H }
    resize()
    window.addEventListener('resize', resize)

    // Stars
    const stars = Array.from({ length: 100 }, () => ({
      x: Math.random() * W, y: Math.random() * H * 0.6,
      r: 0.4 + Math.random() * 1.4, base: 0.15 + Math.random() * 0.6,
      sp: 0.4 + Math.random() * 1.8, off: Math.random() * Math.PI * 2,
    }))
    // Petals
    interface P { x: number; y: number; vx: number; vy: number; r: number; rot: number; vr: number; a: number; h: number }
    const petals: P[] = []
    const mkPetal = (): P => ({ x: Math.random() * W, y: -20, vx: -0.3 + Math.random() * 0.6, vy: 0.4 + Math.random() * 0.7, r: 3 + Math.random() * 5, rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.04, a: 0.4 + Math.random() * 0.45, h: 340 + Math.random() * 22 })
    for (let i = 0; i < 16; i++) { const p = mkPetal(); p.y = Math.random() * H; petals.push(p) }

    // Burst particles for bloom
    interface Burst { x: number; y: number; vx: number; vy: number; a: number; r: number }
    const burst: Burst[] = []

    const animate = () => {
      tRef.current++
      const t = tRef.current
      ctx.clearRect(0, 0, W, H)

      // Stars
      stars.forEach(s => {
        const b = s.base + s.base * 0.55 * Math.sin(t * 0.015 * s.sp + s.off)
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220,215,255,${b})`; ctx.fill()
      })

      // Petals
      if (Math.random() < 0.07) petals.push(mkPetal())
      if (petals.length > 30) petals.splice(0, petals.length - 30)
      petals.forEach((p, i) => {
        p.x += p.vx + Math.sin(t * 0.01 + i) * 0.2; p.y += p.vy; p.rot += p.vr
        if (p.y > H + 20) Object.assign(p, mkPetal())
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = p.a
        ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.45, 0, 0, Math.PI * 2)
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.r)
        g.addColorStop(0, `hsla(${p.h},75%,82%,1)`); g.addColorStop(1, `hsla(${p.h},60%,70%,0)`)
        ctx.fillStyle = g; ctx.fill(); ctx.restore()
      })

      // Bloom burst
      if (phase === 'blooming' && burst.length === 0) {
        for (let i = 0; i < 50; i++) {
          const a = (i / 50) * Math.PI * 2, sp = 1.5 + Math.random() * 4
          burst.push({ x: W / 2, y: H * 0.42, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, a: 0.8 + Math.random() * 0.2, r: 3 + Math.random() * 5 })
        }
      }
      burst.forEach((b, i) => {
        b.x += b.vx; b.y += b.vy; b.a -= 0.012; b.vy += 0.04
        if (b.a > 0) {
          ctx.beginPath(); ctx.ellipse(b.x, b.y, b.r, b.r * 0.45, b.vx, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(242,168,184,${b.a})`; ctx.fill()
        }
      })

      animRef.current = requestAnimationFrame(animate)
    }
    animate()
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize) }
  }, [phase])

  return <canvas ref={canvasRef} className="fixed inset-0 z-10 pointer-events-none" aria-hidden="true" />
}

// ─── Sapling SVG ─────────────────────────────────────────────────────────────
function SaplingIcon({ phase }: { phase: Phase }) {
  const bloomed = phase === 'blooming' || phase === 'entered'
  const blossoms = [
    { cx: 26, cy: 63, r: 7 }, { cx: 73, cy: 50, r: 6 }, { cx: 34, cy: 28, r: 6 },
    { cx: 69, cy: 30, r: 7 }, { cx: 50, cy: 22, r: 8 }, { cx: 55, cy: 42, r: 5 }, { cx: 43, cy: 45, r: 5 },
  ]
  return (
    <motion.svg width="100" height="130" viewBox="0 0 100 130" fill="none">
      <ellipse cx="50" cy="118" rx="20" ry="5" fill="rgba(242,168,184,0.12)" />
      <path d="M46 118 Q44 95 48 75 Q50 60 50 50" stroke="#6b3a21" strokeWidth="4" strokeLinecap="round" />
      {[
        { d: 'M48 80 Q38 70 28 65', w: 2.5, delay: 0.2 },
        { d: 'M49 70 Q60 58 72 52', w: 2, delay: 0.4 },
        { d: 'M50 50 Q42 38 35 30', w: 1.5, delay: 0.5 },
        { d: 'M50 50 Q60 40 68 32', w: 1.5, delay: 0.6 },
      ].map(({ d, w, delay }) => (
        <motion.path key={d} d={d} stroke="#6b3a21" strokeWidth={w} strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay, duration: 0.8 }} />
      ))}
      {blossoms.map((b, i) => (
        <motion.g key={i}>
          {[0, 1, 2, 3, 4].map((j) => {
            const a = (j / 5) * Math.PI * 2
            return (
              <motion.ellipse key={j}
                cx={b.cx + Math.cos(a) * b.r * 0.65} cy={b.cy + Math.sin(a) * b.r * 0.65}
                rx={b.r * 0.55} ry={b.r * 0.32}
                transform={`rotate(${(a * 180) / Math.PI} ${b.cx + Math.cos(a) * b.r * 0.65} ${b.cy + Math.sin(a) * b.r * 0.65})`}
                fill={bloomed ? 'rgba(242,168,184,0.9)' : 'rgba(242,168,184,0.25)'}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: bloomed ? 1 : 0.3, opacity: bloomed ? 1 : 0.25 }}
                transition={{ delay: i * 0.07, duration: 0.5, ease: 'backOut' }}
              />
            )
          })}
          <motion.circle cx={b.cx} cy={b.cy} r={b.r * 0.2}
            fill={bloomed ? '#fff0f3' : 'rgba(255,255,255,0.2)'}
            animate={{ scale: bloomed ? 1 : 0.4 }} transition={{ delay: i * 0.07 }} />
        </motion.g>
      ))}
      {bloomed && (
        <motion.circle cx="50" cy="50" r="40" fill="none" stroke="rgba(242,168,184,0.4)" strokeWidth="1"
          initial={{ scale: 0.5, opacity: 1 }} animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 1.8, ease: 'easeOut' }} />
      )}
    </motion.svg>
  )
}
