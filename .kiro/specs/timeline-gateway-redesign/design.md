# Technical Design — Timeline Gateway Redesign

## Overview

This document is the technical design for fixing the Timeline Gateway (the wooden board on the
far right of the hero artwork) and the application-wide icon inconsistency. Every decision is
grounded in the live codebase — component names, file paths, Zustand store actions, and animation
patterns all match what already exists.

---

## Bug Details

The defects span four areas:

**Area 1 — Board hitbox misalignment.**
`FateThread.tsx` positions `BoardHitZone` and `BoardAmbient` at `left: 88%` / `top: 62%`. The
painted wooden board in `sakura-bg.jpg` sits further right and lower. The interactive area does not
overlap the visible board.

**Area 2 — Board states lack the intended feel.**
- No chalk-text transition on hover ("Dreams we're building" → "Our Story So Far").
- The nearby lantern in the artwork does not brighten on hover.
- Idle notes cycle through one hard-coded string (`"06 Dec 2020"`) instead of rotating through a
  set of three notes.

**Area 3 — Board click opens a panel.**
`BoardHitZone` calls `openTimeline()` which sets `timelineOpen: true` in `useUIStore`. This part
is correct. But `FateThreadOverlay` skips the required cinematic sequence:
- No `'zoom'` phase exists — the board never swings forward in 3D.
- The `'darkening'` phase is implicit (backdrop opacity). No distinct board-zoom step.
- The chalk text dissolve fires immediately without waiting for the board to swing.
- No golden/pink thread particles emerge from the board before the fate thread draws.

**Area 4 — Timeline experience gaps.**
- `MemorySpool` does not exist — new memories on the timeline must be created via a `+` button.
- Memory creation opens the `RightPanel` (a side panel) instead of an in-place paper note.
- Milestone notes use a `✦` text/emoji character as a marker instead of the `memories.png` asset.
- No automatic timeline event is created when a Song, Place, or Letter is added.

**Area 5 — Icon system inconsistency.**
`BookInteraction.tsx` maps categories to wrong assets (Wishes → `wish-blossom.png`, Poems →
`sakura.png`, Memories → `sakura.png`, Places → `lantern.png`). `RightPanel.tsx`, all creation
forms, and all panel empty states use emoji characters (🌸, 🕯️, ✨, 📍, 🏮) instead of PNG assets.
`WorldCanvas.tsx` embeds emoji in hit-region label strings. The `SaveButton` and `SuccessState`
shared components accept an `emoji: string` prop instead of a PNG path.

---

## Expected Behavior

After the fix:

- The board hitbox perfectly overlaps the painted wooden board in the artwork.
- On hover, the board receives a warm golden glow; a soft gradient brightens the painted lantern
  nearby; the chalk text slowly transitions from "Dreams we're building" → "Our Story So Far" then
  fades back; the user feels invited to explore.
- Every 10 s (idle, timeline closed) one of three notes appears briefly and fades: "06 Dec 2020",
  "First Conversation", "Engagement".
- On click, the cinematic sequence plays (background darkens → board zooms and swings forward in 3D
  → chalk text dissolves into particles → golden/pink threads emerge from the board → threads weave
  → the fate thread and memory notes are revealed). No panel, sidebar, or modal opens.
- A glowing golden spool near the start of the thread is the only way to create a new memory from
  the timeline. Clicking it unravels the spool and opens a `BlankNoteEditor` (an in-place paper
  note, not a modal) on the timeline.
- Saving a memory from the `BlankNoteEditor` plays a paper-fold animation, attaches the note to the
  thread with a brief thread-glow pulse, and returns focus to the timeline.
- Milestone memories render with a larger note, a decorative SVG ribbon, and orbit particles.
- Adding a Song, Place, or Letter automatically creates a lightweight timeline event in the
  `memories` Firestore collection.
- Every category consistently uses its designated PNG: Memories→`memories.png`,
  Songs→`petal.png`, Places→`map.png`, Wishes→`lantern.png`, Poems→`letter.png`.
- No emojis appear as functional icons anywhere in the application.

---

## Hypothesized Root Cause

1. **Hitbox offset:** The four board-position constants (`BOARD_LEFT`, `BOARD_TOP`, `BOARD_W`,
   `BOARD_H`) in `FateThread.tsx` were set to approximate values (`88%`, `62%`) and never
   calibrated against the actual artwork pixel position. The artwork is `background-position: center 30%`
   which shifts the board from where a naive percentage would place it.

