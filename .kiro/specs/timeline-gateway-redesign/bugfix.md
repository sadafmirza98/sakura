# Bugfix Requirements Document

## Introduction

The Timeline Gateway — the wooden board on the far right of the hero artwork — is incorrectly implemented across multiple dimensions. It behaves like a generic navigation button rather than a magical portal into a shared relationship story. The board's hit zone does not precisely align with the visible artwork, its idle and hover states lack the intended depth and warmth, the click sequence opens panels instead of performing a cinematic reveal, the timeline experience itself looks like a generic software UI (cards, CRUD), memory creation is handled through a floating action button instead of the narrative "spool" mechanic, and the application-wide icon system inconsistently mixes emojis, generated SVGs, and PNG assets. This bugfix corrects all of these issues so the Timeline Gateway feels like a living, magical portal and the entire application maintains visual and tonal consistency.

---

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the page loads THEN the board hit zone (`BoardHitZone`) uses hardcoded `left: 88%` / `top: 62%` coordinates that do not precisely overlap the visible wooden board in the hero image, causing misaligned click targets.

1.2 WHEN a user hovers the board THEN there is no chalk-text transition animating "Dreams we're building" → "Our Story So Far" before fading back; the hover state only shows a static "Our Story So Far" label with no preceding state.

1.3 WHEN a user hovers the board THEN the nearby lantern element does not become brighter; the lantern brightness is unchanged.

1.4 WHEN a user clicks the board THEN the system opens a right-side panel or sidebar rather than performing the intended full-screen cinematic sequence (background darkens → camera zooms toward board → board swings forward in 3D → chalk text dissolves into particles → golden and pink threads emerge → threads weave together → timeline is revealed).

1.5 WHEN the timeline experience is revealed THEN the memory nodes are rendered as rectangular card-like elements rather than paper notes hanging and swaying from a curved red thread of fate.

1.6 WHEN a user clicks a memory note THEN a generic modal or side panel opens rather than the paper note itself unfolding to reveal the memory content inline.

1.7 WHEN a user wants to add a new memory from the timeline THEN the only entry point is a generic `+` button or floating action button, rather than a glowing golden spool near the start of the thread.

1.8 WHEN a user interacts with the memory creation spool THEN the editor appears inside a modal or popup rather than as an unfolding paper note that becomes the editor in place.

1.9 WHEN the date picker is displayed inside the memory creation form THEN the system renders the browser's native `<input type="date">` calendar, which has no visual connection to the handwritten-journal aesthetic.

1.10 WHEN a new memory is saved THEN the paper note does not fold itself and attach to the thread; there is no glowing thread response, brightening stars, or shimmering lanterns — the save action feels like a generic form submission.

1.11 WHEN a memory is marked as a milestone THEN it renders identically to non-milestone memories; no larger note size, no decorative ribbon, and no additional particle emission distinguishes it as a major anchor on the timeline.

1.12 WHEN content is added via Songs, Places, or Letters sections THEN the timeline does not automatically receive a corresponding timeline event, breaking the concept of the timeline as the central story of the relationship.

1.13 WHEN icons are rendered throughout the application THEN the system uses emojis (🏮, 💕, 🌸, ✦, etc.), generated SVG placeholders, and Lucide icon library components (`Plus`, `Search`, `Heart`, `Grid`, `List`, `Trash2`) interchangeably with PNG assets, producing visual inconsistency.

1.14 WHEN category icons are displayed THEN Wishes use `wish-blossom.png` instead of `lantern.png`, Poems use `sakura.png` instead of `letter.png`, Memories use `sakura.png` instead of `memories.png`, Places use `lantern.png` instead of `map.png`, and Songs use `petal.png` (correct) — the mapping is partially incorrect.

1.15 WHEN icons are rendered THEN they appear inside circular containers, with white backgrounds, or inside generic button containers rather than as bare PNG artwork that is itself the interactive object.

1.16 WHEN modals, detail views, or editors are opened for a category THEN the category's designated PNG asset is not displayed inside the view as a contextual icon (e.g., Songs modal does not show `petals.png`, Wish modal does not show `lantern.png`).

---

### Expected Behavior (Correct)

2.1 WHEN the page loads THEN the board hit zone SHALL precisely overlap the visible wooden board in the hero image using starting values `left: 95%`, `top: 72%`, `transform: translate(-50%, -50%)`, `width: 180px`, `height: 340px`, with a temporary `border: 2px solid red` aid during alignment, removed only after confirmed pixel-perfect match.

2.2 WHEN a user hovers the board THEN the chalk writing SHALL slowly transition from "Dreams we're building" to "Our Story So Far" and then fade back, creating a sense of the board becoming aware of the viewer.

2.3 WHEN a user hovers the board THEN the nearby lantern element in the artwork SHALL visually brighten (e.g., increased filter brightness or a warm glow overlay) to reinforce the feeling of invitation.

