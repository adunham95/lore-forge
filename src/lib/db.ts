import Dexie, { type EntityTable, type Table } from 'dexie';
import type {
	Story,
	Series,
	Character,
	Location,
	StoryObject,
	LoreEntry,
	Chapter,
	Scene,
	StoryOutline,
	WritingPrompt,
	AppSettings
} from './types';

class SwbDatabase extends Dexie {
	stories!: EntityTable<Story, 'id'>;
	series!: EntityTable<Series, 'id'>;
	characters!: EntityTable<Character, 'id'>;
	locations!: EntityTable<Location, 'id'>;
	objects!: EntityTable<StoryObject, 'id'>;
	lore!: EntityTable<LoreEntry, 'id'>;
	chapters!: EntityTable<Chapter, 'id'>;
	scenes!: EntityTable<Scene, 'id'>;
	outlines!: EntityTable<StoryOutline, 'storyId'>;
	prompts!: EntityTable<WritingPrompt, 'id'>;
	settings!: Table<AppSettings, string>;

	constructor() {
		super('swb-db');

		// Each version below only declares what changed at that step — Dexie carries
		// forward everything else from the prior version automatically. This mirrors
		// the `if (oldVersion < N)` branches of the old idb-based upgrade() function,
		// version number for version number (there was never a shipped v3 — see the
		// v4 note below).
		this.version(1).stores({
			stories: 'id',
			characters: 'id, storyId',
			locations: 'id, storyId',
			lore: 'id, storyId',
			chapters: 'id, storyId',
			scenes: 'id, storyId, chapterId',
			settings: ''
		});

		this.version(2).stores({
			objects: 'id, storyId'
		});

		// An in-development build briefly shipped an incomplete version-3 migration,
		// so a browser upgrading from that state may already have a partial 'series'
		// store. If that ever throws a ConstraintError in practice, it needs an
		// explicit version(3) step to reconcile — not hit in testing so far.
		this.version(4).stores({
			series: 'id',
			characters: 'id, storyId, seriesId'
		});

		this.version(5).stores({
			locations: 'id, storyId, seriesId',
			objects: 'id, storyId, seriesId',
			lore: 'id, storyId, seriesId'
		});

		this.version(6).stores({
			outlines: 'storyId'
		});

		this.version(7).stores({
			prompts: 'id'
		});
	}
}

const db = new SwbDatabase();

export async function getAllStories(): Promise<Story[]> {
	return db.stories.toArray();
}

export async function getStory(id: string): Promise<Story | undefined> {
	return db.stories.get(id);
}

export async function getAllSeries(): Promise<Series[]> {
	return db.series.toArray();
}

export async function getSeries(id: string): Promise<Series | undefined> {
	return db.series.get(id);
}

export async function getStoriesBySeries(seriesId: string): Promise<Story[]> {
	const all = await db.stories.toArray();
	return all.filter((s) => s.seriesId === seriesId);
}

export async function getCharactersByStory(storyId: string): Promise<Character[]> {
	return db.characters.where('storyId').equals(storyId).toArray();
}

export async function getCharactersBySeries(seriesId: string): Promise<Character[]> {
	return db.characters.where('seriesId').equals(seriesId).toArray();
}

/** Characters that live in this story, plus any shared across its series (if it has one). */
export async function getCharactersForStory(story: Story): Promise<Character[]> {
	const [own, shared] = await Promise.all([
		getCharactersByStory(story.id),
		story.seriesId ? getCharactersBySeries(story.seriesId) : Promise.resolve([])
	]);
	return [...own, ...shared];
}

export async function getLocationsByStory(storyId: string): Promise<Location[]> {
	return db.locations.where('storyId').equals(storyId).toArray();
}

export async function getLocationsBySeries(seriesId: string): Promise<Location[]> {
	return db.locations.where('seriesId').equals(seriesId).toArray();
}

/** Locations that live in this story, plus any shared across its series. */
export async function getLocationsForStory(story: Story): Promise<Location[]> {
	const [own, shared] = await Promise.all([
		getLocationsByStory(story.id),
		story.seriesId ? getLocationsBySeries(story.seriesId) : Promise.resolve([])
	]);
	return [...own, ...shared];
}