2. **Missing phases in phase machine:** `FateThreadOverlay` uses a three-value phase type
   (`'idle' | 'particles' | 'thread'`). The `'zoom'` intermediate step was never implemented —
   the board simply fades without a 3D swing. The `darkening` step is implicit in the backdrop
   opacity, not a named phase.

3. **No spool mechanic:** The spool / in-place paper note mechanic was never implemented.
   Creation is wired to `openCreate()` → `RightPanel`, which predates the timeline experience.

4. **No timeline event hook in content store:** `useContentStore.add()` writes to one collection
   and does nothing else. There is no post-add hook to cross-write a timeline event.

5. **Icon mapping was partially done:** `RING_ITEMS` in `BookInteraction.tsx` and `ICONS` in
   `RightPanel.tsx` were set up early in development with placeholder assets and never updated to
   match the final asset mapping specification.

---

## Fix Implementation

### Architecture decisions

- No new routes. Everything lives on the existing home page (`/home`).
- No new Zustand stores. One new field (`boardHovered`) is added to `useUIStore`.
- One new file: `src/components/world/BlankNoteEditor.tsx`.
- One new store helper: `createTimelineEvent` in `useContentStore`.
- All existing component identities preserved — `BoardAmbient`, `BoardHitZone`,
  `FateThreadOverlay`, `MemoryNote`, `MemoryDetail` keep their names and roles.

### Z-index layer map (unchanged)

| Layer | z-index | Owner |
|---|---|---|
| Hero background | 0 | `HeroBg` |
| World canvas | 10 | `WorldCanvas` |
| Board ambient / book ambient | 12 | `BoardAmbient`, `BookAmbient` |
| Board hit zone / book hit zone | 14 | `BoardHitZone`, `BookHitZone` |
| Bloom ring backdrop | 18 | `MemoryRing` |
| Book journey | 24 | `BookJourney` |
| Right panel backdrop | 34 | `home/page.tsx` |
| Right panel | 35 | `RightPanel` |
| Timeline backdrop | 40 | `FateThreadOverlay` |
| Timeline board zoom + particles | 41–43 | `FateThreadOverlay` |
| Timeline thread + notes | 43 | `FateThreadOverlay` |
| Blank note editor | 48 | `BlankNoteEditor` (inside `FateThreadOverlay`) |
| Memory detail | 54–55 | `MemoryDetail` (inside `FateThreadOverlay`) |

---

### Fix 1 — Hitbox alignment (`FateThread.tsx`)

Replace the four position constants:

```ts
// Before
const BOARD_LEFT = '88%'
const BOARD_TOP  = '62%'
const BOARD_W    = 180
const BOARD_H    = 340

// After — debug border retained until visual alignment confirmed
const BOARD_LEFT = '95%'
const BOARD_TOP  = '72%'
const BOARD_W    = 180
const BOARD_H    = 340
```

Add a temporary debug border to `BoardHitZone`'s outer `<div>`:

```tsx
style={{
  ...existing styles...
  border: '2px solid red',  // TEMP — remove after alignment confirmed
}}
```

Both `BoardAmbient` and `BoardHitZone` consume the same four constants so both move together.
Remove the border once the red outline visually coincides with the painted wooden board.

---

### Fix 2 — `boardHovered` state (`useUIStore.ts`)

Add to the `UIState` interface and `create` call:

```ts
boardHovered: boolean
setBoardHovered: (v: boolean) => void
```

Initial value: `false`.
`setBoardHovered` simply calls `set({ boardHovered: v })`.

`BoardHitZone` calls `setBoardHovered(true)` on `onMouseEnter` and `setBoardHovered(false)` on
`onMouseLeave`. `BoardAmbient` reads `boardHovered` from the store.

---

### Fix 3 — Board idle notes (`BoardAmbient` in `FateThread.tsx`)

Add a rotating note array and index ref:

```ts
const IDLE_NOTES = ['06 Dec 2020', 'First Conversation', 'Engagement']
const noteIndexRef = useRef(0)
```

In the `setInterval` tick:

```ts
const tick = () => {
  setNoteVisible(true)
  // current note is IDLE_NOTES[noteIndexRef.current]
  setTimeout(() => {
    setNoteVisible(false)
    noteIndexRef.current = (noteIndexRef.current + 1) % IDLE_NOTES.length
  }, 2200)
}
```

