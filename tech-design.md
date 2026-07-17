# Story World Builder — Technical Design Document

## 1. Overview

A client-side-only world-building and story writing web application. Each story carries its own self-contained world: characters, locations, lore, chapters, and scenes. All data is persisted in the browser via **IndexedDB**. No backend, no authentication, no network requests.

**Stack:** SvelteKit · Tailwind CSS · TypeScript · `marked` · `@dicebear/core` + `@dicebear/avataaars` · `idb`

**Design system:** See `loreforge-branding.md` for the full design token spec, typography, colour palette, and per-story theming system.

---

## 2. Feature Summary

| Feature | Description |
|---|---|
| Stories | The top-level container; each story has its own isolated world |
| Characters | Rich character profiles with avatar builder, relationships, personality, and appearance |
| Locations | Places in the world with Markdown notes |
| Lore | Free-form world-building entries grouped by category |
| Chapters | Ordered groups of scenes |
| Scenes | Markdown writing with assigned characters and a location |
| Avatar Builder | Illustrated character creator powered by DiceBear Avataaars (client-side SVG) |
| Markdown Editor | Split-pane editor with live preview |
| Dark Mode | System-aware default, manually toggleable, persisted |

---

## 3. Data Model

### 3.1 Story
```ts
interface Story {
  id: string;
  title: string;
  synopsis: string;
  genre: string;
  theme: StoryTheme;   // Per-story accent colour — see branding doc §7
  createdAt: string;   // ISO 8601
  updatedAt: string;
}
```

### 3.2 Character
```ts
interface Character {
  id: string;
  storyId: string;

  // Core identity
  name: string;
  age: number | null;
  job: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';

  // Appearance & personality (plain text)
  appearance: string;       // Physical description
  personality: string;      // Personality traits & tendencies
  notes: string;            // Markdown — backstory, arc, secrets, etc.

  // Avatar
  avatar: AvatarOptions;    // Stored DiceBear Avataaars config (see §6)

  // Relationships — stored as outgoing edges; rendered bidirectionally in UI
  relationships: CharacterRelationship[];

  createdAt: string;
  updatedAt: string;
}

interface CharacterRelationship {
  targetCharacterId: string;
  label: string;        // e.g. "Sister", "Rival", "Mentor", "Ally"
  description: string;  // One-line context
}
```

> Relationships are stored on the character who "owns" the edge. The UI renders them bidirectionally — if Character A lists B as a "Mentor", B's profile shows A under "Related Characters" too.

### 3.3 AvatarOptions
```ts
interface AvatarOptions {
  seed: string;               // character id — used as deterministic base
  skinColor: string;          // hex, e.g. "f8d5c2"
  hairStyle: string;          // DiceBear hair option key
  hairColor: string;          // hex
  facialHairStyle: string;    // DiceBear facial hair key, or "none"
  eyeStyle: string;
  eyebrowStyle: string;
  mouthStyle: string;
  clothingStyle: string;
  clothingColor: string;
  accessoryStyle: string;     // glasses etc., or "none"
  backgroundColor: string;    // hex
}
```

### 3.4 Location
```ts
interface Location {
  id: string;
  storyId: string;
  name: string;
  type: string;         // free text: "City", "Forest", "Dungeon", etc.
  description: string;  // Plain text summary
  notes: string;        // Markdown — history, atmosphere, secrets
  createdAt: string;
  updatedAt: string;
}
```

### 3.5 LoreEntry
```ts
interface LoreEntry {
  id: string;
  storyId: string;
  title: string;
  category: string;   // Free text: "Magic System", "Factions", "History", etc.
  content: string;    // Markdown
  createdAt: string;
  updatedAt: string;
}
```

### 3.6 Chapter
```ts
interface Chapter {
  id: string;
  storyId: string;
  title: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}
```

### 3.7 Scene
```ts
interface Scene {
  id: string;
  storyId: string;
  chapterId: string;
  title: string;
  content: string;           // Markdown
  characterIds: string[];    // References Character.id
  locationId: string | null; // Reference Location.id — one per scene
  order: number;
  createdAt: string;
  updatedAt: string;
}
```

### 3.8 AppSettings
```ts
interface AppSettings {
  darkMode: boolean;
  editorFontSize: number;  // px, default 16
}
```

---

## 4. IndexedDB Schema

### Library

**`idb`** — a tiny (~1 kB) promise-based wrapper over the native IndexedDB API by Jake Archibald. Provides full TypeScript support via a `DBSchema` interface.

```bash
npm install idb
```

### Database

**Name:** `swb-db` **Version:** `1`

### Object Stores

