'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CreateType =
  | 'memory' | 'song' | 'poem' | 'whisper' | 'wish' | 'place' | 'letter' | 'milestone'

export type RightPanelType =
  | null
  | 'create'
  | 'memory'
  | 'song'
  | 'poem'
  | 'whisper'
  | 'letter'
  | 'wish'
  | 'place'
  | 'evening'
  | 'dream'
  | 'comfort'
  | 'story'

/** Shape of the hover tooltip data. x/y are screen coordinates. */
export interface HoverTarget {
  x: number
  y: number
  label: string
  sublabel: string
}

type SceneMode =
  | 'garden'
  | 'blossom'
  | 'lantern'
  | 'petal'
  | 'leaf'
  | 'crane'
  | 'constellation'
  | 'pavilion'

interface UIState {
  /** Which content type is open in the right panel, or null if closed. */
  rightPanel: RightPanelType
  /** Arbitrary context data passed when opening the panel (e.g. { id, subtitle }). */
  rightPanelContext: Record<string, unknown> | null
  /** ID of the item currently displayed in the right panel. */
  selectedItemId: string | null
  /** Canvas hover target for HoverTooltip. */
  hoverTarget: HoverTarget | null
  /** The content type being created (only relevant when rightPanel === 'create'). */
  createType: CreateType | null
  /**
   * Whether the discovery prompts have been dismissed.
   * Persisted to localStorage via Zustand persist + partialize.
   */
  discoveryDone: boolean
  /** Scene mode — drives WorldCanvas and back-button visibility. */
  sceneMode: SceneMode
  /** Error message surfaced as a toast. Null when no error is shown. */
  errorMessage: string | null
  /** Whether the bloom ring navigation is open (triggered by clicking the book). */
  bloomOpen: boolean
  /** Whether the radial create selector is open (Add To Our Story). */
  createSelectorOpen: boolean
  /** Whether the fate thread timeline is open (triggered by clicking the board). */
  timelineOpen: boolean
  /** Whether the board is being hovered — drives BoardAmbient chalk-text + lantern effects. */
  boardHovered: boolean

  openRightPanel: (type: RightPanelType, context?: Record<string, unknown>) => void
  closeRightPanel: () => void
  openCreate: (type: CreateType) => void
  closeCreate: () => void
  setHover: (target: HoverTarget | null) => void
  dismissDiscovery: () => void
  enterScene: (mode: SceneMode) => void
  returnToGarden: () => void
  setError: (message: string) => void
  clearError: () => void
  openBloom: () => void
  closeBloom: () => void
  toggleBloom: () => void
  openCreateSelector: () => void
  closeCreateSelector: () => void
  openTimeline: () => void
  closeTimeline: () => void
  setBoardHovered: (v: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      rightPanel: null,
      rightPanelContext: null,
      selectedItemId: null,
      hoverTarget: null,
      createType: null,
      discoveryDone: false,
      sceneMode: 'garden',
      errorMessage: null,
      bloomOpen: false,
      createSelectorOpen: false,
      timelineOpen: false,
      boardHovered: false,

      openRightPanel: (type, context = {}) =>
        set({
          rightPanel: type,
          rightPanelContext: context,
          createType: null,
          selectedItemId: (context?.id as string) ?? null,
          bloomOpen: false,
          createSelectorOpen: false,
        }),
      closeRightPanel: () =>
        set({ rightPanel: null, rightPanelContext: null, selectedItemId: null }),
      openCreate: (type) =>
        set({ createType: type, rightPanel: 'create', sceneMode: 'blossom', bloomOpen: false, createSelectorOpen: false }),
      closeCreate: () =>
        set({ createType: null, rightPanel: null, sceneMode: 'garden' }),
      setHover: (target) => set({ hoverTarget: target }),
      dismissDiscovery: () => set({ discoveryDone: true }),
      enterScene: (mode) => set({ sceneMode: mode }),
      returnToGarden: () =>
        set({ sceneMode: 'garden', createType: null, rightPanel: null, bloomOpen: false }),
      setError: (message) => set({ errorMessage: message }),
      clearError: () => set({ errorMessage: null }),
      openBloom: () => set({ bloomOpen: true }),
      closeBloom: () => set({ bloomOpen: false, createSelectorOpen: false }),
      toggleBloom: () => set((s) => ({ bloomOpen: !s.bloomOpen, createSelectorOpen: false, rightPanel: s.bloomOpen ? s.rightPanel : null })),
      openCreateSelector: () => set({ createSelectorOpen: true }),
      closeCreateSelector: () => set({ createSelectorOpen: false }),
      openTimeline: () => set({ timelineOpen: true, bloomOpen: false }),
      closeTimeline: () => set({ timelineOpen: false }),
      setBoardHovered: (v) => set({ boardHovered: v }),
    }),
    {
      name: 'sakura-ui-v1',
      partialize: (s) => ({ discoveryDone: s.discoveryDone }),
    }
  )
)