State becomes `noteText: string` (replaces the hard-coded string in the JSX).

---

### Fix 4 — Chalk-text hover transition (`BoardAmbient` in `FateThread.tsx`)

Replace the single static label with a two-step crossfade driven by `boardHovered`:

```tsx
{/* Step A — "Dreams we're building" (visible when not hovered, fades out on hover) */}
<AnimatePresence>
  {!boardHovered && !timelineOpen && (
    <motion.span
      key="chalk-a"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      style={{ ...chalkTextStyle }}
    >
      Dreams we&apos;re building
    </motion.span>
  )}
</AnimatePresence>

{/* Step B — "Our Story So Far" (fades in on hover, fades out when hover ends) */}
<AnimatePresence>
  {boardHovered && !timelineOpen && (
    <motion.span
      key="chalk-b"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{ ...chalkTextStyle, color: 'rgba(245,238,210,0.9)', textShadow: '0 0 20px rgba(232,201,122,0.8)' }}
    >
      Our Story So Far
    </motion.span>
  )}
</AnimatePresence>
```

`chalkTextStyle`:
```ts
{
  fontFamily: '"Playfair Display", Georgia, serif',
  fontStyle: 'italic',
  fontSize: 13,
  letterSpacing: '0.04em',
  color: 'rgba(245,238,210,0.6)',
  textShadow: '0 0 16px rgba(232,201,122,0.5)',
  whiteSpace: 'nowrap',
  display: 'block',
  textAlign: 'center',
  position: 'absolute' as const,
  top: '18%',
  left: '50%',
  transform: 'translateX(-50%)',
}
```

---

### Fix 5 — Lantern brightening (`BoardAmbient` in `FateThread.tsx`)

Add a `motion.div` that fades in a warm radial-gradient overlay targeting the painted lantern
location (approximately `left: -60px, top: -120px` relative to the board centre):

```tsx
<motion.div
  aria-hidden="true"
  animate={{ opacity: boardHovered && !timelineOpen ? 1 : 0 }}
  transition={{ duration: 0.5 }}
  style={{
    position: 'absolute',
    left: -60,
    top: -120,
    width: 80,
    height: 110,
    borderRadius: '50%',
    pointerEvents: 'none',
    background: 'radial-gradient(ellipse at 50% 60%, rgba(255,220,100,0.38) 0%, rgba(232,201,122,0.14) 55%, transparent 100%)',
  }}
/>
```

---

### Fix 6 — Phase machine expansion (`FateThreadOverlay` in `FateThread.tsx`)

Extend the phase type:

```ts
type Phase = 'idle' | 'darkening' | 'zoom' | 'particles' | 'thread'
```

Update `useEffect([timelineOpen])`:

```ts
if (timelineOpen) {
  setPhase('darkening')
  const t1 = setTimeout(() => setPhase('zoom'),      300)
  const t2 = setTimeout(() => setPhase('particles'), 800)
  const t3 = setTimeout(() => setPhase('thread'),   1400)
  return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
} else {
  setPhase('idle')
  setSelectedMem(null)
  setCreatingMemory(false)
}
```

---

### Fix 7 — 3D board swing (`FateThreadOverlay` in `FateThread.tsx`)

The `board-zoom` `motion.div` gains a `perspective` wrapper and a `rotateY` keyframe:

```tsx
{/* Outer perspective wrapper */}
<div style={{ perspective: 800, perspectiveOrigin: '50% 50%' }}>
  <motion.div
    key="board-zoom"
    style={{ transformStyle: 'preserve-3d' }}
    initial={{ opacity: 1, scale: 1, rotateY: 0, x: 0, y: 0 }}
    animate={
      phase === 'zoom'
        ? { opacity: 0.85, scale: 1.6, rotateY: 12, x: W * 0.06, y: -H * 0.04 }
        : phase === 'particles' || phase === 'thread'
        ? { opacity: 0,    scale: 2.2, rotateY: 20, x: W * 0.12, y: -H * 0.08 }
        : { opacity: 1,    scale: 1,   rotateY: 0,  x: 0,         y: 0 }
    }
    exit={{ opacity: 0 }}
    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    ...rest of existing props
  >
    {/* existing chalk text lines */}
  </motion.div>
</div>
```