| Store | Key path | Indexes | Description |
|---|---|---|---|
| `stories` | `id` | — | All stories |
| `characters` | `id` | `by-story` on `storyId` | Characters, looked up by story |
| `locations` | `id` | `by-story` on `storyId` | Locations, looked up by story |
| `lore` | `id` | `by-story` on `storyId` | Lore entries, looked up by story |
| `chapters` | `id` | `by-story` on `storyId` | Chapters, looked up by story |
| `scenes` | `id` | `by-story` on `storyId`, `by-chapter` on `chapterId` | Scenes, looked up by chapter |
| `settings` | `'app'` (fixed key) | — | Single `AppSettings` record |

### Schema Definition (`src/lib/db.ts`)

```ts
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Story, Character, Location, LoreEntry, Chapter, Scene, AppSettings } from './types';

interface SwbSchema extends DBSchema {
  stories:    { key: string; value: Story };
  characters: { key: string; value: Character; indexes: { 'by-story': string } };
  locations:  { key: string; value: Location;  indexes: { 'by-story': string } };
  lore:       { key: string; value: LoreEntry; indexes: { 'by-story': string } };
  chapters:   { key: string; value: Chapter;   indexes: { 'by-story': string } };
  scenes:     { key: string; value: Scene;     indexes: { 'by-story': string; 'by-chapter': string } };
  settings:   { key: string; value: AppSettings };
}

let _db: IDBPDatabase<SwbSchema>;

export async function getDb(): Promise<IDBPDatabase<SwbSchema>> {
  if (_db) return _db;
  _db = await openDB<SwbSchema>('swb-db', 1, {
    upgrade(db) {
      db.createObjectStore('stories', { keyPath: 'id' });

      const chars = db.createObjectStore('characters', { keyPath: 'id' });
      chars.createIndex('by-story', 'storyId');

      const locs = db.createObjectStore('locations', { keyPath: 'id' });
      locs.createIndex('by-story', 'storyId');

      const lore = db.createObjectStore('lore', { keyPath: 'id' });
      lore.createIndex('by-story', 'storyId');

      const chapters = db.createObjectStore('chapters', { keyPath: 'id' });
      chapters.createIndex('by-story', 'storyId');

      const scenes = db.createObjectStore('scenes', { keyPath: 'id' });
      scenes.createIndex('by-story', 'storyId');
      scenes.createIndex('by-chapter', 'chapterId');

      db.createObjectStore('settings');
    }
  });
  return _db;
}
```

### CRUD Helper Pattern

A typed helper layer wraps all IDB calls. Components and stores never touch the IDB API directly.

```ts
// Fetch all stories
export async function getAllStories(): Promise<Story[]> {
  return (await getDb()).getAll('stories');
}

// Fetch all characters for a story
export async function getCharactersByStory(storyId: string): Promise<Character[]> {
  return (await getDb()).getAllFromIndex('characters', 'by-story', storyId);
}

// Fetch all scenes for a chapter
export async function getScenesByChapter(chapterId: string): Promise<Scene[]> {
  return (await getDb()).getAllFromIndex('scenes', 'by-chapter', chapterId);
}

// Upsert (put) any entity
export async function save<S extends keyof SwbSchema>(
  store: S,
  value: SwbSchema[S]['value']
): Promise<void> {
  await (await getDb()).put(store, value as any);
}

// Delete any entity by id
export async function remove(store: keyof SwbSchema, id: string): Promise<void> {
  await (await getDb()).delete(store, id);
}

// Get/set settings (fixed key 'app')
export async function getSettings(): Promise<AppSettings | undefined> {
  return (await getDb()).get('settings', 'app');
}
export async function saveSettings(s: AppSettings): Promise<void> {
  await (await getDb()).put('settings', s, 'app');
}
```

> Avatar SVGs are generated at render time from stored `AvatarOptions` — they are never written to IndexedDB.

---

## 5. App Architecture

### 5.1 SvelteKit Routing

The homepage is the story list. Selecting a story enters its world, where the sidebar provides access to all world-building and narrative sections.

```
src/routes/
├── +layout.svelte                   # Root: dark mode class, top nav
├── +page.svelte                     # Story list (homepage)
│
└── stories/
    └── [storyId]/
        ├── +layout.svelte           # Story shell: sidebar nav
        ├── +page.svelte             # Story overview (title, synopsis, stats)
        │
        ├── characters/
        │   ├── +page.svelte         # Character gallery
        │   └── [characterId]/
        │       └── +page.svelte     # Character profile + avatar builder
        │
        ├── locations/
        │   ├── +page.svelte         # Location list
        │   └── [locationId]/
        │       └── +page.svelte     # Location detail
        │
        ├── lore/
        │   ├── +page.svelte         # Lore entries grouped by category
        │   └── [loreId]/
        │       └── +page.svelte     # Lore entry editor
        │
        ├── chapters/
        │   └── +page.svelte         # Chapter list + scene cards per chapter
        │
        └── scenes/
            └── [sceneId]/
                └── +page.svelte     # Scene editor
```

