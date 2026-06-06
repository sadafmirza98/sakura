# Implementation Plan

## Overview

Sakura World Redesign v3 — transforms the app from a dashboard into a living magical garden world with a hero illustration background, animated canvas layers, and rich content interactions.

## Tasks

- [x] 1. Scaffold public assets and hero background
  - Create folder `/public/assets/ui/`
  - Add placeholder files for `map.png`, `lantern.png`, `petal.png`, `sakura.png`, `wish-blossom.png`, `candle.png` (32×32 white circles on transparent bg as dev placeholders)
  - Add `sakura-bg.jpg` (user-provided hero illustration) to `/public/assets/ui/`
  - Create `src/components/world/HeroBg.tsx` — renders the illustration as a fixed CSS `background-image` with a subtle vignette overlay div
  - Replace current `GardenBg.tsx` usage in `home/page.tsx` with `HeroBg`
  - Verify hero image covers full viewport with `background-size: cover` and correct vertical anchor (`center 30%`)
  - _Requirements: Design §3, §15_

- [x] 2. Split Zustand stores
  - Create `src/store/useUIStore.ts` with: `rightPanel`, `selectedItemId`, `hoverTarget`, `createType`, `discoveryDone` + all UI actions (`openRightPanel`, `closeRightPanel`, `setHover`, `openCreate`, `closeCreate`, `dismissDiscovery`)
  - Create `src/store/useContentStore.ts` with empty arrays and counts for all 9 content types; add `initListeners()` action that attaches Firestore `onSnapshot` listeners when called
  - Trim `useAppStore.ts` to only: `isAuthenticated`, `blossomCount`, `relationshipStartDate`, `setAuthenticated`, `addBlossoms`, `setRelationshipStartDate`
  - Update all existing components that reference the old combined store to import from the correct new store
  - Call `useContentStore.initListeners()` inside the authenticated `home/page.tsx` on mount
  - _Requirements: Design §1.3, Req 20_

- [x] 3. Rebuild ParticleCanvas (ambient particles only)
  - Create `src/components/world/ParticleCanvas.tsx` — transparent canvas, `z-index: 1`
  - Implement drifting sakura petals: 15–25 active, each with hue `334–362`, random size `3–9px`, wobble via `sin(t + wobble_phase)`
  - Implement fireflies: 10–18 active in lower-left region (`x: 0–40%, y: 55–80%`), soft green-yellow glow, organic motion via damped velocity
  - Implement shooting star: one at a time, random interval `200–600 frames`, gradient trail + bright head
  - Implement star twinkle overlay: draw 60 small stars over the sky region with individual twinkle rates, enhancing the illustration's existing stars
  - Pause all animations when `document.hidden === true`
  - Cap total particles to 150 desktop / 60 mobile (detect via `navigator.hardwareConcurrency < 4` or viewport width)
  - Remove all scenery drawing (sky, mountains, river, bridge, fog, moon) from the old `GardenBg.tsx` / `WorldCanvas.tsx`
  - _Requirements: Req 2, Req 17, Design §4_

- [x] 4. Rebuild WorldCanvas — tree + content objects
  - Create or rewrite `src/components/world/WorldCanvas.tsx` — transparent canvas, `z-index: 10`
  - Define coordinate bounding zones matching the hero image regions (tree canopy, branch, sky, path, roots)
  - Implement golden-ratio spiral placement within each zone for deterministic object positioning
  - Implement `hitRegions: HitRegion[]` array rebuilt each frame; `onMouseMove` performs hit test → calls `useUIStore.setHover()`
  - Implement `onClick` handler routing to `openRightPanel(type, {id})` or `openCreate(type)` based on hit region
  - Draw Memory Blossoms: 5-petal flower, colour by type (pink=default, blue=trip, gold=milestone, purple=dream), size 10–14px, hover glow, bob animation
  - Draw Song Lanterns: hanging from branch zone, mood colour glow, sway animation, hover scale 1.12
  - Draw Poem Petals: lavender ellipse 8px, orbit around canopy zone, hover freeze + scale 1.5
  - Draw Whisper Leaves: green leaf shape near lower branches, sway, hover scale 1.15
  - Draw Letter Cranes: paper crane shape on mid branches; locked = cool silver glow; unlocked = warm gold glow
  - Draw Wish Buds: near roots, bud → bloom when `wish.completed === true`, bloom animation 1200ms
  - Draw Place Stones: path zone, ellipse 16×10px, small label text on hover
  - Draw Evening Stars: sky zone high altitude, brightness 100% if watched / 40% if planned, twinkle
  - Draw Dream Constellations: sky zone, star nodes + connecting lines, golden pulse on completed goals
  - Implement tree growth overlay: on top of illustrated tree, draw additional branch segments + blossoms using `globalCompositeOperation = 'multiply'`; growth level derived from `blossomCount`
  - Remove all old scenery-drawing functions that are now replaced by the hero image
  - _Requirements: Req 3, Req 4, Req 5–13, Design §5_

