'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  isAuthenticated: boolean
  blossomCount: number
  relationshipStartDate: string

  setAuthenticated: (val: boolean) => void
  addBlossoms: (n: number) => void
  setRelationshipStartDate: (d: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      blossomCount: 0,
      relationshipStartDate: '2020-12-06',

      setAuthenticated: (val) => set({ isAuthenticated: val }),
      addBlossoms: (n) => set((s) => ({ blossomCount: s.blossomCount + n })),
      setRelationshipStartDate: (d) => set({ relationshipStartDate: d }),
    }),
    {
      name: 'sakura-world-v4',
      partialize: (s) => ({
        isAuthenticated: s.isAuthenticated,
        blossomCount: s.blossomCount,
        relationshipStartDate: s.relationshipStartDate,
      }),
    }
  )
)