### 5.2 Story Sidebar Navigation

```
[ Story Title ]
─────────────────
  World
  ├── Characters
  ├── Locations
  └── Lore
─────────────────
  Narrative
  └── Chapters & Scenes
─────────────────
  ⚙ Story Settings
```

### 5.3 Svelte Stores

Svelte stores hold in-memory state for reactive UI. They are **populated from IndexedDB** on navigation and **written back to IndexedDB** on every mutation. Components never call IDB directly.

```
src/lib/stores/
├── stories.ts      # Story[]
├── characters.ts   # Character[]
├── locations.ts    # Location[]
├── lore.ts         # LoreEntry[]
├── chapters.ts     # Chapter[]
├── scenes.ts       # Scene[]
└── settings.ts     # AppSettings
```

**Store pattern — example: characters**

```ts
// src/lib/stores/characters.ts
import { writable } from 'svelte/store';
import { getCharactersByStory, save, remove } from '$lib/db';
import type { Character } from '$lib/types';

export const characters = writable<Character[]>([]);

/** Called from the story layout's load / onMount */
export async function loadCharacters(storyId: string) {
  const data = await getCharactersByStory(storyId);
  characters.set(data);
}

/** Upsert — updates the store and persists to IDB */
export async function saveCharacter(character: Character) {
  await save('characters', character);
  characters.update((all) => {
    const idx = all.findIndex((c) => c.id === character.id);
    return idx === -1 ? [...all, character] : all.with(idx, character);
  });
}

/** Delete — removes from store and IDB */
export async function deleteCharacter(id: string) {
  await remove('characters', id);
  characters.update((all) => all.filter((c) => c.id !== id));
}
```

All other stores follow the same pattern: `load<Entity>(storyId)`, `save<Entity>()`, `delete<Entity>()`.

### 5.4 Data Loading Strategy

IDB calls are async, so data is loaded inside `+layout.svelte` or `+page.svelte` using `onMount`:

```svelte
<!-- routes/stories/[storyId]/+layout.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { loadCharacters } from '$lib/stores/characters';
  import { loadLocations }  from '$lib/stores/locations';
  import { loadChapters }   from '$lib/stores/chapters';
  import { loadLore }       from '$lib/stores/lore';

  $: storyId = $page.params.storyId;

  onMount(async () => {
    await Promise.all([
      loadCharacters(storyId),
      loadLocations(storyId),
      loadChapters(storyId),
      loadLore(storyId),
    ]);
  });
</script>
```

Scenes are loaded lazily at the chapter/scene level rather than up front, since they carry the heaviest payload (Markdown content).

---

## 6. Avatar Builder

### Library

**`@dicebear/core`** + **`@dicebear/avataaars`** — generates illustrated SVG avatars entirely client-side, no network calls required.

```bash
npm install @dicebear/core @dicebear/avataaars
```

### Rendering

DiceBear generates a deterministic SVG from a seed + options object. The `AvatarOptions` object is stored on the character; the SVG is generated at render time and never persisted.

```ts
// src/lib/utils/avatar.ts
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/avataaars';
import type { AvatarOptions } from '$lib/types';

export function renderAvatar(opts: AvatarOptions): string {
  const avatar = createAvatar(avataaars, {
    seed: opts.seed,
    skinColor: [opts.skinColor],
    hair: [opts.hairStyle],
    hairColor: [opts.hairColor],
    facialHair: opts.facialHairStyle !== 'none' ? [opts.facialHairStyle] : [],
    eyes: [opts.eyeStyle],
    eyebrows: [opts.eyebrowStyle],
    mouth: [opts.mouthStyle],
    clothing: [opts.clothingStyle],
    clothingColor: [opts.clothingColor],
    accessories: opts.accessoryStyle !== 'none' ? [opts.accessoryStyle] : [],
    backgroundColor: [opts.backgroundColor],
  });
  return avatar.toString(); // SVG string — rendered via {@html} in Svelte
}
```

### AvatarBuilder Component

`AvatarBuilder.svelte` is a full character creator UI presented as a modal or full side panel:

| Section | Control type |
|---|---|
| Skin color | Color swatch grid |
| Hair style | Thumbnail grid (illustrations) |
| Hair color | Color swatch grid |
| Facial hair | Thumbnail grid + "None" option |
| Eyes | Thumbnail grid |
| Eyebrows | Thumbnail grid |
| Mouth | Thumbnail grid |
| Clothing style | Thumbnail grid |
| Clothing color | Color swatch grid |
| Accessories | Thumbnail grid + "None" option |
| Background color | Color swatch grid |

- **Live preview** — large SVG re-renders instantly on every change
- **Randomise** — generates a random valid `AvatarOptions` object
- **Save** — writes `avatar` back to the character in the store