- [x] 5. Build right-side floating navigation
  - Create `src/components/world/FloatingNav.tsx`
  - Position: `fixed`, `right: 16px`, `top: 50%`, `transform: translateY(-50%)`, `z-index: 30`
  - Render 6 icon buttons using the PNG assets from `/public/assets/ui/`
  - Default state: 44px wide, icons only, `filter: brightness(0.65) saturate(0.6)`
  - Hover state: label slides in from right (`motion.div`, 150ms), icon brightens to `filter: brightness(1.0) saturate(1.0)`
  - Active state: 2px left border in accent colour, icon fully bright
  - On click: calls `openRightPanel(type)` via `useUIStore`
  - Mobile (`< 768px`): hide the floating nav; dock handles primary navigation
  - _Requirements: Req 18, Design §7_

- [x] 6. Build right panel with all content type views
  - Rewrite `src/components/world/RightPanel.tsx` — slide from `x: 100%`, spring animation
  - Header: 2px accent bar, emoji + title + subtitle, X close button
  - Implement `MemoryPanel` — photo grid, title, date, story, tags, voice note player placeholder, related memories row
  - Implement `SongPanel` — album art square, title, artist, play button (YouTube/Spotify), "why this matters" text, mood chip
  - Implement `PoemPanel` — paper-texture card, poem title centered, ink-reveal animation (`clip-path` wipe from top over 2000ms)
  - Implement `WhisperPanel` — whisper text, date, soft background
  - Implement `LetterPanel` — locked state (sealed crane icon, unlock date); unlocked state (crane animation then letter in paper card)
  - Implement `WishPanel` — wish title, category, completion toggle, progress indicator
  - Implement `PlacePanel` — photo, name/country, visited indicator, notes, map placeholder
  - Implement `EveningPanel` — poster, title, watched/planned badge, rating stars, review, streaming link
  - Implement `DreamPanel` — dream goals list, completion states, constellation preview
  - Implement `ComfortPanel` — affirmation card, days counter, reasons-I-love-you form
  - Panel closes on: Escape key, click outside, close button
  - When panel opens, apply soft blur to `ParticleCanvas` and `WorldCanvas` elements behind it via `filter: blur(1.5px)` on a wrapper
  - _Requirements: Req 19, Req 5, Req 6, Req 7, Req 8, Req 9, Req 10, Req 11, Req 12, Req 13, Design §6_

- [x] 7. Build creation forms inside the right panel
  - Create `src/components/forms/` directory with one file per content type
  - Each form opens as `rightPanel = 'create'` with `createType` set — renders in the right panel, NOT a center modal
  - Shared form components: `SakuraInput`, `SakuraTextarea`, `SakuraSelect`, `MoodChipGroup`, `FieldLabel`, `SaveButton`
  - `CreateMemoryForm`: title, date, story textarea, tags input, photo upload placeholder
  - `CreateSongForm`: URL input, title, artist (2-col), mood chips, "why it matters" italic textarea
  - `CreatePoemForm`: title, poetic textarea (Playfair italic, 2× line-height)
  - `CreateWhisperForm`: single italic textarea
  - `CreateWishForm`: wish text, category select
  - `CreatePlaceForm`: place+country 2-col, date, notes, "been here" checkbox
  - `CreateLetterForm`: "open when" text, unlock date, poetic letter textarea
  - `CreateMilestoneForm`: milestone name, date, story textarea
  - On successful save: show success state (emoji bounce + "Growing on the tree…"), close panel after 1.6s, fire `addBlossoms(n)` and `ContentStore.add(type, data)`
  - On save, `WorldCanvas` reads new count and adds the new object at its computed position with a particle-burst entrance animation
  - _Requirements: Req 15, Design §10_

- [x] 8. Rebuild bottom glass dock
  - Rewrite `src/components/world/GardenDock.tsx`
  - Always visible (no expand/collapse toggle needed — items always shown)
  - Shape: pill, `border-radius: 100px`, `backdrop-filter: blur(40px)`
  - 7 items: 🌸 Memory, 🏮 Song, 🪷 Poem, 🍃 Whisper, ⭐ Wish, 📍 Place, 🕊️ Letter
  - Each item: emoji (22px) + label (10px) stacked, hover → `translateY(-6px) scale(1.04)` + per-item accent glow
  - Click → `openCreate(type)` which sets `rightPanel = 'create'` in `useUIStore`
  - Lantern emoji 🏮 in main dock button pulses with `scale: [1, 1.12, 1]` on 3s loop
  - Dock positioned: `fixed, bottom: 24px, left: 50%, translateX(-50%), z-index: 40`
  - _Requirements: Req 15, Design §8_

- [x] 9. Hover tooltip system
  - Create `src/components/world/HoverTooltip.tsx`
  - Renders via React portal at `document.body`
  - Reads `useUIStore.hoverTarget` — when non-null, renders near `(target.x, target.y - 56)`
  - Content: line 1 = `label` (12px 500-weight), line 2 = `sublabel` (10px muted)
  - Arrow: 4×4px rotated border square pointing downward
  - Animation: `y: 6→0, scale: 0.92→1`, 180ms, exit same
  - Shows for blossoms, lanterns, petals, leaves, cranes, buds, stars, stones
  - Tooltip text examples: `"🌸 First Date · March 2025 · Click to revisit"`, `"🏮 Until I Found You · Click to listen"`
  - Clears when cursor leaves canvas or panel opens
  - _Requirements: Design §11, UX correction pass_

