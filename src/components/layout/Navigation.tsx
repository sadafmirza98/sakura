'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Home, BookOpen, Archive, Music, Feather, MessageCircle, Mail,
  Star, MapPin, Tv, Image, Heart, Moon, Menu, X,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/home',       label: 'Garden',        icon: Home },
  { href: '/story',      label: 'Our Story',      icon: BookOpen },
  { href: '/memories',   label: 'Memory Vault',   icon: Archive },
  { href: '/soundtrack', label: 'Soundtrack',     icon: Music },
  { href: '/petals',     label: 'Petals',         icon: Feather },
  { href: '/leaves',     label: 'Whispers',       icon: MessageCircle },
  { href: '/letters',    label: 'Sealed Petals',  icon: Mail },
  { href: '/wishes',     label: 'Spring Wishes',  icon: Star },
  { href: '/footprints', label: 'Footprints',     icon: MapPin },
  { href: '/evenings',   label: 'Evenings',       icon: Tv },
  { href: '/dreams',     label: 'Shared Dreams',  icon: Image },
  { href: '/comfort',    label: 'Comfort Space',  icon: Heart },
]

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  return (
    <div className="flex flex-col h-full py-6 px-3">
      {/* Logo */}
      <div className="mb-8 px-2 flex items-center justify-between">
        <Link href="/home" onClick={onClose}>
          <div>
            <h1
              className="font-serif text-2xl font-light tracking-wider"
              style={{ color: '#f2a8b8', textShadow: '0 0 24px rgba(242,168,184,0.4)' }}
            >
              Sakura
            </h1>
            <p className="text-xs tracking-widest mt-0.5" style={{ color: 'rgba(201,191,232,0.45)' }}>
              ✦ our garden
            </p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} onClick={onClose}>
              <motion.div
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-sans',
                  active ? 'text-white' : 'text-white/40 hover:text-white/65',
                )}
                style={
                  active
                    ? { background: 'rgba(242,168,184,0.1)', borderLeft: '2px solid rgba(242,168,184,0.55)' }
                    : {}
                }
                whileHover={{ x: 2 }}
                transition={{ duration: 0.12 }}
              >
                <Icon size={15} strokeWidth={active ? 2 : 1.5} />
                <span className="font-light">{label}</span>
              </motion.div>
            </Link>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 px-2 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(201,191,232,0.35)' }}>
          <Moon size={11} />
          <span className="font-sans">eternal spring</span>
        </div>
      </div>
    </div>
  )
}

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <nav
        className="hidden md:flex fixed left-0 top-0 bottom-0 z-30 flex-col glass"
        style={{ width: 220, borderRight: '1px solid rgba(255,255,255,0.055)' }}
      >
        <NavContent />
      </nav>

      {/* ── Mobile top bar ── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-4 glass"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Link href="/home">
          <span
            className="font-serif text-xl font-light tracking-wider"
            style={{ color: '#f2a8b8', textShadow: '0 0 20px rgba(242,168,184,0.35)' }}
          >
            Sakura
          </span>
        </Link>
        <motion.button
          className="p-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(240,238,252,0.7)' }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={20} />
        </motion.button>
      </div>

      {/* ── Mobile drawer overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 z-50"
              style={{ background: 'rgba(6,9,26,0.7)', backdropFilter: 'blur(6px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="md:hidden fixed left-0 top-0 bottom-0 z-50 glass-strong"
              style={{ width: 260, borderRight: '1px solid rgba(255,255,255,0.08)' }}
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              <NavContent onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