The board origin for particle emission updates to use the new phase constant:
`boardX = W * 0.95`, `boardY = H * 0.72` (matching the new BOARD_LEFT/BOARD_TOP).

---

### Fix 8 — Memory spool (`FateThread.tsx`)

New `MemorySpool` component rendered inside the SVG at `phase === 'thread'` and
`!creatingMemory`:

```tsx
function MemorySpool({
  x, y, onWeave
}: { readonly x: number; readonly y: number; readonly onWeave: () => void }) {
  const [hov, setHov] = useState(false)
  const [unravelling, setUnravelling] = useState(false)

  const handleClick = () => {
    if (unravelling) return
    setUnravelling(true)
    setTimeout(onWeave, 550)
  }

  // SVG rendering:
  // - Outer circle: r=18, fill rgba(255,248,220,0.12), stroke rgba(232,201,122,0.7)
  // - Concentric ring 1: r=12, stroke rgba(242,168,184,0.55), strokeDasharray="4 3"
  // - Concentric ring 2: r=6, stroke rgba(232,201,122,0.8)
  // - Centre dot: r=3, fill rgba(232,201,122,0.95)
  // - "Weave New Memory" label: appears below spool on hover
  // - Particle emitters: 6 tiny circles that drift outward on hover

  return (
    <motion.g
      animate={{ scale: unravelling ? 0 : 1, opacity: unravelling ? 0 : 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 1, 1] }}
      style={{ cursor: 'pointer' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={handleClick}
      transform={`translate(${x}, ${y})`}
    >
      {/* ... spool SVG elements ... */}
      <AnimatePresence>
        {hov && (
          <motion.text
            y={28}
            textAnchor="middle"
            fill="rgba(232,201,122,0.85)"
            style={{ fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic', fontSize: 11 }}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 28 }}
            exit={{ opacity: 0 }}
          >
            Weave New Memory
          </motion.text>
        )}
      </AnimatePresence>
    </motion.g>
  )
}
```

Positioned at `x = nodePositions[0]?.x - 80` (before the first node), `y = nodePositions[0]?.y`.

---

### Fix 9 — BlankNoteEditor (`src/components/world/BlankNoteEditor.tsx`) — new file

This component is a `position: fixed` React overlay styled as a sheet of parchment paper.
It is not a modal — it has no backdrop, no close button in the chrome, and no panel header.
It floats in the timeline world.

```tsx
'use client'
// Props:
interface BlankNoteEditorProps {
  onSave: (id: string) => void   // called with new memory id after Firestore write
  onCancel: () => void
}
```

Visual treatment:
- Container: `position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 48`
- Width: `clamp(320px, 44vw, 520px)`, `maxHeight: 80vh`, `overflowY: auto`
- Background: `linear-gradient(165deg, rgba(255,250,235,0.96) 0%, rgba(250,244,220,0.98) 100%)`
- Border: `1px solid rgba(200,170,100,0.35)`
- BoxShadow: `0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(232,201,122,0.2)`
- BorderRadius: `6px` (paper corners, not pill)
- Faint ruled lines: `repeating-linear-gradient(transparent, transparent 27px, rgba(200,170,100,0.12) 27px, rgba(200,170,100,0.12) 28px)` as a background layer
- Paper fold in top-right corner: `::before` CSS pseudo-element or a small absolutely-positioned
  triangle div (triangle: `border-left: 20px solid rgba(200,170,100,0.3); border-bottom: 20px solid transparent`)
- All input text colour: `rgba(40,30,10,0.85)` (dark ink on parchment)
- All label text: `rgba(100,80,40,0.55)` uppercase 10px

Fields:
1. **Title** — `<input>` with parchment-adapted styling (no border, border-bottom only, transparent background)
2. **Date** — `<SakuraCalendar>` imported from `@/components/ui/SakuraCalendar`; adapt trigger button colours for parchment surface
3. **Story** — `<textarea>` styled to match the ruled lines
4. **Photos** — `<input type="file" accept="image/*">` hidden; trigger via a styled `<label>` reading "Attach a photo"
5. **Voice Note** — `<button>` reading "Record a voice note" (future placeholder, disabled gracefully)
6. **Tags** — `<input>` comma-separated
7. **Related Song** — `<select>` populated from `useContentStore().songs.map(s => ({ id: s.id, title: s.title }))`
8. **Related Place** — `<select>` populated from `useContentStore().places`
9. **Milestone Toggle** — `<input type="checkbox">` styled as a toggle pill

