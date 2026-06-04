'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import EntryScreen from '@/components/auth/EntryScreen'

export default function RootPage() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated)
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/home')
    }
  }, [isAuthenticated, router])

  if (isAuthenticated) return null
  return <EntryScreen />
}
