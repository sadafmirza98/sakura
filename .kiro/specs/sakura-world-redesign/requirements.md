# Requirements Document

## Introduction

The Sakura World Redesign transforms the existing Sakura application — a private web app for two people in love — from a visually attractive but emotionally flat dashboard into a living magical garden world. The Sakura Tree becomes the primary navigation system and occupies 70% of visual attention. Every piece of content (memories, songs, poems, whispers, letters, wishes, places, movies, dreams) manifests as a living element in the garden: blossoms, lanterns, petals, leaves, paper cranes, buds, stepping stones, stars, and constellations. The experience should feel like entering a secret garden at twilight — more like exploring a world than browsing a website — drawing aesthetic inspiration from Studio Ghibli, Makoto Shinkai, Journey, Monument Valley, and Apple luxury interaction design.

The tech stack is Next.js 16, TypeScript, Tailwind CSS v4, Framer Motion, Zustand, Firebase, and Three.js (to be added for selective use).

---

## Glossary

- **Garden_World**: The full-screen immersive canvas environment that hosts all visual elements of the redesigned application.
- **Sakura_Tree**: The central Three.js interactive tree that serves as the primary navigation system and grows procedurally with content.
- **Blossom**: A visual flower node on the Sakura_Tree representing one Memory entry.
- **Lantern**: A glowing hanging light element on the Sakura_Tree representing one Song entry.
- **Petal**: A drifting 2D particle element in the Garden_World representing one Poem entry.
- **Leaf**: A floating foliage element near the lower branches of the Sakura_Tree representing one Whisper entry.
- **Paper_Crane**: A paper origami crane element in the Garden_World representing one Letter entry; locked cranes glow, unlocked cranes animate toward the viewer.
- **Bud**: A flower bud node on the Sakura_Tree representing one Wish entry; completed wishes display as open blooms.
- **Stepping_Stone**: A garden path stone element representing one Footprint (Place) entry.
- **Star**: A celestial point in the night sky layer of the Garden_World representing one Evening (Movie/Show) entry.
- **Constellation**: A connected star-group in the night sky layer representing one Shared Dream entry.
- **Pavilion**: The hidden Comfort Space sanctuary structure within the Garden_World.
- **Quick_Create_Dock**: A bottom-center floating glass dock providing shortcuts to create new content entries.
- **Context_Panel**: A right-side overlay panel that reveals detail content when a Garden_World element is selected.
- **Floating_Nav**: A minimal left-side floating navigation strip that replaces the existing full sidebar.
- **Camera**: The virtual viewpoint within the Garden_World, capable of smooth zoom and pan transitions.
- **Particle_System**: The Three.js or Canvas-based system driving animated petals, fireflies, atmospheric fog, and star particles.
- **Content_Renderer**: The subsystem responsible for mapping Firebase data records to their corresponding Garden_World elements.
- **Mood_Color**: A color value that conveys emotional tone for Lanterns — Pink=Love, Blue=Comfort, Purple=Dreams, Gold=Milestones.

---

## Requirements

### Requirement 1: Garden World Layout

**User Story:** As a user of Sakura, I want a full-screen immersive garden world layout, so that entering the app feels like stepping into a secret garden rather than opening a website dashboard.

#### Acceptance Criteria

1. THE Garden_World SHALL occupy 100% of the viewport width and height with no scroll on the primary view.
2. THE Sakura_Tree SHALL occupy at least 70% of the viewport's visual surface area on desktop screens (≥1024px wide).
3. THE Floating_Nav SHALL be positioned on the left side as a translucent minimal strip, consuming no more than 48px of width when collapsed.
4. THE Context_Panel SHALL be positioned on the right side and remain hidden until a Garden_World element is selected.
5. THE Quick_Create_Dock SHALL be positioned at the bottom center and float above the Garden_World with a frosted-glass visual style.
6. WHEN the viewport width is less than 768px, THE Garden_World SHALL reflow into a vertically scrollable single-column layout with the Sakura_Tree rendered at full width and the Quick_Create_Dock pinned to the bottom.
7. THE Garden_World SHALL NOT display a traditional dashboard, sidebar-heavy layout, or card-grid interface.