export async function getObjectsByStory(storyId: string): Promise<StoryObject[]> {
	return db.objects.where('storyId').equals(storyId).toArray();
}

export async function getObjectsBySeries(seriesId: string): Promise<StoryObject[]> {
	return db.objects.where('seriesId').equals(seriesId).toArray();
}

/** Objects that live in this story, plus any shared across its series. */
export async function getObjectsForStory(story: Story): Promise<StoryObject[]> {
	const [own, shared] = await Promise.all([
		getObjectsByStory(story.id),
		story.seriesId ? getObjectsBySeries(story.seriesId) : Promise.resolve([])
	]);
	return [...own, ...shared];
}

export async function getLoreByStory(storyId: string): Promise<LoreEntry[]> {
	return db.lore.where('storyId').equals(storyId).toArray();
}

export async function getLoreBySeries(seriesId: string): Promise<LoreEntry[]> {
	return db.lore.where('seriesId').equals(seriesId).toArray();
}

/** Lore entries that live in this story, plus any shared across its series. */
export async function getLoreForStory(story: Story): Promise<LoreEntry[]> {
	const [own, shared] = await Promise.all([
		getLoreByStory(story.id),
		story.seriesId ? getLoreBySeries(story.seriesId) : Promise.resolve([])
	]);
	return [...own, ...shared];
}

export async function getChaptersByStory(storyId: string): Promise<Chapter[]> {
	return db.chapters.where('storyId').equals(storyId).toArray();
}

export async function getScenesByStory(storyId: string): Promise<Scene[]> {
	return db.scenes.where('storyId').equals(storyId).toArray();
}

export async function getScenesByChapter(chapterId: string): Promise<Scene[]> {
	return db.scenes.where('chapterId').equals(chapterId).toArray();
}

export async function getOutline(storyId: string): Promise<StoryOutline | undefined> {
	return db.outlines.get(storyId);
}

export async function saveOutline(outline: StoryOutline): Promise<void> {
	await db.outlines.put(JSON.parse(JSON.stringify(outline)));
}

export async function deleteOutline(storyId: string): Promise<void> {
	await db.outlines.delete(storyId);
}

export async function getAllPrompts(): Promise<WritingPrompt[]> {
	return db.prompts.toArray();
}

interface EntityValueMap {
	stories: Story;
	series: Series;
	characters: Character;
	locations: Location;
	objects: StoryObject;
	lore: LoreEntry;
	chapters: Chapter;
	scenes: Scene;
	prompts: WritingPrompt;
}

type EntityStore = keyof EntityValueMap;

export async function save<S extends EntityStore>(
	store: S,
	value: EntityValueMap[S]
): Promise<void> {
	// Svelte 5 `$state` objects are Proxy-wrapped, which IndexedDB's structured
	// clone algorithm rejects — round-tripping through JSON yields a plain object.
	await db.table(store).put(JSON.parse(JSON.stringify(value)));
}

export async function remove(store: EntityStore, id: string): Promise<void> {
	await db.table(store).delete(id);
}

/**
 * Deletes a story and every entity that belongs to it (cascade delete).
 * Series-shared characters, locations, objects, and lore are left untouched —
 * unless this is the last remaining story in its series, in which case they
 * have no other book to live in and are deleted along with it.
 */
