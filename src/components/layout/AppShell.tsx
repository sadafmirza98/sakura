'use client'
import { ReactNode } from 'react'
import Navigation from './Navigation'
import GardenBackground from '@/components/ui/GardenBackground'
import { motion } from 'framer-motion'

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <GardenBackground petalCount={14} />
      <Navigation />
      <motion.main
        className="relative z-20 min-h-screen"
        style={{
          // Desktop: sidebar offset. Mobile: top bar offset only
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45 }}
      >
        {/* Desktop layout */}
        <div
          className="hidden md:block min-h-screen"
          style={{ marginLeft: 220, padding: '36px 44px' }}
        >
          {children}
        </div>
        {/* Mobile layout */}
        <div
          className="md:hidden min-h-screen"
          style={{ paddingTop: 72, padding: '72px 18px 32px' }}
        >
          {children}
        </div>
      </motion.main>
    </div>
  )
}
