# Design Document — Sakura World Redesign v3

## Overview

Sakura v3 replaces every procedurally-drawn background element with a single hero illustration (the provided painted scene: sakura tree, lanterns, constellations, couple, mountains, river, falling blossoms). Code is responsible only for particles, animations, interactions, and content objects layered on top of that image. The world is already painted. The code makes it live and responds to memory.

---

## 1. Architecture

### 1.1 Layer Stack (z-index order)

```
z-0  — hero-bg          : CSS background-image (the illustration)
z-1  — particle-canvas  : Canvas 2D — ambient petals, fireflies, shooting stars
z-10 — world-canvas     : Canvas 2D — tree growth, content objects (blossoms, lanterns, petals, stars, cranes, buds, stones)
z-20 — hud              : React DOM — days counter, blossom count, discovery prompts
z-30 — right-panel      : React DOM — sliding context panel (35vw)
z-40 — dock             : React DOM — bottom center quick-create dock
z-50 — forms / overlays : React DOM — creation forms, comfort pavilion, constellation view
```

### 1.2 Data Flow

```
Firebase Firestore
      ↓
ContentStore (Zustand)       ← syncs on mount, live listener per collection
      ↓
WorldCanvas                  ← reads counts + item arrays, maps to canvas positions
      ↓
RightPanel / Forms           ← reads selected item from UIStore
```

### 1.3 Store split

| Store | Holds |
|-------|-------|
| `useAppStore` | auth, blossomCount, relationshipStartDate, discoveryDone |
| `useUIStore`  | rightPanel type, selectedItemId, hoverTarget, createType |
| `useContentStore` | memories[], songs[], poems[], whispers[], letters[], wishes[], places[], evenings[], dreams[] — counts + full arrays loaded from Firebase |

---

## 2. File Structure

```
/public/assets/ui/
  sakura-bg.jpg          ← hero illustration (user provides)
  map.png
  lantern.png
  petal.png
  sakura.png
  wish-blossom.png
  candle.png

/src/
  store/
    useAppStore.ts       ← existing, trimmed
    useUIStore.ts        ← NEW: all UI state (panels, hover, create)
    useContentStore.ts   ← NEW: Firebase content arrays + counts

  components/
    world/
      HeroBg.tsx         ← <div> with CSS background-image; no canvas
      ParticleCanvas.tsx ← ambient petals, fireflies, shooting stars ONLY
      WorldCanvas.tsx    ← tree + content objects (blossoms etc.) on transparent canvas
      RightPanel.tsx     ← slide-in panel 35vw
      GardenDock.tsx     ← bottom dock (renamed from QuickCreateDock)
      DiscoveryPrompts.tsx
      FloatingNav.tsx    ← right-side icon strip
      HoverTooltip.tsx   ← portal tooltip following cursor

    panels/
      MemoryPanel.tsx
      SongPanel.tsx
      PoemPanel.tsx
      WhisperPanel.tsx
      LetterPanel.tsx
      WishPanel.tsx
      PlacePanel.tsx
      EveningPanel.tsx
      DreamPanel.tsx
      ComfortPanel.tsx

    forms/
      CreateMemoryForm.tsx
      CreateSongForm.tsx
      CreatePoemForm.tsx
      CreateWhisperForm.tsx
      CreateWishForm.tsx
      CreatePlaceForm.tsx
      CreateLetterForm.tsx
      CreateMilestoneForm.tsx
```

---

## 3. HeroBg Component

```tsx
// No canvas. Pure CSS. Zero JS overhead.
<div
  style={{
    position: 'fixed', inset: 0, zIndex: 0,
    backgroundImage: 'url(/assets/ui/sakura-bg.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center 30%',  // keeps tree + sky in frame
    backgroundRepeat: 'no-repeat',
  }}
/>
// Subtle vignette overlay so UI elements read clearly
<div style={{ position:'fixed', inset:0, zIndex:1,
  background: 'radial-gradient(ellipse 80% 70% at 50% 60%, transparent 30%, rgba(4,3,12,0.35) 100%)'
}} />
```

