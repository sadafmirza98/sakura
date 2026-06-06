'use client'
import { create } from 'zustand'
import { collection, onSnapshot, addDoc, deleteDoc, doc, type Unsubscribe } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useUIStore } from '@/store/useUIStore'

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

export const useContentStore = create<ContentState>()((set) => ({
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
   * Writes a new document to Firestore and optimistically appends it to the
   * local array. Returns the new document's id.
   */
  add: async (type, data) => {
    const countKey: CountKey = `${type}Count`
    const now = new Date().toISOString()
    const payload = { ...data, createdAt: now }

    try {
      const docRef = await addDoc(collection(db, type), payload)
      const newItem: ContentItem = { id: docRef.id, ...payload }
      set((state) => ({
        [type]: [...(state[type] as ContentItem[]), newItem],
        [countKey]: (state[type] as ContentItem[]).length + 1,
      } as unknown as Partial<ContentState>))
      return docRef.id
    } catch (error) {
      console.error(`[ContentStore] Failed to add to ${type}:`, error)
      useUIStore.getState().setError(`Couldn't save to ${type} — please try again.`)
      throw error
    }
  },

  /**
   * Removes a document from Firestore and filters it from the local array.
   * Decrements the corresponding count.
   */
  delete: async (type, id) => {
    const countKey: CountKey = `${type}Count`
    try {
      await deleteDoc(doc(db, type, id))
      set((state) => {
        const filtered = (state[type] as ContentItem[]).filter((item) => item.id !== id)
        return {
          [type]: filtered,
          [countKey]: filtered.length,
        } as unknown as Partial<ContentState>
      })
    } catch (error) {
      console.error(`[ContentStore] Failed to delete ${id} from ${type}:`, error)
      useUIStore.getState().setError(`Couldn't delete from ${type} — please try again.`)
      throw error
    }
  },

  /**
   * Attaches onSnapshot listeners for all 9 Firestore collections.
   * Returns a cleanup function that unsubscribes all listeners.
   * Call once on authenticated mount.
   */
  initListeners: () => {
    const unsubscribers: Unsubscribe[] = []

    for (const name of COLLECTIONS) {
      const countKey: CountKey = `${name}Count`
      try {
        const unsub = onSnapshot(
          collection(db, name),
          (snapshot) => {
            const items: ContentItem[] = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            set({ [name]: items, [countKey]: items.length } as unknown as Partial<ContentState>)
          },
          (error) => {
            console.error(`[ContentStore] ${name} listener error:`, error)
            useUIStore.getState().setError(`Live sync failed for ${name} — check your connection.`)
          }
        )
        unsubscribers.push(unsub)
      } catch (error) {
        console.error(`[ContentStore] Failed to attach listener for ${name}:`, error)
        useUIStore.getState().setError(`Couldn't connect to ${name} — check your connection.`)
      }
    }

    // Return cleanup
    return () => {
      unsubscribers.forEach((unsub) => unsub())
    }
  },
}))