Save button: plain text "fold this memory into our story" — no emoji, no PNG icon here (the
action is the text itself). Calls `useContentStore().add('memories', payload)`.

Entry animation:
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.85, rotateX: -12 }}
  animate={{ opacity: 1, scale: 1,    rotateX: 0 }}
  exit={{   opacity: 0, scale: 0.75,  rotateX: 12, y: 20 }}
  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
  style={{ perspective: 600, ...containerStyles }}
>
```

---

### Fix 10 — Save animation (`FateThread.tsx` + `globals.css`)

After `BlankNoteEditor.onSave(id)` fires:

1. `setCreatingMemory(false)` → `BlankNoteEditor` unmounts (exit animation runs).
2. The new memory is already in `useContentStore().memories` via Firestore snapshot.
3. `MemoryNote` for the new id enters with its standard `initial={{ opacity: 0, scale: 0 }}` animation.
4. A brief thread-pulse effect is triggered by setting `threadPulsing: true` state in
   `FateThreadOverlay` for 1 200 ms. During this time the thread `<path>` receives:

```tsx
animate={{
  filter: threadPulsing
    ? [
        'drop-shadow(0 0 4px rgba(242,168,184,0.6))',
        'drop-shadow(0 0 20px rgba(232,201,122,1.0)) drop-shadow(0 0 40px rgba(242,168,184,0.7))',
        'drop-shadow(0 0 4px rgba(242,168,184,0.6))',
      ]
    : 'drop-shadow(0 0 3px rgba(242,168,184,0.3))',
  transition: { duration: 1.2, ease: 'easeInOut' },
}}
```

---

### Fix 11 — Milestone ribbon (`MemoryNote` in `FateThread.tsx`)

Add a decorative SVG ribbon to milestone notes. Rendered as two horizontal rect elements
across the top of the note background:

```svg
{milestone && (
  <>
    <rect
      x={-52} y={hangDir === -1 ? -54 : 0}
      width={104} height={8}
      rx={2}
      fill="rgba(232,201,122,0.35)"
    />
    <rect
      x={-52} y={hangDir === -1 ? -48 : 6}
      width={104} height={2}
      fill="rgba(232,201,122,0.55)"
    />
  </>
)}
```

Replace the `✦` text element with an SVG `<image>`:
```svg
<image
  href="/assets/ui/memories.png"
  x={-8}
  y={hangDir === -1 ? -46 : 6}
  width={16}
  height={16}
  preserveAspectRatio="xMidYMid meet"
/>
```

Update `isMilestone()` helper to also check `mem.isMilestone === true`:
```ts
function isMilestone(mem: ContentItem): boolean {
  const t = (mem.type as string) ?? ''
  const title = ((mem.title as string) ?? '').toLowerCase()
  return t === 'milestone'
    || !!(mem.isMilestone as boolean)
    || ['proposal', 'engagement', 'wedding', 'anniversary', 'first meeting', 'first trip']
       .some(k => title.includes(k))
}
```

---

### Fix 12 — Automatic timeline events (`useContentStore.ts`)

Add `createTimelineEvent` to the store interface and implementation:

```ts
createTimelineEvent: async (
  sourceType: string,
  sourceId: string,
  title: string,
  date?: string
) => Promise<string>
```

Implementation:
```ts
createTimelineEvent: async (sourceType, sourceId, title, date) => {
  return get().add('memories', {
    title,
    date: date ?? new Date().toISOString().split('T')[0],
    type: 'timeline-event',
    sourceType,
    sourceId,
  })
}
```

Call sites — add **after** the successful `add()` call (inside the `try` block, after
`addBlossoms`):

- `CreateSongForm`: `await createTimelineEvent('song', id, title || 'A new song', date)`
- `CreatePlaceForm`: `await createTimelineEvent('place', id, name || 'A new place')`
- `CreateLetterForm`: `await createTimelineEvent('letter', id, title || 'A new letter')`

`isMilestone()` excludes `type === 'timeline-event'` so these nodes render as plain paper notes.

---

### Fix 13 — Icon system

#### `BookInteraction.tsx` — RING_ITEMS

```ts
{ type: 'poem',   asset: '/assets/ui/letter.png',   ... }
{ type: 'wish',   asset: '/assets/ui/lantern.png',  ... }
{ type: 'place',  asset: '/assets/ui/map.png',      ... }
{ type: 'memory', asset: '/assets/ui/memories.png', ... }
{ type: 'song',   asset: '/assets/ui/petal.png',    ... }  // confirm actual filename
{ type: 'letter', asset: '/assets/ui/letter.png',   ... }
```

#### `RightPanel.tsx` — ICONS + PANEL_CFG + CREATE_CFG

Updated `ICONS` object:
```ts
const ICONS = {
  memories: '/assets/ui/memories.png',
  petal:    '/assets/ui/petal.png',
  letter:   '/assets/ui/letter.png',
  lantern:  '/assets/ui/lantern.png',
  map:      '/assets/ui/map.png',
  candle:   '/assets/ui/candle.png',
  magicBook:'/assets/ui/magic-book.png',
} as const
```

Updated config assignments:
| Panel type | icon |
|---|---|
| `memory` | `ICONS.memories` |
| `song` | `ICONS.petal` |
| `poem` | `ICONS.letter` |
| `wish` | `ICONS.lantern` |
| `place` | `ICONS.map` |
| `letter` | `ICONS.letter` |
| `evening` | `ICONS.candle` |
| `dream` | `ICONS.map` |
| `comfort` / `create` | `ICONS.magicBook` |

#### `shared.tsx` — SaveButton + SuccessState

`SaveButton` — replace `emoji: string` prop with `icon: string`:
```tsx
// Render as PNG instead of emoji text
<img
  src={icon}
  alt=""
  aria-hidden="true"
  style={{ width: 16, height: 16, objectFit: 'contain', verticalAlign: 'middle',
           filter: `drop-shadow(0 0 5px ${accent}88)` }}
