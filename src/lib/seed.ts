import { getStory, save, saveOutline } from './db';
import defaultStoryData from './data/defaultStory.json';
import type {
	Story,
	Character,
	Location,
	StoryObject,
	LoreEntry,
	Chapter,
	StoryOutline
} from './types';

interface DefaultStorySeed {
	story: Story;
	characters: Character[];
	locations: Location[];
	objects: StoryObject[];
	lore: LoreEntry[];
	chapters: Chapter[];
	outline: StoryOutline;
}

const seed = defaultStoryData as DefaultStorySeed;

/**
 * Makes sure the example story — a fully fleshed-out story with characters, lore,
 * locations, and an outline — exists, so users always have a concrete reference
 * for how much detail a character/lore entry can hold. Keyed off the seed's fixed
 * id: runs on every startup, but only writes anything the first time (or again if
 * the example story was deleted), regardless of how many other stories exist.
 */
export async function ensureDefaultStorySeed(): Promise<void> {
	const existing = await getStory(seed.story.id);
	if (existing) return;

	await Promise.all([
		save('stories', seed.story),
		...seed.characters.map((character) => save('characters', character)),
		...seed.locations.map((location) => save('locations', location)),
		...seed.objects.map((object) => save('objects', object)),
		...seed.lore.map((entry) => save('lore', entry)),
		...seed.chapters.map((chapter) => save('chapters', chapter))
	]);
	await saveOutline(seed.outline);
}