---

### Requirement 2: Living Background World

**User Story:** As a user, I want the garden background to feel alive and atmospheric, so that the world communicates mood and magic even when I am not interacting with anything.

#### Acceptance Criteria

1. THE Garden_World SHALL render a moonlit river, a small bridge silhouette, garden pathways, mountain silhouettes, and atmospheric fog as persistent background layers.
2. THE Particle_System SHALL continuously animate falling sakura petals at a rate of between 8 and 20 visible petals at any time.
3. THE Particle_System SHALL animate between 5 and 15 firefly particles in the lower garden area, each glowing with a soft warm-yellow pulse.
4. THE Garden_World SHALL render occasional shooting stars at a randomized interval of between 180 and 600 frames.
5. THE Garden_World SHALL render animated water reflections in the river area that mirror the lighting above them.
6. WHEN the time of day on the user's device is between 20:00 and 06:00, THE Garden_World SHALL apply a deeper night-sky color palette; otherwise THE Garden_World SHALL apply a twilight dusk palette.
7. THE Garden_World SHALL maintain a target rendering frame rate of 60fps on desktop devices and 45fps on mobile devices under normal content load.
8. THE Garden_World SHALL NOT use generic fade-in/fade-out page transitions.

---

### Requirement 3: Interactive Sakura Tree as Navigation

**User Story:** As a user, I want to navigate the app by interacting with the Sakura Tree, so that finding my memories feels like exploring a living world rather than clicking menu items.

#### Acceptance Criteria

1. THE Sakura_Tree SHALL be rendered using Three.js as an interactive 3D object centered in the Garden_World.
2. THE Sakura_Tree SHALL support Camera zoom and pan interactions via mouse drag on desktop and pinch/swipe gestures on mobile.
3. WHEN a Blossom is clicked, THE Camera SHALL smoothly animate toward the selected Blossom, the Blossom SHALL unfold with a bloom animation, and THE Context_Panel SHALL open displaying the corresponding Memory.
4. WHEN a Lantern is clicked, THE Context_Panel SHALL open as a floating music scene displaying the Song's album art, title, emotional note, associated photos, and embedded player.
5. WHEN a Petal is clicked, THE Context_Panel SHALL open displaying a handwritten poem card with paper texture and ink-reveal animation.
6. WHEN a Leaf is clicked, THE Context_Panel SHALL open displaying the Whisper message.
7. WHEN a Paper_Crane is clicked and the Letter is locked, THE Paper_Crane SHALL pulse glow but SHALL NOT open the Context_Panel.
8. WHEN a Paper_Crane is clicked and the Letter is unlocked, THE Paper_Crane SHALL animate flying toward the Camera before THE Context_Panel opens.
9. WHEN a Bud is clicked, THE Context_Panel SHALL open displaying the Wish entry; completed Wishes SHALL render as open blooms rather than buds.
10. WHEN a Stepping_Stone is clicked, THE Context_Panel SHALL open displaying the Place's photos, map, and travel notes.
11. WHEN a Star is clicked, THE Context_Panel SHALL open displaying the Evening entry; watched Stars SHALL render brighter than unwatched Stars.
12. WHEN a Constellation is clicked, THE Context_Panel SHALL open displaying the Shared Dream with its connected goal lines.
13. THE Sakura_Tree SHALL support direct deep-linking via the existing route paths (/memories, /soundtrack, /petals, /leaves, /letters, /wishes, /footprints, /evenings, /dreams) so that navigating to a route focuses the Camera on the corresponding element type.
14. WHEN the Context_Panel is closed, THE Camera SHALL animate back to the default Garden_World overview position.

---

### Requirement 4: Procedural Tree Growth

**User Story:** As a user, I want the Sakura Tree to grow visually as I add content over time, so that the tree feels like a living record of our relationship.

