# Loreforge — Branding & Design System

## 1. Identity

| | |
|---|---|
| **App name** | Loreforge |
| **Tagline** | *Build worlds. Tell stories.* |
| **Personality** | Creative, focused, slightly literary — not playful, not corporate |
| **Logo concept** | A stylised anvil merged with a quill nib. Wordmark in serif for "Lore", sans-serif weight for "forge" to contrast craft with structure |

---

## 2. Global Color Palette

The global palette is genre-neutral — dark, editorial, warm-neutral. Story-specific accent colors layer on top (see §7).

### 2.1 Light Mode

| Token | Hex | Usage |
|---|---|---|
| `--color-bg` | `#F7F5F2` | Page background — warm off-white, not stark |
| `--color-surface` | `#FFFFFF` | Cards, panels, modals |
| `--color-surface-raised` | `#EFEDE9` | Sidebar, secondary panels |
| `--color-border` | `#DDD9D3` | Dividers, input borders |
| `--color-text-primary` | `#1A1814` | Body copy, headings |
| `--color-text-secondary` | `#6B6760` | Labels, meta, placeholders |
| `--color-text-disabled` | `#B0ADA8` | Disabled states |

### 2.2 Dark Mode

| Token | Hex | Usage |
|---|---|---|
| `--color-bg` | `#141210` | Page background — near-black with warmth |
| `--color-surface` | `#1E1C19` | Cards, panels, modals |
| `--color-surface-raised` | `#272420` | Sidebar, secondary panels |
| `--color-border` | `#333028` | Dividers, input borders |
| `--color-text-primary` | `#F0EDE8` | Body copy, headings |
| `--color-text-secondary` | `#8C8880` | Labels, meta, placeholders |
| `--color-text-disabled` | `#4A4843` | Disabled states |

### 2.3 Semantic Tokens (mode-agnostic)

| Token | Purpose |
|---|---|
| `--color-accent` | Primary interactive colour — set globally then overridden per story |
| `--color-accent-soft` | 15% opacity tint of accent — used for tag backgrounds, active nav items |
| `--color-accent-text` | Text drawn on a solid accent background (always check contrast) |
| `--color-danger` | `#C0392B` — destructive actions |
| `--color-success` | `#2E7D5E` — save confirmation, streaks |

---

## 3. Typography

### Fonts

| Role | Family | Weights | Source |
|---|---|---|---|
| **Display / Headings** | `Crimson Pro` | 400, 600 | Google Fonts — serif, editorial, literary |
| **UI / Body** | `Inter` | 400, 500, 600 | Google Fonts — neutral, legible at small sizes |
| **Editor (mono)** | `JetBrains Mono` | 400 | Google Fonts — Markdown source pane |

### Type Scale

| Token | Size | Line height | Font | Usage |
|---|---|---|---|---|
| `--text-4xl` | 2.25rem | 1.2 | Crimson Pro 600 | Story title, hero headings |
| `--text-3xl` | 1.875rem | 1.25 | Crimson Pro 600 | Page headings (Characters, Locations) |
| `--text-2xl` | 1.5rem | 1.3 | Crimson Pro 400 | Section headings, character names |
| `--text-xl` | 1.25rem | 1.4 | Inter 500 | Card titles, sidebar section labels |
| `--text-base` | 1rem | 1.6 | Inter 400 | Body copy, inputs |
| `--text-sm` | 0.875rem | 1.5 | Inter 400 | Meta, badges, labels |
| `--text-xs` | 0.75rem | 1.4 | Inter 500 | Uppercase tags, timestamps |

### Editor Prose Styles

The Markdown preview pane uses `@tailwindcss/typography` (`prose` class) with overrides:

- Preview font: `Crimson Pro`, 1.125rem, line-height 1.8 (optimised for reading)
- Editor font: `JetBrains Mono`, configurable size (default 16px, stored in `AppSettings`)
- Code blocks within prose: `JetBrains Mono`, surface-raised background

---

## 4. Spacing

8-point base grid. All spacing values are multiples of 4px.

| Token | Value | Common use |
|---|---|---|
| `--space-1` | 4px | Icon padding, tight gaps |
| `--space-2` | 8px | Inner component padding |
| `--space-3` | 12px | Input padding, badge padding |
| `--space-4` | 16px | Card padding, list item spacing |
| `--space-6` | 24px | Section gaps |
| `--space-8` | 32px | Page section padding |
| `--space-12` | 48px | Large section breaks |

