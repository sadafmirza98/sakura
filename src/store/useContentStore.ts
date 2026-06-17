'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { collection, onSnapshot, addDoc, deleteDoc, doc, type Unsubscribe } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Generic record shape — each collection item must have at least an id
export interface ContentItem {
  id: string
  [key: string]: unknown
}

interface ContentState {
  // Arrays
  memories: ContentItem[]
  songs: ContentItem[]
  poems: ContentItem[]
  whispers: ContentItem[]
  letters: ContentItem[]
  wishes: ContentItem[]
  places: ContentItem[]
  evenings: ContentItem[]
  dreams: ContentItem[]

  // Counts (synced with array lengths but available synchronously)
  memoriesCount: number
  songsCount: number
  poemsCount: number
  whispersCount: number
  lettersCount: number
  wishesCount: number
  placesCount: number
  eveningsCount: number
  dreamsCount: number

  // Actions
  initListeners: () => () => void
  add: (type: CollectionName, data: Record<string, unknown>) => Promise<string>
  delete: (type: CollectionName, id: string) => Promise<void>
  createTimelineEvent: (sourceType: string, sourceId: string, title: string, date?: string) => Promise<string>
}

const COLLECTIONS = [
  'memories',
  'songs',
  'poems',
  'whispers',
  'letters',
  'wishes',
  'places',
  'evenings',
  'dreams',
] as const

type CollectionName = typeof COLLECTIONS[number]
type CountKey = `${CollectionName}Count`

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      // Initial empty arrays
      memories: [],
      songs: [],
      poems: [],
      whispers: [],
      letters: [],
      wishes: [],
      places: [],
      evenings: [],
      dreams: [],

      // Initial zero counts
      memoriesCount: 0,
      songsCount: 0,
      poemsCount: 0,
      whispersCount: 0,
      lettersCount: 0,
      wishesCount: 0,
      placesCount: 0,
      eveningsCount: 0,
      dreamsCount: 0,

      /**
       * Saves a new item immediately to localStorage (via persist), then tries
       * to sync it to Firestore in the background. If Firestore is unavailable
       * the item stays saved locally and is visible across page refreshes.
       * Always returns a usable id.
       */
      add: async (type, data) => {
        const countKey: CountKey = `${type}Count`
        const now = new Date().toISOString()
        const payload: Record<string, unknown> = { ...data, createdAt: now }

        // Firestore's addDoc() rejects `undefined` field values — drop them
        for (const key of Object.keys(payload)) {
          if (payload[key] === undefined) delete payload[key]
        }

        // Assign a local id and commit to state/localStorage immediately
        const tempId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
        const newItem: ContentItem = { id: tempId, ...payload }
        set((state) => ({
          [type]: [...(state[type] as ContentItem[]), newItem],
          [countKey]: (state[type] as ContentItem[]).length + 1,
        } as unknown as Partial<ContentState>))

        // Attempt Firestore sync — swap the temp id for the real one if it succeeds
        try {
          const docRef = await addDoc(collection(db, type), payload)
          set((state) => ({
            [type]: (state[type] as ContentItem[]).map(
              (item) => item.id === tempId ? { ...item, id: docRef.id } : item
            ),
          } as unknown as Partial<ContentState>))
          return docRef.id
        } catch {
          console.warn(`[ContentStore] Firestore unavailable — ${type} item saved locally.`)
          return tempId
        }
      },

      /**
       * Removes an item from local state immediately, then attempts to delete it
       * from Firestore. Items with a local-only id (prefix "local_") skip the
       * Firestore call since they were never written there.
       */
      delete: async (type, id) => {
        const countKey: CountKey = `${type}Count`
        set((state) => {
          const filtered = (state[type] as ContentItem[]).filter((item) => item.id !== id)
          return {
            [type]: filtered,
            [countKey]: filtered.length,
          } as unknown as Partial<ContentState>
        })
        if (!id.startsWith('local_')) {
          try {
            await deleteDoc(doc(db, type, id))
          } catch {
            console.warn(`[ContentStore] Firestore delete failed for ${type}/${id}`)
          }
        }
      },

      /**
       * Attaches onSnapshot listeners for all 9 Firestore collections.
       * Returns a cleanup function that unsubscribes all listeners.
       * Call once on authenticated mount. When Firestore is unavailable the
       * error callback fires but local state is left untouched.
       */
      initListeners: () => {
        const unsubscribers: Unsubscribe[] = []

        for (const name of COLLECTIONS) {
          const countKey: CountKey = `${name}Count`
          try {
            const unsub = onSnapshot(
              collection(db, name),
              (snapshot) => {
                const items: ContentItem[] = snapshot.docs.map((d) => ({
                  id: d.id,
                  ...d.data(),
                }))
                set({ [name]: items, [countKey]: items.length } as unknown as Partial<ContentState>)
              },
              (error) => {
                console.warn(`[ContentStore] ${name} listener error (Firestore may not be provisioned):`, error.message)
              }
            )
            unsubscribers.push(unsub)
          } catch (error) {
            console.warn(`[ContentStore] Failed to attach listener for ${name}:`, error)
          }
        }

        return () => { unsubscribers.forEach((unsub) => unsub()) }
      },

      createTimelineEvent: async (sourceType, sourceId, title, date) => {
        return get().add('memories', {
          title,
          date: date ?? new Date().toISOString().split('T')[0],
          type: 'timeline-event',
          sourceType,
          sourceId,
        })
      },
    }),
    {
      name: 'sakura-content-v1',
      partialize: (s) => ({
        memories:      s.memories,
        songs:         s.songs,
        poems:         s.poems,
        whispers:      s.whispers,
        letters:       s.letters,
        wishes:        s.wishes,
        places:        s.places,
        evenings:      s.evenings,
        dreams:        s.dreams,
        memoriesCount: s.memoriesCount,
        songsCount:    s.songsCount,
        poemsCount:    s.poemsCount,
        whispersCount: s.whispersCount,
        lettersCount:  s.lettersCount,
        wishesCount:   s.wishesCount,
        placesCount:   s.placesCount,
        eveningsCount: s.eveningsCount,
        dreamsCount:   s.dreamsCount,
      }),
    }
  )
)