---

## 4. ParticleCanvas

Responsibility: ambient life only. No scenery.

```
Particles managed:
  • Sakura petals     — 15–25 active, drift downward with horizontal wobble
  • Fireflies         — 10–18 active, glowing dots near lower-left garden area
  • Shooting stars    — 1 at a time, random interval 200–600 frames
  • Star twinkle      — drawn on top of image stars for added shimmer
```

Performance: `requestAnimationFrame`, paused on `document.hidden`.

---

## 5. WorldCanvas — Content Object Rendering

Transparent canvas over HeroBg. Draws all content objects at deterministic positions derived from the hero image geometry.

### 5.1 Coordinate System

The hero image has known regions:

```
Tree canopy zone:      x 2%–42%,  y 0%–65%
Branch zone:           x 5%–40%,  y 15%–55%
Lower garden/roots:    x 10%–40%, y 60%–80%
Sky zone:              x 45%–100%,y 0%–50%
Path/stones zone:      x 40%–65%, y 65%–90%
```

All content objects snap to these regions using the golden-ratio spiral + region bounding box.

### 5.2 Content Object Placement

| Content Type | Region | Visual Element | Size |
|---|---|---|---|
| Memory | Tree canopy | 5-petal blossom (pink/blue/gold/purple) | 10–14px radius |
| Song | Branch zone | Hanging lantern with glow | 12px body |
| Poem | Sky zone, low altitude | Floating petal (lavender) | 8px |
| Whisper | Lower branch fringe | Green leaf | 8px |
| Letter | Mid branch | Paper crane | 12px |
| Wish | Near roots | Bud (green, blooms when done) | 7px |
| Place | Path zone | Stone ellipse with label | 16×10px |
| Evening | Sky zone, high | Star point with twinkle | 4px |
| Dream | Sky zone, high | Star node with constellation lines | 4–6px |

### 5.3 Tree Growth States

| Memories | State | Visual |
|---|---|---|
| 0–20 | Sapling | Thin trunk, 2 branch levels, sparse blossoms |
| 20–100 | Young | Medium trunk, 3 levels, moderate blossoms |
| 100–300 | Flourishing | Wide trunk, 4–5 levels, dense blossoms, lanterns visible |
| 300+ | Ancient | Full trunk, 5+ levels, rich canopy, all elements dense |

Growth is drawn on top of the illustrated tree in the image — the canvas tree **augments** the painted one, it does not replace it. The canvas tree uses `globalCompositeOperation = 'multiply'` blending so it blends naturally into the illustration.

### 5.4 Hover Detection

Each content object registers a hit-test rectangle `{ x, y, w, h, type, id }` into a `hitRegions[]` array every frame. `onMouseMove` checks the array. Matching object → `setHover(target)`.

Cursor changes to `pointer`. `HoverTooltip` renders near cursor.

### 5.5 Click Routing

```
Click detected on hitRegion
  → type === 'memory'   → openRightPanel('memory', { id })
  → type === 'song'     → openRightPanel('song',   { id })
  → type === 'poem'     → openRightPanel('poem',   { id })
  → type === 'whisper'  → openRightPanel('whisper',{ id })
  → type === 'letter'   → openRightPanel('letter', { id })
  → type === 'wish'     → openRightPanel('wish',   { id })
  → type === 'place'    → openRightPanel('place',  { id })
  → type === 'evening'  → openRightPanel('evening',{ id })
  → type === 'dream'    → openRightPanel('dream',  { id })
  → empty area in canopy → openCreate('memory')
```

---

## 6. Right Panel

### 6.1 Design Spec

```
Width:       clamp(320px, 35vw, 460px)
Position:    fixed right-0, top-0, bottom-0
Background:  linear-gradient(160deg, rgba(10,7,28,0.94), rgba(6,4,18,0.97))
Backdrop:    blur(40px)
Border-left: 1px solid rgba(255,255,255,0.07)
Shadow:      -20px 0 60px rgba(0,0,0,0.5)
Border-radius: 0 (flush to edge)
Animation:   spring(stiffness:280, damping:30) slide from x:100%
```

