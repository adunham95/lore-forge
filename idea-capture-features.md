# Feature Ideas: From "Stuff in My Head" to Structure

## The problem

Some writers don't start with an outline — they start with a character's face, a scene
that keeps replaying, a plot twist with no home yet. Lore Forge's current flow (Story →
Outline template → Chapters → Scenes) assumes you're ready to commit an idea to a
specific act before you're allowed to write it down at all. That's a wall for anyone
whose ideas arrive out of order.

These are feature ideas for lowering that wall — letting someone dump what's in their
head first, in whatever form it takes, and structure it later. **All local, no AI**,
consistent with the app's existing "no backend, no network requests" design
(`tech-design.md` §1).

---

## A. Capture — get it out of your head with zero structure required

**Idea Inbox** *(new entity + page)*
A per-story scratchpad: a flat list of untitled fragments — a line of dialogue, a
character trait, "what if the mentor is the traitor." No required fields beyond the
text itself. Each entry can later be **promoted** into a real Character, Location,
Object, Lore entry, or Scene (pre-filling that form from the fragment's text), or just
deleted once it's served its purpose. This is the single highest-leverage feature here:
it's the difference between losing an idea and having somewhere to put it in five
seconds.

**Reference images on entities** *(extends `Character`, `Location`, `StoryObject`)*
Right now a character's only visual is a generated placeholder avatar
(`AvatarOptions`) — there's no way to attach an actual reference picture. Add an
optional array of locally-stored images (as IndexedDB blobs, same idea as the
existing `idb` dependency) to Characters, Locations, and Objects, shown as a small
gallery on their detail page. This directly answers "I have pictures of characters" —
right now there's nowhere for those to go.

**Quick-capture, available everywhere**
The outline wizard already has a nice pattern for this: inline "Add a character…" /
"Add a location…" inputs right inside the act-guidance flow
(`get-started/+page.svelte`), so a name that comes up mid-thought doesn't derail you.
Generalize that widget into a small persistent "+ Capture an idea" affordance
(e.g. in the story sidebar) that drops a note straight into the Idea Inbox from
*any* page — chapter editor, character page, wherever the thought strikes.

---

## B. Organize — turn fragments into structure without forcing prose

**Unassigned scenes**
`Scene.chapterId` is currently required, so a scene can't exist until you know which
chapter it belongs to. Making it optional lets someone write "the reveal at the
lighthouse" the moment they think of it, parked in an Unsorted bucket, and slot it
into a chapter later — instead of needing the outline finished first.

**Corkboard view**
A drag-and-drop index-card board: one card per scene idea (or Idea Inbox fragment),
columns for "Unsorted" plus each act from the current `StoryOutline`. This turns
"convert plot lines into acts" into a physical sorting motion instead of an outlining
exercise — drag the card where it feels right, no prose commitment needed. (The
existing tech-design future list already flags "drag-and-drop scene and chapter
reordering" — this is the same mechanic, aimed one level earlier, at ideas instead of
finished scenes.)

**Structure gap checklist**
A derived, read-only view listing every act/chapter with zero linked scenes or
characters. No new data — just a query over what already exists — but it answers
"where is my outline actually thin?" without requiring anyone to *write* anything to
find out.

---

## C. Connect — let loose notes talk to the structured entities

**Wiki-style `[[links]]` in Markdown fields**
Let any Markdown field (Lore, Notes, Scene content, Idea Inbox) reference an existing
Character/Location/Object/Lore entry by typing `[[Name]]`, auto-linking to its page.
Someone free-writing a messy brain-dump note still ends up with a structured web of
connections, without filling out a single form field.

**Backlinks panel**
On each entity's page, show everything that mentions it — via `[[links]]` above, or
via existing relationships/scene assignments. Answers "wait, what have I already said
about this character?" when the only record of it is scattered across notes written
at 2am.

---

## D. Visualize — for people who think in pictures, not paragraphs

**Story board / canvas**
A free-form corkboard where character cards (with their reference images from §A),
location cards, and idea cards can be pinned anywhere and connected with lines —
plot threads, relationships, "these three ideas are actually one scene." This is a
generalization of the tech-design future list's "visual character relationship graph"
and "location map" into one shared canvas, rather than two separate graph views.

**Story-wide image gallery**
One page pulling every reference image (§A) from every character/location/object in
the story into a single moodboard grid. For someone who thinks in pictures first,
this is closer to how they actually hold the story in their head than any list view.

---

## Suggested starting point

Building all of this is a lot; two pieces solve most of the pain on their own:

1. **Reference images** (§A) — directly unblocks "I have pictures of characters,"
   which nothing in the app currently supports at all.
2. **Idea Inbox + optional `Scene.chapterId`** (§A/§B) — removes the requirement to
   know an idea's structural home before you're allowed to record it, which is the
   core of "I don't know how to convert this to acts."

Everything else (corkboard, wiki-links, canvas) is a layer on top of those two once
they exist.