#### Acceptance Criteria

1. THE Sakura_Tree SHALL derive its branch count, canopy radius, and Blossom density from the total count of Memory entries in Firebase.
2. WHEN the Memory count increases by 10, THE Sakura_Tree SHALL add at least one new visible branch segment with a growth animation lasting between 1000ms and 2500ms.
3. THE Sakura_Tree SHALL render Blossoms proportional to the Memory count, with a maximum of 200 Blossoms visible at one time.
4. WHEN the relationship anniversary date matches today's date, THE Sakura_Tree SHALL render golden Blossoms on the three most recently added Memories and apply a gold glow effect to the canopy.
5. THE Sakura_Tree SHALL never appear fully grown; the branch algorithm SHALL leave structural space for future growth at all content levels.
6. THE Sakura_Tree SHALL NOT remain visually static between sessions; each session SHALL re-evaluate current content counts and apply any pending growth before first render.
7. WHEN the Wish count of completed Wishes increases, THE Sakura_Tree SHALL animate the corresponding Buds blooming into open flowers.

---

### Requirement 5: Memory Blossoms

**User Story:** As a user, I want clicking a memory's blossom to transport me into that memory, so that recalling moments feels like entering them rather than reading a list.

#### Acceptance Criteria

1. WHEN a Blossom is activated, THE Camera SHALL zoom toward the Blossom using a cinematic ease-in animation completing within 800ms.
2. THE Context_Panel SHALL display a Memory card containing: one or more photos or videos, voice note player (if present), associated songs, written notes, date, location, tags, and linked related memories.
3. THE Context_Panel SHALL support inline video playback without navigating away from the Garden_World.
4. WHEN the Context_Panel is dismissed, THE Camera SHALL animate back to the pre-zoom position using a reverse ease-out completing within 600ms.
5. IF a Memory contains no media, THEN THE Context_Panel SHALL still render the date, notes, and tags without empty placeholder regions.
6. THE Context_Panel SHALL display a "Related Memories" section that links to other Blossom nodes by tag overlap.

---

### Requirement 6: Song Lanterns

**User Story:** As a user, I want songs to appear as hanging lanterns on the tree, so that our soundtrack feels woven into the world rather than listed in a separate page.

#### Acceptance Criteria

1. THE Sakura_Tree SHALL render one Lantern per Song entry, hanging from branch nodes.
2. THE Lantern SHALL display a Mood_Color glow corresponding to the Song's assigned mood tag: Pink for Love, Blue for Comfort, Purple for Dreams, Gold for Milestones.
3. WHEN a Lantern is clicked, THE Context_Panel SHALL open as a floating music scene with the Song's album art, title, the user's note on why the song matters, associated photos and memories, and an embedded media player.
4. THE embedded media player SHALL support both YouTube and Spotify URLs.
5. IF a Song has no mood tag assigned, THEN THE Lantern SHALL default to a soft white glow.
6. THE Lantern SHALL animate a slow warm pulse glow continuously while in the Garden_World view.

---

### Requirement 7: Poem Petals

**User Story:** As a user, I want poems to appear as drifting petals around the tree, so that written words feel like they are floating in the air around us.

#### Acceptance Criteria

1. THE Particle_System SHALL render one Petal particle per Poem entry, drifting in the space around the Sakura_Tree.
2. WHEN a Petal is clicked, THE Context_Panel SHALL open displaying a poem card styled with a soft paper texture background and an ink-reveal animation that progressively shows the poem text.
3. THE ink-reveal animation SHALL complete the full poem text display within 2000ms.
4. THE Petal SHALL visually distinguish itself from background ambient petals by size (at least 1.5x larger) and a subtle inner glow.
5. IF a Poem entry is deleted, THEN the corresponding Petal SHALL fade out of the Particle_System within 500ms.

---

### Requirement 8: Whisper Leaves