### 6.2 Panel Header

```
Accent bar     : 2px top, gradient from accent color
Emoji + Title  : font-serif 18px, weight 300
Subtitle       : font-sans 11px, rgba(201,191,232,0.5)
Close button   : 32×32px glass pill, top-right
```

### 6.3 Panel Content per Type

**Memory Panel**
- Photo gallery (grid 2-col, tap to enlarge)
- Title (font-serif 20px)
- Date + location pill
- Story text
- Tags row (pill chips)
- Voice note player (if present)
- Related memories (horizontal scroll of small blossom thumbnails)
- Edit button

**Song Panel**
- Album art square (full panel width, rounded 20px)
- Song title (font-serif 22px)
- Artist (font-sans 13px)
- Play button (glass pill, accent color)
- "Why this song matters" (italic font-serif)
- Mood chip
- Linked memories row

**Poem Panel**
- Paper-texture background card (rgba warm cream)
- Poem title (font-serif 16px, centered)
- Poem text (font-serif italic, ink-reveal animation via `clip-path` wipe)
- Author + date (bottom)

**Letter Panel**
- Status indicator (locked/unlocked)
- If locked: locked until date, sealed wax icon, no content visible
- If unlocked: crane-fly-in animation, then letter text in paper card style

**Place Panel**
- Photo (if available)
- Place name + country
- "We've been here" / "Dream destination" indicator
- Notes
- Map embed placeholder

---

## 7. Right-Side Floating Navigation

```
Position:  fixed, right: 16px, top: 50%, translateY(-50%)
Width:     44px (collapsed) → 180px (hovered)
Gap:       6px between items
```

### 7.1 Icon mapping to PNG assets

| Icon | Asset | Section |
|---|---|---|
| map.png | Memories |
| lantern.png | Songs / Soundtrack |
| petal.png | Poems / Petals |
| sakura.png | Poems & Letters |
| wish-blossom.png | Wishes |
| candle.png | Letters |

Each icon is a `<img>` with `filter: brightness(0.7) saturate(0.5)` default, brightening on hover.

### 7.2 Hover behavior

```
Hover → label slides in from right with motion.div (x: 8 → 0, opacity 0 → 1, duration 150ms)
Active → accent border-left 2px, icon brightness 1.0
```

---

## 8. Bottom Glass Dock

```
Position:   fixed, bottom: 24px, left: 50%, translateX(-50%)
Shape:      pill (border-radius: 100px)
Background: rgba(255,255,255,0.07), blur(40px)
Border:     1px solid rgba(255,255,255,0.1)
Shadow:     0 8px 32px rgba(0,0,0,0.45), glow rgba(242,168,184,0.1)
```

### 8.1 Items (always visible, labelled)

```
🌸 Memory  |  🏮 Song  |  🪷 Poem  |  🍃 Whisper  |  ⭐ Wish  |  📍 Place  |  🕊️ Letter
```

On click → opens right panel in create mode for that type.

### 8.2 Expanded state

When tapped on mobile, dock expands vertically revealing labels and a brief descriptor line.

---

## 9. Discovery Prompts

Displayed for first-time users (stored in localStorage). Auto-dismiss after 8 seconds or on first interaction.

```
Prompt cards displayed near relevant regions:
  • Near tree canopy: "🌸 Click blossoms to revisit memories"
  • Near branches:   "🏮 Click lanterns to play songs"  
  • Near sky:        "✨ Click stars to explore poems & dreams"
  • Near dock:       "Use the dock to grow your story"
```

Each card: `font-sans 12px`, `background rgba(8,5,22,0.82)`, `border 1px solid rgba(242,168,184,0.14)`, `border-radius 16px`, `backdrop-filter blur(16px)`.

---

## 10. Creation Forms (Right Panel — Create Mode)

Forms open inside the right panel. The garden world remains fully visible behind.

### Common form structure

```
Header:  emoji + title + "X blossoms will bloom" subtitle
Divider: accent gradient line
Fields:  sakura-input class (see globals.css)
Footer:  SaveBtn + divider
```