2.4 WHEN a user clicks the board THEN the system SHALL perform the full cinematic sequence: background darkens slightly → camera slowly zooms toward the board → board swings forward with a subtle 3D perspective transform → chalk text dissolves into glowing particles → golden and pink threads emerge from the board → threads weave together → the timeline experience is revealed. No panel, sidebar, or modal SHALL open.

2.5 WHEN the timeline experience is revealed THEN the memories SHALL be rendered as paper notes hanging from a naturally curving (not straight, not perfectly symmetrical) thread of fate, each note swaying gently like paper on a string.

2.6 WHEN a user clicks a memory note THEN the paper note itself SHALL unfold in place to reveal the memory content — photos, voice notes, stories, songs, related places — without opening any modal, side panel, or separate view.

2.7 WHEN a user wants to add a new memory from the timeline THEN the system SHALL present a glowing golden spool wrapped in sakura-coloured thread near the beginning of the timeline thread as the sole entry point for creating memories.

2.8 WHEN a user clicks the memory creation spool THEN the spool SHALL slowly unravel → a blank paper note SHALL slide onto the thread → the note SHALL unfold to become the editor in place, with fields for Memory Title, Date, Story, Photos, Voice Note, Tags, Related Song, Related Place, and Milestone Toggle. No modal, popup, or side panel SHALL appear.

2.9 WHEN the date picker is displayed inside the memory creation form THEN the system SHALL render a custom date picker styled as a handwritten journal with soft golden glow, sakura accents, and elegant animations. The browser's native `<input type="date">` SHALL NOT be used.

2.10 WHEN a new memory is saved THEN the system SHALL animate the paper folding → the note attaching to the thread → the thread glowing → nearby stars brightening → nearby lanterns shimmering, so the memory visually becomes part of the relationship story.

2.11 WHEN a memory is marked as a milestone THEN the note SHALL render larger with a decorative ribbon, SHALL emit additional particles, and SHALL act as a major visual anchor on the timeline distinguishable from ordinary memories.

2.12 WHEN content is added via Songs, Places, or Letters sections THEN the system SHALL automatically create a corresponding timeline event, so the timeline becomes the central and comprehensive story of the relationship.

2.13 WHEN icons are rendered throughout the application THEN the system SHALL use only the provided PNG assets from `/public/assets/ui/`, with no emojis, no generated SVG placeholders, and no Lucide icon components used for category representation.

2.14 WHEN category icons are displayed THEN the system SHALL use the correct asset mapping: Memories → `memories.png`, Songs → `petals.png`, Places → `map.png`, Wishes → `lantern.png`, Poems → `letter.png`.

2.15 WHEN icons are rendered THEN they SHALL appear as bare PNG artwork with no circular containers, no white backgrounds, and no generic button wrappers; the PNG artwork itself SHALL be the interactive object with hover states of soft glow and small scale increase.

2.16 WHEN modals, detail views, or editors are opened for a category THEN the category's designated PNG asset SHALL be displayed inside the view as a contextual icon (Songs → `petals.png`, Places → `map.png`, Wishes → `lantern.png`, Poems → `letter.png`, Memories → `memories.png`).

---

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user clicks the magic book in the hero artwork THEN the system SHALL CONTINUE TO open the bloom ring with the six category objects (Poems, Wishes, Places, Memories, Songs, Letters) radiating from the book.

3.2 WHEN a user selects a category from the bloom ring THEN the system SHALL CONTINUE TO open the correct creation form for that category.

3.3 WHEN the user is authenticated THEN the system SHALL CONTINUE TO display the home garden page (`/home`) with the hero background, particle canvas, world canvas, and HUD.

3.4 WHEN Firestore listeners are initialised THEN the system SHALL CONTINUE TO sync all nine content collections (memories, songs, poems, whispers, letters, wishes, places, evenings, dreams) in real time.

3.5 WHEN a memory, song, poem, letter, wish, or place is created THEN the system SHALL CONTINUE TO persist the item to Firestore and optimistically append it to the local store.

3.6 WHEN a user presses Escape while the bloom ring is open THEN the system SHALL CONTINUE TO close the bloom ring.

3.7 WHEN a user presses Escape while the timeline is open THEN the system SHALL CONTINUE TO close the timeline and return to the garden.

3.8 WHEN the board hit zone is not hovered and the timeline is closed THEN the system SHALL CONTINUE TO show idle memory notes (e.g., "06 Dec 2020", "First Conversation", "Engagement") briefly appearing every 10 seconds with a soft fade-in and fade-out.

3.9 WHEN the timeline is open and a memory node is selected THEN closing the memory detail SHALL CONTINUE TO return focus to the timeline without closing it.

3.10 WHEN the application is viewed on a mobile or narrow viewport THEN existing responsive layout behaviours SHALL CONTINUE TO function correctly.