export async function removeStoryCascade(storyId: string): Promise<void> {
	const target = await db.stories.get(storyId);

	let orphanedSharedCharacterKeys: string[] = [];
	let orphanedSharedLocationKeys: string[] = [];
	let orphanedSharedObjectKeys: string[] = [];
	let orphanedSharedLoreKeys: string[] = [];
	if (target?.seriesId) {
		const siblings = (await db.stories.toArray()).filter(
			(s) => s.seriesId === target.seriesId && s.id !== storyId
		);
		if (siblings.length === 0) {
			[
				orphanedSharedCharacterKeys,
				orphanedSharedLocationKeys,
				orphanedSharedObjectKeys,
				orphanedSharedLoreKeys
			] = await Promise.all([
				db.characters.where('seriesId').equals(target.seriesId).primaryKeys(),
				db.locations.where('seriesId').equals(target.seriesId).primaryKeys(),
				db.objects.where('seriesId').equals(target.seriesId).primaryKeys(),
				db.lore.where('seriesId').equals(target.seriesId).primaryKeys()
			]);
		}
	}

	await db.transaction(
		'rw',
		[db.stories, db.characters, db.locations, db.objects, db.lore, db.chapters, db.scenes, db.outlines],
		async () => {
			const [characterKeys, locationKeys, objectKeys, loreKeys, chapterKeys, sceneKeys] =
				await Promise.all([
					db.characters.where('storyId').equals(storyId).primaryKeys(),
					db.locations.where('storyId').equals(storyId).primaryKeys(),
					db.objects.where('storyId').equals(storyId).primaryKeys(),
					db.lore.where('storyId').equals(storyId).primaryKeys(),
					db.chapters.where('storyId').equals(storyId).primaryKeys(),
					db.scenes.where('storyId').equals(storyId).primaryKeys()
				]);

			await Promise.all([
				db.stories.delete(storyId),
				db.characters.bulkDelete([...characterKeys, ...orphanedSharedCharacterKeys]),
				db.locations.bulkDelete([...locationKeys, ...orphanedSharedLocationKeys]),
				db.objects.bulkDelete([...objectKeys, ...orphanedSharedObjectKeys]),
				db.lore.bulkDelete([...loreKeys, ...orphanedSharedLoreKeys]),
				db.chapters.bulkDelete(chapterKeys),
				db.scenes.bulkDelete(sceneKeys),
				db.outlines.delete(storyId)
			]);
		}
	);
}

/**
 * Dissolves a series: unlinks every book (they become standalone stories)
 * and hands series-shared characters, locations, objects, and lore off to the
 * earliest book, since each always needs exactly one home once it's no longer
 * series-wide.
 */
export async function removeSeriesCascade(seriesId: string): Promise<void> {
	await db.transaction(
		'rw',
		[db.series, db.stories, db.characters, db.locations, db.objects, db.lore],
		async () => {
			const [allStories, sharedCharacters, sharedLocations, sharedObjects, sharedLore] =
				await Promise.all([
					db.stories.toArray(),
					db.characters.where('seriesId').equals(seriesId).toArray(),
					db.locations.where('seriesId').equals(seriesId).toArray(),
					db.objects.where('seriesId').equals(seriesId).toArray(),
					db.lore.where('seriesId').equals(seriesId).toArray()
				]);

			const seriesStories = allStories.filter((s) => s.seriesId === seriesId);
			const anchor = [...seriesStories].sort(
				(a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0)
			)[0];

			await Promise.all([
				db.series.delete(seriesId),
				...seriesStories.map((s) => {
					const { seriesId: _seriesId, seriesOrder: _seriesOrder, ...rest } = s;
					return db.stories.put(rest);
				}),
				...sharedCharacters.map((c) => {
					const { seriesId: _seriesId, ...rest } = c;
					return db.characters.put(anchor ? { ...rest, storyId: anchor.id } : rest);
				}),
				...sharedLocations.map((l) => {
					const { seriesId: _seriesId, ...rest } = l;
					return db.locations.put(anchor ? { ...rest, storyId: anchor.id } : rest);
				}),
				...sharedObjects.map((o) => {
					const { seriesId: _seriesId, ...rest } = o;
					return db.objects.put(anchor ? { ...rest, storyId: anchor.id } : rest);
				}),
				...sharedLore.map((entry) => {
					const { seriesId: _seriesId, ...rest } = entry;
					return db.lore.put(anchor ? { ...rest, storyId: anchor.id } : rest);
				})
			]);
		}
	);
}

export async function getSettings(): Promise<AppSettings | undefined> {
	return db.settings.get('app');
}

export async function saveSettings(settings: AppSettings): Promise<void> {
	await db.settings.put(settings, 'app');
}
