'use client'
import { motion } from 'framer-motion'
import AppShell from '@/components/layout/AppShell'
import SakuraTree from '@/components/ui/SakuraTree'
import { useAppStore } from '@/store/useAppStore'
import { getRelationshipDays, formatDate } from '@/lib/utils'
import { Sparkles, Calendar, Heart, Shuffle } from 'lucide-react'

export default function HomePage() {
  const { blossomCount, relationshipStartDate } = useAppStore()
  const startDate = new Date(relationshipStartDate)
  const days = getRelationshipDays(startDate)

  const today = new Date()
  const isAnniversary =
    today.getMonth() === startDate.getMonth() &&
    today.getDate() === startDate.getDate()

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-serif text-3xl sm:text-4xl font-light" style={{ color: '#f2a8b8' }}>
            Our Garden
          </h1>
          <p className="font-sans text-sm mt-1" style={{ color: 'rgba(201,191,232,0.6)' }}>
            {formatDate(startDate)} · {days} days of spring
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Tree — center hero */}
          <motion.div
            className="lg:col-span-2 glass rounded-3xl p-8 flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <SakuraTree blossomCount={blossomCount} glowing={isAnniversary} size="full" />
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles size={14} style={{ color: '#f2a8b8' }} />
                <span className="font-sans text-xs tracking-widest uppercase" style={{ color: 'rgba(242,168,184,0.7)' }}>
                  {blossomCount} blossoms
                </span>
              </div>
              <p className="font-serif text-sm italic" style={{ color: 'rgba(240,238,252,0.5)' }}>
                Every memory, a new bloom
              </p>
            </div>
          </motion.div>

          {/* Stats sidebar */}
          <div className="flex flex-col gap-4">
            <StatsCard
              icon={<Calendar size={18} />}
              label="Days Together"
              value={days.toLocaleString()}
              sub={`Since ${formatDate(startDate)}`}
              delay={0.2}
            />
            <StatsCard
              icon={<Heart size={18} />}
              label="Blossoms Grown"
              value={blossomCount.toString()}
              sub="Memories on the tree"
              delay={0.3}
              color="#f2a8b8"
            />
            <StatsCard
              icon={<Sparkles size={18} />}
              label="On This Day"
              value="✦"
              sub="No memories yet for today"
              delay={0.4}
            />
            <StatsCard
              icon={<Shuffle size={18} />}
              label="Random Memory"
              value="✦"
              sub="Add memories to unlock"
              delay={0.5}
            />
          </div>
        </div>

        {/* Quick links */}
        <motion.div
          className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {[
            { label: 'Add a Memory', href: '/memories', emoji: '🌸' },
            { label: 'Write a Letter', href: '/letters', emoji: '✉️' },
            { label: 'Add a Song', href: '/soundtrack', emoji: '🎵' },
            { label: 'Make a Wish', href: '/wishes', emoji: '⭐' },
          ].map(({ label, href, emoji }) => (
            <a key={href} href={href}>
              <motion.div
                className="glass rounded-2xl p-4 text-center cursor-pointer"
                whileHover={{ scale: 1.03, background: 'rgba(242,168,184,0.08)' }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="text-2xl mb-2">{emoji}</div>
                <p className="font-sans text-xs" style={{ color: 'rgba(240,238,252,0.7)' }}>{label}</p>
              </motion.div>
            </a>
          ))}
        </motion.div>
      </div>
    </AppShell>
  )
}

function StatsCard({
  icon, label, value, sub, delay, color
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  delay: number
  color?: string
}) {
  return (
    <motion.div
      className="glass rounded-2xl p-5"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex items-center gap-2 mb-3" style={{ color: color || 'rgba(201,191,232,0.7)' }}>
        {icon}
        <span className="font-sans text-xs tracking-wider uppercase">{label}</span>
      </div>
      <div className="font-serif text-3xl font-light mb-1" style={{ color: color || '#f0eefc' }}>
        {value}
      </div>
      <p className="font-sans text-xs" style={{ color: 'rgba(240,238,252,0.4)' }}>{sub}</p>
    </motion.div>
  )
}
