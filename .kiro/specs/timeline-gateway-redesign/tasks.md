# Tasks — Timeline Gateway Redesign

## Task 1: Fix icon system — correct PNG asset mapping across the app
- [x] 1.1 In `src/components/world/BookInteraction.tsx`, update `RING_ITEMS` asset paths: poem→`letter.png`, wish→`lantern.png`, place→`map.png`, memory→`memories.png`, letter→`letter.png`
- [x] 1.2 In `src/components/world/RightPanel.tsx`, update `ICONS` constant and `PANEL_CFG`/`CREATE_CFG` entries: memory→`memories.png`, song→`petal.png`, poem→`letter.png`, wish→`lantern.png`, place→`map.png`, letter→`letter.png`
- [x] 1.3 In `src/components/forms/shared.tsx`, rename `SaveButton` prop `emoji→icon`, render as 16×16 `<img>`; add `icon?` to `SuccessState`, replace `✨` with PNG
- [x] 1.4 Replace emoji header icons in all creation forms with correct PNGs; update `icon` prop on `SaveButton`
- [x] 1.5 In `src/components/world/WorldCanvas.tsx`, strip emoji prefixes from all hitRegion `label` strings
- [x] 1.6 Replace emoji in panel EmptyState/icon components: MemoryPanel→`memories.png`, SongPanel→`petal.png`, WishPanel→`lantern.png`, PlacePanel→`map.png`

## Task 2: Fix board hitbox alignment and add `boardHovered` state
- [x] 2.1 In `src/store/useUIStore.ts`, add `boardHovered: boolean` + `setBoardHovered`
- [x] 2.2 In `src/components/world/FateThread.tsx`, update board constants to `left: 95%`, `top: 72%`
- [x] 2.3 Add `border: '2px solid red'` debug border to `BoardHitZone` outer div
- [x] 2.4 `BoardHitZone` calls `setBoardHovered` on mouse enter/leave

## Task 3: Fix board idle notes, hover chalk-text transition, and lantern brightening
- [x] 3.1 `BoardAmbient` rotates through `IDLE_NOTES = ['06 Dec 2020', 'First Conversation', 'Engagement']` round-robin
- [x] 3.2 Two-step chalk text crossfade: "Dreams we're building" (idle) → "Our Story So Far" (hover)
- [x] 3.3 Lantern brightening overlay fades in on `boardHovered`

## Task 4: Fix cinematic click sequence — expand phase machine and add 3D board swing
- [x] 4.1 Phase type extended to `'idle' | 'darkening' | 'zoom' | 'particles' | 'thread'`
- [x] 4.2 Phase sequence: darkening@0ms → zoom@300ms → particles@800ms → thread@1400ms
- [x] 4.3 Board zoom div wrapped in perspective container; `rotateY` added for 3D swing
- [x] 4.4 Particle emission origin updated to `W*0.95 / H*0.72`

## Task 5: Add MemorySpool component to the timeline
- [x] 5.1 `MemorySpool` SVG component rendered when `phase === 'thread' && !creatingMemory`
- [x] 5.2 Concentric SVG circles with breathing glow animation
- [x] 5.3 Hover shows "Weave New Memory" label + drifting particles
- [x] 5.4 Click animates spool away then sets `creatingMemory: true`

## Task 6: Create BlankNoteEditor component
- [x] 6.1 Parchment-paper `position: fixed` overlay at z-index 48 with ruled lines and paper fold
- [x] 6.2 Nine fields: Title, Date (SakuraCalendar), Story, Photos placeholder, Voice Note placeholder, Tags, Related Song, Related Place, Milestone Toggle
- [x] 6.3 Save calls `useContentStore().add('memories', payload)` with `isMilestone` field
- [x] 6.4 Entry/exit Framer Motion animation with rotateX perspective
- [x] 6.5 Rendered inside `FateThreadOverlay` via `AnimatePresence` when `creatingMemory === true`

## Task 7: Fix MemoryDetail and milestone rendering
- [x] 7.1 `MemoryDetail` uses `memories.png` icon (implicitly via panel consistency)
- [x] 7.2 Milestone marker `✦` replaced with SVG `<image href="/assets/ui/memories.png">`
- [x] 7.3 SVG ribbon added across top of milestone note backgrounds
- [x] 7.4 `isMilestone()` checks `mem.isMilestone === true`; excludes `type === 'timeline-event'`

## Task 8: Add save animation — thread pulse after memory creation
- [x] 8.1 `threadPulsing` state in `FateThreadOverlay`
- [x] 8.2 `handleMemorySaved` sets `threadPulsing: true`, resets after 1200ms
- [x] 8.3 Thread path `animate.filter` pulses gold/pink when `threadPulsing`

## Task 9: Add automatic timeline events for Songs, Places, and Letters
- [x] 9.1 `createTimelineEvent(sourceType, sourceId, title, date?)` added to `useContentStore`
- [x] 9.2 `CreateSongForm` calls `createTimelineEvent` after save
- [x] 9.3 `CreatePlaceForm` calls `createTimelineEvent` after save
- [x] 9.4 `CreateLetterForm` calls `createTimelineEvent` after save

## Task 10: Remove debug border after visual alignment is confirmed
- [ ] 10.1 Verify red debug border visually matches the wooden board at 1280×800, 1440×900, 1920×1080
- [ ] 10.2 Remove `border: '2px solid red'` from `BoardHitZone` in `FateThread.tsx`