---

## 5. Shape & Elevation

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 4px | Badges, tags, small chips |
| `--radius-md` | 8px | Inputs, buttons, small cards |
| `--radius-lg` | 12px | Cards, panels |
| `--radius-xl` | 16px | Modals, drawers |
| `--radius-full` | 9999px | Avatar thumbnails, pill badges |

### Shadows (light mode; dark mode uses border + opacity instead)

| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.08)` | Cards at rest |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.1)` | Dropdowns, hover cards |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` | Modals |

---

## 6. Component Tokens

### Buttons

| Variant | Background | Text | Border |
|---|---|---|---|
| Primary | `--color-accent` | `--color-accent-text` | none |
| Secondary | `--color-surface-raised` | `--color-text-primary` | `--color-border` |
| Ghost | transparent | `--color-text-secondary` | none |
| Danger | `--color-danger` | white | none |

All buttons: `--radius-md`, `--space-3` horizontal padding, `--space-2` vertical, Inter 500.

### Badges / Role Chips

| Role | Background | Text |
|---|---|---|
| Protagonist | accent-soft | accent |
| Antagonist | `#FEE2E2` / `#3B1010` dark | `#991B1B` / `#FCA5A5` |
| Supporting | `#EDE9FE` / `#2D1F4E` dark | `#6D28D9` / `#C4B5FD` |
| Minor | `--color-surface-raised` | `--color-text-secondary` |

### Cards

- Background: `--color-surface`
- Border: 1px `--color-border`
- Radius: `--radius-lg`
- Shadow: `--shadow-sm`
- Hover: shadow lifts to `--shadow-md`, border shifts to `--color-accent` at 40% opacity

---

## 7. Per-Story Theming

Each story has its own accent colour palette that overrides the global `--color-accent` family within the story shell. The rest of the design system (backgrounds, text, spacing, type) stays constant — only the accent changes.

### 7.1 StoryTheme — Data Model

```ts
interface StoryTheme {
  preset: StoryThemePreset | 'custom';
  // If preset is 'custom', the values below are used directly.
  // If a named preset is selected, these are derived from it at render time.
  accentLight: string;    // hex — accent in light mode
  accentDark: string;     // hex — accent in dark mode
  accentSoft: string;     // hex — 15% tint background (light mode)
  accentSoftDark: string; // hex — 15% tint background (dark mode)
  accentText: string;     // hex — text on solid accent (must pass WCAG AA)
}

type StoryThemePreset =
  | 'crimson'   // Deep red — drama, dark fantasy
  | 'ocean'     // Blue-teal — mystery, sci-fi
  | 'forest'    // Muted green — adventure, nature
  | 'dusk'      // Violet-purple — magic, gothic
  | 'ember'     // Warm amber — steampunk, warmth
  | 'slate';    // Cool gray-blue — contemporary, thriller
```

Story interface gains a `theme` field:

```ts
interface Story {
  // ... existing fields
  theme: StoryTheme;
}
```

Default theme applied to every new story: `preset: 'forest'`.

### 7.2 Preset Definitions

| Preset | Light accent | Dark accent | Character |
|---|---|---|---|
| **Crimson** | `#9B1C2E` | `#E07080` | Drama, dark fantasy, romance |
| **Ocean** | `#1A6E8A` | `#5BB8D4` | Mystery, sci-fi, maritime |
| **Forest** | `#2D6A4F` | `#74C69D` | Adventure, nature, folklore |
| **Dusk** | `#5B2D8E` | `#B08FD8` | Magic, gothic, cosmic horror |
| **Ember** | `#B45309` | `#FCA549` | Steampunk, warmth, western |
| **Slate** | `#2E4A6B` | `#7EA8D0` | Thriller, contemporary, noir |

### 7.3 Applying the Theme

The story shell layout sets CSS custom properties on its root element. Every component inside the story inherits them automatically.

```svelte
<!-- routes/stories/[storyId]/+layout.svelte -->
<script lang="ts">
  import { activeStory } from '$lib/stores/stories';
  import { resolveTheme } from '$lib/utils/theme';

  $: theme = resolveTheme($activeStory?.theme);
</script>

<div
  style="
    --color-accent:      {$page.data.darkMode ? theme.accentDark  : theme.accentLight};
    --color-accent-soft: {$page.data.darkMode ? theme.accentSoftDark : theme.accentSoft};
    --color-accent-text: {theme.accentText};
  "
  class="story-shell h-full flex"
>
  <slot />
</div>
```