---

## 7. Character Profile Page Layout

```
┌─────────────────────────────────────────────────┐
│  [Avatar — large]   Name                        │
│                     Age · Job · Role badge       │
│                     [Edit Avatar]  [Edit]        │
├──────────────┬──────────────────────────────────┤
│ Appearance   │ Personality                      │
│ (textarea)   │ (textarea)                       │
├──────────────┴──────────────────────────────────┤
│ Notes  [Markdown editor — split pane]           │
├─────────────────────────────────────────────────┤
│ Relationships                                   │
│  ┌──────────────────────────────────────────┐  │
│  │ [Avatar] Name · Label · Description  [×] │  │
│  └──────────────────────────────────────────┘  │
│  [+ Add Relationship]                          │
├─────────────────────────────────────────────────┤
│ Appears in Scenes                               │
│  Chapter 1 › Scene A   Chapter 2 › Scene B     │
└─────────────────────────────────────────────────┘
```

---

## 8. Scene Editor

- **Markdown split-pane** — raw textarea (left) + live HTML preview (right) via `marked`
- **Auto-save** — debounced 500 ms, no save button needed
- **Assignment panel** (collapsible right sidebar):
  - Character picker: scrollable list with avatar thumbnails, multi-select
  - Location picker: single-select dropdown
- **Header strip** above editor shows assigned character avatar chips + location badge

---

## 9. Dark Mode

- Default: reads `prefers-color-scheme` on first visit
- Toggled via button in the top nav; persisted in `AppSettings.darkMode`
- Tailwind `class` strategy — `dark` class applied to `<html>` in `+layout.svelte`

```js
// tailwind.config.js
export default {
  darkMode: 'class',
}
```

---

## 10. Component Map

```
src/lib/components/
├── layout/
│   ├── AppNav.svelte
│   └── StorySidebar.svelte
│
├── avatar/
│   ├── AvatarBuilder.svelte      # Full character creator UI
│   ├── AvatarPreview.svelte      # Renders SVG from AvatarOptions (any size)
│   └── AvatarThumbnail.svelte    # Small avatar chip used in lists & scene headers
│
├── character/
│   ├── CharacterCard.svelte      # Gallery card (avatar + name + role badge)
│   ├── RelationshipItem.svelte   # Single relationship row on profile
│   └── RelationshipPicker.svelte # Modal: pick character + label + description
│
├── editor/
│   ├── MarkdownEditor.svelte     # Split-pane textarea + preview
│   └── EditorToolbar.svelte      # Bold, italic, heading shortcuts
│
├── scene/
│   ├── SceneCard.svelte          # Summary card in chapter view
│   └── SceneAssignPanel.svelte   # Character multi-select + location picker
│
├── location/
│   └── LocationCard.svelte
│
├── lore/
│   └── LoreCard.svelte
│
└── ui/
    ├── Button.svelte
    ├── Modal.svelte
    ├── Badge.svelte              # Role badge, location chip, category pill
    ├── ColorSwatch.svelte        # Used in AvatarBuilder sections
    └── EmptyState.svelte
```

---

## 11. Dependencies

| Package | Purpose |
|---|---|
| `@sveltejs/kit` | Framework & routing |
| `tailwindcss` | Utility-first styling |
| `typescript` | Type safety |
| `marked` | Markdown → HTML rendering |
| `idb` | Promise-based IndexedDB wrapper |
| `@dicebear/core` | Avatar generation engine |
| `@dicebear/avataaars` | Illustrated avatar style |

No backend, no auth, no runtime network calls.

---

## 12. Project Structure

```
project-root/
├── src/
│   ├── app.html
│   ├── app.css                   # Tailwind directives + prose styles
│   ├── lib/
│   │   ├── types.ts              # All interface definitions
│   │   ├── db.ts                 # IndexedDB schema, openDB, CRUD helpers
│   │   ├── stores/               # One store file per entity type
│   │   ├── utils/
│   │   │   ├── id.ts             # crypto.randomUUID() wrapper
│   │   │   ├── date.ts           # ISO timestamp helper
│   │   │   ├── avatar.ts         # renderAvatar() via DiceBear
│   │   │   └── sort.ts           # Sort by `order` field helpers
│   │   └── components/
│   └── routes/
├── static/
├── tailwind.config.js
├── svelte.config.js
└── package.json
```

---

## 13. Future Considerations (Out of Scope v1)

- Export story + world as a single `.json` backup/restore file
- Export narrative to `.md` or `.txt`
- Word count per scene and story total
- Drag-and-drop scene and chapter reordering
- Visual character relationship graph
- Location map / world map sketcher
- Writing goals & streaks
- Schema migrations via `idb` version upgrades (increment DB version + add upgrade logic in `openDB`)