**User Story:** As a user, I want whispered messages to appear as leaves near the lower branches, so that intimate short messages feel grounded and gentle in the world.

#### Acceptance Criteria

1. THE Sakura_Tree SHALL render one Leaf element per Whisper entry, floating near the lower branch nodes.
2. WHEN a Leaf is clicked, THE Context_Panel SHALL open and display the Whisper message text with the date it was written.
3. THE Leaf SHALL animate a gentle swaying motion continuously in the Garden_World.
4. IF a Whisper entry is deleted, THEN the corresponding Leaf SHALL detach with a falling animation before disappearing.

---

### Requirement 9: Sealed Petal Letters (Paper Cranes)

**User Story:** As a user, I want future letters to appear as paper cranes, so that the sense of a sealed message waiting to be opened feels tangible and magical.

#### Acceptance Criteria

1. THE Garden_World SHALL render one Paper_Crane per Letter entry, positioned within the garden near the Sakura_Tree base.
2. WHEN a Paper_Crane represents a locked Letter (unlock date not yet reached), THE Paper_Crane SHALL glow softly and SHALL NOT reveal its contents when clicked.
3. WHEN a Paper_Crane represents an unlocked Letter (unlock date reached or no lock date), THE Paper_Crane SHALL animate flying toward the Camera before THE Context_Panel opens with the letter content.
4. THE Context_Panel for an unlocked Letter SHALL render the letter text in a styled paper-and-ink format with the sender's name and date.
5. THE Garden_World SHALL visually distinguish locked Paper_Cranes from unlocked ones through glow color: locked cranes use a cool silver-blue glow, unlocked cranes use a warm gold glow.

---

### Requirement 10: Spring Wish Buds

**User Story:** As a user, I want bucket list wishes to appear as buds on the tree that bloom when completed, so that achieving a dream feels like watching something beautiful come to life.

#### Acceptance Criteria

1. THE Sakura_Tree SHALL render one Bud node per Wish entry on branch tips.
2. WHEN a Wish is marked as completed, THE Bud SHALL animate blooming into a full Blossom over 1200ms.
3. THE completed Wish Blossom SHALL display in a distinct warm-cream color to visually differentiate it from Memory Blossoms.
4. WHEN a Bud is clicked, THE Context_Panel SHALL display the Wish title, description, created date, and completion status.
5. THE Sakura_Tree SHALL display the ratio of completed to total Wishes as a visible growth state — a tree with many completed Wishes SHALL appear more fully blossomed.

---

### Requirement 11: Footprint Stepping Stones

**User Story:** As a user, I want visited places to appear as stepping stones in the garden, so that our travels feel like a path we have walked together.

#### Acceptance Criteria

1. THE Garden_World SHALL render one Stepping_Stone per Footprint entry along garden pathway areas below the Sakura_Tree.
2. WHEN a Stepping_Stone is clicked, THE Context_Panel SHALL open displaying the Place's name, associated photos, embedded map (or coordinates), travel notes, and related Memory links.
3. THE Stepping_Stone SHALL display a small representative label or icon for the place name on hover.
4. IF a Footprint entry has associated photos, THEN the Stepping_Stone SHALL display a thumbnail glow effect from the first photo.

---

### Requirement 12: Evening Stars

**User Story:** As a user, I want movies and shows to appear as stars in the night sky, so that our shared viewing experiences feel like part of the world above us.

#### Acceptance Criteria

1. THE Garden_World night-sky layer SHALL render one Star per Evening entry.
2. WHEN an Evening entry is marked as watched, THE Star SHALL render at full brightness; WHEN marked as unwatched/planned, THE Star SHALL render at 40% brightness.
3. WHEN a Star is clicked, THE Context_Panel SHALL open displaying the Evening's title, poster image, rating, review note, watch date, and streaming link.
4. THE Star SHALL animate a slow twinkle at a randomized rate between 2s and 8s per cycle.
5. THE Garden_World SHALL group Stars by genre tag into loose visual clusters in the sky layer.

---