`resolveTheme()` in `src/lib/utils/theme.ts` maps preset names to their hex values, or passes through custom values directly.

### 7.4 Theme Picker UI

Located in **Story Settings** (sidebar bottom link). Two sections:

**Preset grid** — six cards, each showing:
- A colour swatch strip (accent + soft tint)
- Preset name
- A one-line genre hint
- Selected state: accent-coloured ring

**Custom** — selecting this reveals:
- A colour input (`<input type="color">`) for the light-mode accent
- A second for dark-mode accent (optional — auto-derived if left blank)
- A live preview strip showing the accent against both light and dark backgrounds

Changes apply immediately (store update → CSS vars react) with no save button needed.

---

## 8. Tailwind v4 — `app.css`

Tailwind v4 has no `tailwind.config.js`. All configuration — design tokens, dark mode strategy, plugins — lives in a single CSS file (`src/app.css`) using the `@theme`, `@variant`, and `@plugin` directives.

```css
/* src/app.css */

/* 1. Import Tailwind v4 */
@import "tailwindcss";

/* 2. Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap');

/* 3. Typography plugin */
@plugin "@tailwindcss/typography";

/* 4. Dark mode — class strategy (.dark on <html>) */
@variant dark (&:where(.dark, .dark *));

/* ─────────────────────────────────────────────────────
   5. Design tokens
   @theme registers tokens as Tailwind utility classes.
   --color-accent generates bg-accent, text-accent, etc.
   ───────────────────────────────────────────────────── */
@theme {
  /* Fonts */
  --font-serif: "Crimson Pro", Georgia, serif;
  --font-sans:  "Inter", system-ui, sans-serif;
  --font-mono:  "JetBrains Mono", monospace;

  /* Border radius */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-full: 9999px;

  /*
    Semantic colour aliases — each points at a raw CSS var
    so utilities (bg-accent, text-accent-soft, etc.) react
    automatically to dark mode and per-story overrides.
  */
  --color-accent:         var(--accent);
  --color-accent-soft:    var(--accent-soft);
  --color-accent-text:    var(--accent-text);
  --color-surface:        var(--surface);
  --color-surface-raised: var(--surface-raised);
  --color-border:         var(--border);
  --color-text-primary:   var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-disabled:  var(--text-disabled);
  --color-danger:         var(--danger);
  --color-success:        var(--success);
}

/* ─────────────────────────────────────────────────────
   6. Base palette — light mode defaults
   Raw CSS vars (outside @theme) so they are NOT exposed
   as utilities — only the aliases above are.
   ───────────────────────────────────────────────────── */
:root {
  --surface:         #FFFFFF;
  --surface-raised:  #EFEDE9;
  --border:          #DDD9D3;
  --text-primary:    #1A1814;
  --text-secondary:  #6B6760;
  --text-disabled:   #B0ADA8;
  --danger:          #C0392B;
  --success:         #2E7D5E;

  /* Default accent = Forest preset, light mode.
     Overridden per-story by the story shell layout (see §7.3). */
  --accent:      #2D6A4F;
  --accent-soft: #D1EAE0;
  --accent-text: #FFFFFF;
}

/* 7. Dark mode — applied when .dark is on <html> */
.dark {
  --surface:         #1E1C19;
  --surface-raised:  #272420;
  --border:          #333028;
  --text-primary:    #F0EDE8;
  --text-secondary:  #8C8880;
  --text-disabled:   #4A4843;

  /* Default accent — Forest preset, dark mode */
  --accent:      #74C69D;
  --accent-soft: #1A3D2E;
  --accent-text: #0D1F17;
}

/* 8. Prose / Markdown preview */
.prose {
  --tw-prose-body:     var(--text-primary);
  --tw-prose-headings: var(--text-primary);
  font-family: var(--font-serif);
  font-size: 1.125rem;
  line-height: 1.8;
}
```

### How the token chain works

```
@theme --color-accent ──► var(--accent)
                                 ▲
               :root / .dark sets --accent  (global default)
                                 ▲
   Story shell <div> overrides --accent inline  (per-story theme, §7.3)
```

Tailwind utility classes (`bg-accent`, `text-accent-soft`, `border-accent`, `font-serif`, etc.) always resolve through this chain — per-story themes apply automatically with no extra class logic.