- [x] 10. Discovery prompts for first-time users
  - Create `src/components/world/DiscoveryPrompts.tsx`
  - Reads `useUIStore.discoveryDone` — renders only when `false`
  - Shows 3 prompt cards at fixed positions near relevant regions (tree area, sky, dock)
  - Each card: glass pill, font-serif italic 12px, delay 2s entry, auto-exit after 8s
  - Prompts: `"🌸 Click blossoms to revisit memories"`, `"🏮 Click lanterns to play songs"`, `"✨ Click stars to explore poems & dreams"`
  - On first click anywhere on canvas, call `useUIStore.dismissDiscovery()`
  - `discoveryDone` persisted in localStorage via Zustand `persist`
  - _Requirements: Design §9, UX correction pass_

- [x] 11. Home page composition
  - Rewrite `src/app/home/page.tsx` with clean layer composition: `<HeroBg />` z-0, `<ParticleCanvas />` z-1, `<WorldCanvas />` z-10, `<DiscoveryPrompts />` z-20, `<HoverTooltip />` z-25 (portal), `<FloatingNav />` z-30, `<RightPanel />` z-35, `<GardenDock />` z-40
  - Top-center days counter — `pointer-events-none`, fades when panel open
  - Top-right blossom counter — fades when panel open
  - Back button — appears when `sceneMode !== 'garden'`
  - Remove all imports of old `BlossomForm`, `SceneOverlay`, `ContextPanel`, `CreateModal`
  - _Requirements: Design §1.1, Req 1_

- [x] 12. Firebase content store integration
  - Implement `useContentStore.initListeners()` using Firestore `onSnapshot` for all collections: `memories`, `songs`, `poems`, `whispers`, `letters`, `wishes`, `places`, `evenings`, `dreams`
  - Each listener updates the corresponding array + count in the store
  - `WorldCanvas` reads counts from `useContentStore` to determine how many objects to render
  - `RightPanel` reads individual item data from `useContentStore` by `selectedItemId`
  - Add `ContentStore.add(type, data)` action that writes to Firestore and optimistically appends to local array
  - Add `ContentStore.delete(type, id)` action that removes from Firestore and filters local array
  - Ensure all Firebase calls use try/catch; surface errors in a subtle toast (not a modal)
  - _Requirements: Req 20, Design §1.2_

- [x] 13. Anniversary + special states
  - In `WorldCanvas`, check if today matches `relationshipStartDate` month+day
  - If anniversary: render the 3 most recent Memory blossoms as gold with expanded glow radius
  - Apply a faint golden shimmer layer across the tree canopy zone on anniversary
  - Show a subtle "✦ Happy Anniversary" text near the top of the tree zone, font-serif italic, `rgba(232,201,122,0.7)`
  - _Requirements: Req 4 acceptance criteria 4_

- [x] 14. Build and verify
  - Run `npm run build` — zero errors, zero type errors
  - Verify all 16 routes still build as static pages
  - Check canvas renders correctly at 1280×800, 1920×1080, and 390×844 (iPhone)
  - Verify right panel does not cover > 35% of viewport width
  - Verify dock is always visible and does not overlap panel
  - Verify no centered modals appear anywhere
  - Verify `document.hidden` pauses `ParticleCanvas` animations
  - Add `/public/assets/ui/` to `.gitignore` exclusion list (keep assets tracked)
  - _Requirements: All_

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": [1, 2] },
    { "wave": 2, "tasks": [3, 4, 5, 6, 8, 9, 10, 12] },
    { "wave": 3, "tasks": [7] },
    { "wave": 4, "tasks": [11, 13] },
    { "wave": 5, "tasks": [14] }
  ],
  "dependencies": {
    "3":  ["1", "2"],
    "4":  ["1", "2"],
    "5":  ["2"],
    "6":  ["2"],
    "7":  ["2", "6"],
    "8":  ["2"],
    "9":  ["2", "4"],
    "10": ["2"],
    "11": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    "12": ["2"],
    "13": ["4", "12"],
    "14": ["11", "12", "13"]
  }
}
```

## Notes

- Tasks 3, 4, 5, 6, 8, 9, 10 can begin after tasks 1 and 2 complete.
- Task 7 depends on task 6 (forms render inside the right panel).
- Task 11 depends on all prior tasks (assembles the final page).
- Task 12 can run in parallel with tasks 3–10 once task 2 is done.
- Task 13 depends on task 4 (WorldCanvas) and task 12 (Firebase store).
- Task 14 is the final verification pass and depends on all other tasks.
- The hero illustration (`sakura-bg.jpg`) must be user-provided; placeholder tasks create the folder structure.
- All canvas work uses Canvas 2D API (not Three.js) per Design §16.