### Requirement 13: Shared Dream Constellations

**User Story:** As a user, I want shared goals to appear as constellations, so that our future feels like a sky full of stars we are drawing lines between.

#### Acceptance Criteria

1. THE Garden_World night-sky layer SHALL render Shared Dream entries as connected Constellation shapes, with each goal as a Star node and lines connecting related goals.
2. WHEN a Dream goal is marked as achieved, THE corresponding Star node SHALL increase in brightness and the connecting lines SHALL animate a golden pulse.
3. WHEN a Constellation is clicked, THE Context_Panel SHALL open displaying all Dream goals, their completion states, and target dates.
4. THE Garden_World SHALL render at least three distinct Constellation shapes for visual variety when three or more Shared Dream entries exist.
5. IF a Shared Dream entry has only one goal node, THEN THE Garden_World SHALL render it as a single bright Star without connecting lines.

---

### Requirement 14: Comfort Pavilion

**User Story:** As a user, I want a hidden sanctuary space within the garden, so that on hard days I can enter a place that feels safe, warm, and filled with everything comforting.

#### Acceptance Criteria

1. THE Garden_World SHALL render the Pavilion as a small glowing structure partially visible in one corner of the garden, accessible by clicking it or navigating to /comfort.
2. WHEN the Pavilion is entered, THE Garden_World SHALL transition the ambient lighting to warm soft tones and slow all animations to a gentle pace within 800ms.
3. THE Pavilion view SHALL display: favorite tagged Memories, voice note player for comfort voice notes, comfort Letters, curated photos, and an encouragement message section.
4. THE Pavilion SHALL NOT display navigation clutter, action buttons, or create prompts — the space is read-only and contemplative.
5. THE Pavilion entry transition SHALL use a cinematic soft-glow door-opening animation rather than a page navigation transition.

---

### Requirement 15: Quick Create Dock

**User Story:** As a user, I want a quick-access creation dock, so that capturing a new memory, song, poem, or wish feels immediate and never pulls me out of the world.

#### Acceptance Criteria

1. THE Quick_Create_Dock SHALL provide creation shortcuts for: Add Memory, Add Song, Write Petal (Poem), Write Whisper, Add Wish, and Add Place.
2. THE Quick_Create_Dock SHALL use a frosted glass visual style illuminated by warm lantern-light color, floating above the Garden_World at all times.
3. WHEN a Quick_Create_Dock action is triggered, THE Garden_World SHALL open a focused creation modal within the current view without full-page navigation.
4. THE Quick_Create_Dock SHALL animate expanding from a compact icon cluster to labeled buttons when hovered on desktop or tapped on mobile.
5. WHEN a new content entry is successfully created, THE Quick_Create_Dock SHALL collapse and the Garden_World SHALL animate the appearance of the new corresponding element (Blossom, Lantern, Petal, etc.) using a particle-burst entrance animation.

---

### Requirement 16: Cinematic Transitions

**User Story:** As a user, I want every interaction to feel cinematic and purposeful, so that the app never feels mechanical or like a regular web product.

#### Acceptance Criteria

1. THE Garden_World SHALL NOT use generic opacity fade transitions for element reveals.
2. WHEN any Garden_World element is opened, THE Camera SHALL use a smooth zoom or drift animation toward the element over a duration of 500ms to 1200ms.
3. WHEN the Context_Panel opens, THE Garden_World SHALL apply a soft depth-of-field blur to elements behind the panel.
4. WHEN a new content element is created, THE Garden_World SHALL play a particle-burst animation at the element's position.
5. THE Quick_Create_Dock entry animations SHALL use a petal-trail motion path rather than linear slide-in.
6. WHEN navigating between sections via Floating_Nav, THE Camera SHALL drift to the relevant region of the Garden_World rather than performing a hard route transition.

---

### Requirement 17: Three.js Performance Boundaries

**User Story:** As a developer, I want Three.js usage scoped to specific high-value visual elements, so that the application remains performant and production-ready.