### Post-save animation

1. Right panel shows success state (emoji bounce + "Growing on the tree…")
2. Panel closes after 1.6s
3. WorldCanvas fires `addContentObject(type, id)` → particle burst at the object's computed position on canvas

---

## 11. Hover Tooltip

Portal `<div>` rendered at `document.body` level.

```
Position: follows cursor (clientX, clientY - 56)
Content:
  Line 1: emoji + label  (font-sans 12px, bold)
  Line 2: action hint    (font-sans 10px, muted)
Arrow:  4×4px rotated square, border bottom-right
```

---

## 12. Color System

| Token | Value | Usage |
|---|---|---|
| Sakura pink | `#f2a8b8` | Memories, primary accent |
| Gold | `#e8c97a` | Milestones, lanterns (gold mood) |
| Lavender | `#c9bfe8` | Poems, petals |
| Leaf green | `#a8d8a0` | Whispers, wishes |
| Sky blue | `#a8d0e8` | Places, comfort mood |
| Crane violet | `#d4aaff` | Letters |
| Lantern amber | `#ffb450` | Songs, lanterns |
| Dream star | `#ffe890` | Dreams, constellations |
| Night base | `#04060f` | Background fallback |
| Panel dark | `rgba(10,7,28,0.94)` | Right panel |

---

## 13. Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| Display title | Playfair Display | 28–44px | 300 |
| Section heading | Playfair Display | 18–22px | 400 |
| Body | Inter | 13–15px | 300–400 |
| Labels | Inter | 10–12px | 400, letterspaced |
| Poem / letter | Playfair Display | 14–16px | 400, italic |

---

## 14. Motion Principles

| Interaction | Animation |
|---|---|
| Right panel open | Spring stiffness 280 damping 30, slide from x:100% |
| Right panel close | Spring stiffness 240 damping 28, slide to x:100% |
| Tooltip appear | 180ms, y:6→0, scale 0.92→1 |
| Dock item hover | translateY -6px, scale 1.04, shadow expand |
| Blossom hover | scale 1.15, glow pulse 2 cycles |
| Lantern hover | scale 1.12, glow intensify |
| Success state | emoji scale 1→1.3→1, rotate ±15 |
| Discovery prompt | delay 2s, fade in, auto fade out after 8s |
| Panel content | stagger children with 40ms delay each |

All durations ≤ 400ms for micro-interactions. Camera drifts ≤ 1200ms. No linear easing — always ease-in-out or spring.

---

## 15. Asset Checklist

Files to be placed in `/public/assets/ui/`:

| File | Purpose | Recommended size |
|---|---|---|
| `sakura-bg.jpg` | Hero world background | 1920×1080 minimum, WebP preferred |
| `map.png` | Nav icon + world object | 64×64px, transparent bg |
| `lantern.png` | Nav icon + world object | 64×64px, transparent bg |
| `petal.png` | Nav icon + world object | 64×64px, transparent bg |
| `sakura.png` | Nav icon + world object | 64×64px, transparent bg |
| `wish-blossom.png` | Nav icon + world object | 64×64px, transparent bg |
| `candle.png` | Nav icon + world object | 64×64px, transparent bg |

All icons should have white/light fill on transparent backgrounds so they can be tinted via CSS `filter`.

---

## 16. Key Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Background | CSS `background-image` | Zero JS overhead; image already has all scenery |
| Tree drawing | Canvas 2D overlay | Blends onto illustration with `multiply` composite; simpler than Three.js for 2D tree |
| Three.js | Deferred to phase 2 | Not needed for this phase; Canvas 2D achieves the goals with better performance |
| Content positions | Deterministic golden-ratio spiral within bounding zones | Same position every render; no random drift between reloads |
| Right panel width | `clamp(320px, 35vw, 460px)` | Spec requirement; leaves world visible |
| Form location | Inside right panel | No center modal; world always visible |
| Firebase sync | Zustand `useContentStore` with `onSnapshot` listeners | Live updates without polling |
