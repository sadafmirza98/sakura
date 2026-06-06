'use client'
import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import GardenBg from '@/components/world/GardenBg'

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ overflow: 'auto' }}>
      <GardenBg />
      {/* Back to garden */}
      <motion.div className="fixed top-5 left-5 z-30" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Link href="/home">
          <motion.div className="flex items-center gap-2 glass-warm rounded-2xl px-4 py-2.5 cursor-pointer"
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <ArrowLeft size={14} style={{ color: '#f2a8b8' }} />
            <span className="font-sans text-xs" style={{ color: 'rgba(242,168,184,0.8)' }}>Return to Garden</span>
          </motion.div>
        </Link>
      </motion.div>
      <motion.main
        className="relative z-10 min-h-screen"
        style={{ padding: '80px 32px 60px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-4xl mx-auto">{children}</div>
      </motion.main>
    </div>
  )
}