#### Acceptance Criteria

1. THE Garden_World SHALL use Three.js exclusively for: the interactive Sakura_Tree geometry, Particle_System for petals and fireflies, Star and Constellation rendering, Lantern glow geometry, and water reflection surface.
2. THE Garden_World SHALL implement level-of-detail reduction for the Sakura_Tree when the viewport is smaller than 768px, reducing branch geometry complexity by at least 40%.
3. THE Garden_World SHALL pause Particle_System animations when the browser tab is not visible (document.hidden === true).
4. THE Garden_World SHALL cap the Particle_System at 150 simultaneous particles across all types on desktop and 60 on mobile.
5. WHEN the browser reports a hardware concurrency of less than 4, THE Garden_World SHALL automatically reduce Three.js render quality to a lower preset.
6. THE Garden_World SHALL NOT use Three.js for elements that can be achieved with CSS, Canvas 2D API, or Framer Motion without visible quality loss.

---

### Requirement 18: Floating Navigation

**User Story:** As a user, I want minimal floating navigation that does not distract from the garden world, so that I can move between sections without the navigation dominating my view.

#### Acceptance Criteria

1. THE Floating_Nav SHALL display route icons for all 12 existing routes (/home, /story, /memories, /soundtrack, /petals, /leaves, /letters, /wishes, /footprints, /evenings, /dreams, /comfort).
2. THE Floating_Nav SHALL default to collapsed icon-only state and expand to show labels on hover with an animation under 200ms.
3. THE Floating_Nav SHALL apply a translucent backdrop blur style consistent with the Garden_World aesthetic.
4. WHEN a Floating_Nav item is activated, THE Camera SHALL navigate to the corresponding Garden_World region with a smooth drift animation rather than a hard page reload.
5. THE Floating_Nav SHALL highlight the currently active section using a soft glow indicator rather than a solid background bar.
6. ON mobile (viewport < 768px), THE Floating_Nav SHALL collapse into a single trigger button that opens a full-screen semi-transparent overlay menu.

---

### Requirement 19: Context Panel

**User Story:** As a user, I want a contextual detail panel that feels like part of the world, so that reading a memory or listening to a song does not pull me out of the garden.

#### Acceptance Criteria

1. THE Context_Panel SHALL slide in from the right side with a cinematic ease animation completing within 400ms.
2. THE Context_Panel SHALL apply a frosted glass background that allows the Garden_World to remain partially visible behind it.
3. THE Context_Panel SHALL be dismissible by clicking outside the panel, pressing Escape, or clicking a close affordance.
4. THE Context_Panel SHALL adapt its content layout based on the type of element selected (Memory, Song, Poem, Whisper, Letter, Wish, Place, Evening, Dream).
5. IF the Context_Panel content includes media (photos, video, voice notes), THEN THE Context_Panel SHALL display media in a focused inline gallery without navigating away.
6. THE Context_Panel SHALL support editing the displayed entry via an edit affordance that transitions to an inline edit form without closing the panel.

---

### Requirement 20: Data and State Continuity

**User Story:** As a developer, I want the redesigned UI to remain fully connected to the existing Firebase data layer and Zustand store, so that no content data is lost or requires migration.

#### Acceptance Criteria

1. THE Content_Renderer SHALL read all content data from the existing Firebase Firestore collections without requiring schema changes.
2. THE Garden_World tree growth state SHALL be derived from the blossomCount and relationshipStartDate values in the Zustand store.
3. WHEN content is added or deleted via the Quick_Create_Dock, THE Content_Renderer SHALL update the corresponding Firebase collection and THE Garden_World SHALL reflect the change without requiring a full page reload.
4. THE Content_Renderer SHALL maintain a local Zustand cache of content counts per type so that tree and element counts are available synchronously on mount without waiting for a Firestore fetch.
5. THE Garden_World SHALL preserve the existing authentication flow — only authenticated users SHALL access the garden, and THE EntryScreen component SHALL remain the gate.