/>
```

`SuccessState` — add `icon?: string` prop (default `/assets/ui/memories.png`), replace `✨` emoji:
```tsx
<motion.div ...>
  <img
    src={icon ?? '/assets/ui/memories.png'}
    alt=""
    aria-hidden="true"
    style={{ width: 56, height: 56, objectFit: 'contain' }}
  />
</motion.div>
```

#### Creation forms — header icons

Each form replaces its emoji `<span>` with an `<img>`:

| Form | PNG |
|---|---|
| `CreateMemoryForm` | `memories.png` |
| `CreateSongForm` | `petal.png` |
| `CreatePoemForm` | `letter.png` |
| `CreateWishForm` | `lantern.png` |
| `CreatePlaceForm` | `map.png` |
| `CreateLetterForm` | `letter.png` |
| `CreateMilestoneForm` | `memories.png` |

Also update the `emoji` prop passed to `SaveButton` in each form to the correct PNG path
(`icon` after the prop rename).

#### `WorldCanvas.tsx` — hit-region labels

Strip emoji prefixes from all `label` strings in `hitRegions.push(...)`:

```ts
// All categories — before:  label: `🌸 ${title}`
//                  after:   label: title
```

This removes emojis from `HoverTooltip` displays without touching the tooltip component itself.

#### Panel empty states

Replace emoji in `EmptyState` components:

- `MemoryPanel`: `🌸` → `<img src="/assets/ui/memories.png" width={56} height={56} />`
- Other panels: audit and apply same pattern using each panel's designated asset.

---

### Files changed

| File | Change type |
|---|---|
| `src/store/useUIStore.ts` | Add `boardHovered` + `setBoardHovered` |
| `src/store/useContentStore.ts` | Add `createTimelineEvent` helper |
| `src/components/world/FateThread.tsx` | Hitbox constants, debug border, idle notes, chalk-text transition, lantern overlay, extended phase machine, 3D swing, spool component, save animation pulse, milestone ribbon + isMilestone fix |
| `src/components/world/BlankNoteEditor.tsx` | **New file** |
| `src/components/world/BookInteraction.tsx` | Fix RING_ITEMS asset paths |
| `src/components/world/RightPanel.tsx` | Fix ICONS, PANEL_CFG, CREATE_CFG |
| `src/components/world/WorldCanvas.tsx` | Remove emoji from hitRegion label strings |
| `src/components/forms/shared.tsx` | `SaveButton` emoji→icon prop, `SuccessState` emoji→icon |
| `src/components/forms/CreateMemoryForm.tsx` | Header emoji→PNG, SaveButton icon prop |
| `src/components/forms/CreateSongForm.tsx` | Header emoji→PNG, SaveButton icon prop, `createTimelineEvent` call |
| `src/components/forms/CreatePoemForm.tsx` | Header emoji→PNG, SaveButton icon prop |
| `src/components/forms/CreateWishForm.tsx` | Header emoji→PNG, SaveButton icon prop |
| `src/components/forms/CreatePlaceForm.tsx` | Header emoji→PNG, SaveButton icon prop, `createTimelineEvent` call |
| `src/components/forms/CreateLetterForm.tsx` | Header emoji→PNG, SaveButton icon prop, `createTimelineEvent` call |
| `src/components/forms/CreateMilestoneForm.tsx` | Header emoji→PNG, SaveButton icon prop |
| `src/components/panels/MemoryPanel.tsx` | EmptyState emoji→PNG, MemoryDetail header icon |
| `src/components/panels/SongPanel.tsx` | EmptyState emoji→PNG |
| `src/components/panels/PoemPanel.tsx` | EmptyState emoji→PNG |
| `src/components/panels/WishPanel.tsx` | EmptyState emoji→PNG |
| `src/components/panels/PlacePanel.tsx` | EmptyState emoji→PNG |
| `src/app/globals.css` | Add `thread-pulse` keyframe |

---

## Implementation Order

1. Icon system (Section Fix 13) — pure asset swaps, zero logic risk.
2. Board constants + debug border (Fix 1).
3. `boardHovered` store field (Fix 2) + BoardAmbient/BoardHitZone wiring (Fixes 3–5).
4. Phase machine expansion + 3D swing (Fixes 6–7).
5. Spool component (Fix 8).
6. `BlankNoteEditor` new file (Fix 9).
7. Save animation (Fix 10).
8. Milestone ribbon + isMilestone fix (Fix 11).
9. `createTimelineEvent` + form callers (Fix 12).
10. Remove debug border after visual alignment confirmed.

---

## Correctness Properties

- `BoardHitZone` must never call `openRightPanel` or `openCreate`. Only `openTimeline` or `closeTimeline`.
- `BlankNoteEditor` must never render inside `RightPanel`. It renders inside `FateThreadOverlay`.
- `SakuraCalendar` must not be modified — it already satisfies all date-picker requirements.
- `BookInteraction.tsx` components (`BookAmbient`, `BookHitZone`, `BookJourney`, `MemoryRing`) must not be changed by this work except for the RING_ITEMS asset path corrections.
- `petal.png` vs `petals.png` — use whichever filename actually exists in `/public/assets/ui/`. Do not rename or create new files.
- Timeline-event memory nodes (`type: 'timeline-event'`) must not trigger milestone treatment.
- The debug border (`border: '2px solid red'`) must be removed before the feature is marked complete.

---

## Testing Strategy

Manual verification steps for each fix area:

**Hitbox:** Open `/home`, observe the red debug border. Visually confirm it overlaps the painted
wooden board in the artwork on multiple viewport sizes (1280×800, 1440×900, 1920×1080).

**Idle notes:** Wait 10 seconds on the home page without hovering. Confirm three different notes
appear in sequence over three cycles.

**Hover state:** Hover the board. Confirm: (a) golden glow, (b) lantern area brightens,
(c) text transitions from "Dreams we're building" to "Our Story So Far", (d) text fades when
mouse leaves.

**Click sequence:** Click the board. Confirm all five cinematic phases are visible: darkening →
board zoom with slight 3D rotation → chalk text dissolves with particles → thread particles emerge
from board area → fate thread draws across screen.

**Spool:** With timeline open, confirm the golden spool is visible near the left edge of the
thread. Hover it — confirm "Weave New Memory" label and thread glow. Click — confirm spool
unravels, `BlankNoteEditor` opens as a paper note.

**Memory creation:** Fill in the paper note fields. Confirm custom date picker (not native calendar).
Save — confirm paper folds away, thread pulses, new note appears on the thread.

**Milestone:** Create a memory with milestone toggle enabled. Confirm note is larger, ribbon is
visible, orbit particles appear.

**Automatic events:** Add a Song via the book ring. Open the timeline. Confirm a timeline event
for the song appears as a note on the thread.

**Icon consistency:** Verify no emoji appear as functional icons in any form header, panel header,
save button, success state, or empty state. Verify bloom ring shows correct PNG per category.
Verify right panel header uses correct PNG per category.
