import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type {
	Story,
	Series,
	Character,
	Location,
	StoryObject,
	LoreEntry,
	Chapter,
	Scene,
	AppSettings
} from './types';

interface SwbSchema extends DBSchema {
	stories: { key: string; value: Story };
	series: { key: string; value: Series };
	characters: {
		key: string;
		value: Character;
		indexes: { 'by-story': string; 'by-series': string };
	};
	locations: { key: string; value: Location; indexes: { 'by-story': string } };
	objects: { key: string; value: StoryObject; indexes: { 'by-story': string } };
	lore: { key: string; value: LoreEntry; indexes: { 'by-story': string } };
	chapters: { key: string; value: Chapter; indexes: { 'by-story': string } };
	scenes: {
		key: string;
		value: Scene;
		indexes: { 'by-story': string; 'by-chapter': string };
	};
	settings: { key: string; value: AppSettings };
}

const DB_VERSION = 4;

let _db: IDBPDatabase<SwbSchema> | undefined;

export async function getDb(): Promise<IDBPDatabase<SwbSchema>> {
	if (_db) return _db;
	_db = await openDB<SwbSchema>('swb-db', DB_VERSION, {
		upgrade(db, oldVersion, _newVersion, transaction) {
			if (oldVersion < 1) {
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
			if (oldVersion < 2) {
				const objects = db.createObjectStore('objects', { keyPath: 'id' });
				objects.createIndex('by-story', 'storyId');
			}
			if (oldVersion < 4) {
				// Guarded existence checks: an in-development build briefly shipped an
				// incomplete version-3 migration, so some browsers may already have
				// partial state here.
				if (!db.objectStoreNames.contains('series')) {
					db.createObjectStore('series', { keyPath: 'id' });
				}
				const chars = transaction.objectStore('characters');
				if (!chars.indexNames.contains('by-series')) {
					chars.createIndex('by-series', 'seriesId');
				}
			}
		}
	});
	return _db;
}

export async function getAllStories(): Promise<Story[]> {
	return (await getDb()).getAll('stories');
}

export async function getStory(id: string): Promise<Story | undefined> {
	return (await getDb()).get('stories', id);
}

export async function getAllSeries(): Promise<Series[]> {
	return (await getDb()).getAll('series');
}

export async function getSeries(id: string): Promise<Series | undefined> {
	return (await getDb()).get('series', id);
}

export async function getStoriesBySeries(seriesId: string): Promise<Story[]> {
	const all = await (await getDb()).getAll('stories');
	return all.filter((s) => s.seriesId === seriesId);
}

export async function getCharactersByStory(storyId: string): Promise<Character[]> {
	return (await getDb()).getAllFromIndex('characters', 'by-story', storyId);
}

export async function getCharactersBySeries(seriesId: string): Promise<Character[]> {
	return (await getDb()).getAllFromIndex('characters', 'by-series', seriesId);
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
	return (await getDb()).getAllFromIndex('locations', 'by-story', storyId);
}

export async function getObjectsByStory(storyId: string): Promise<StoryObject[]> {
	return (await getDb()).getAllFromIndex('objects', 'by-story', storyId);
}

export async function getLoreByStory(storyId: string): Promise<LoreEntry[]> {
	return (await getDb()).getAllFromIndex('lore', 'by-story', storyId);
}

export async function getChaptersByStory(storyId: string): Promise<Chapter[]> {
	return (await getDb()).getAllFromIndex('chapters', 'by-story', storyId);
}

export async function getScenesByStory(storyId: string): Promise<Scene[]> {
	return (await getDb()).getAllFromIndex('scenes', 'by-story', storyId);
}

export async function getScenesByChapter(chapterId: string): Promise<Scene[]> {
	return (await getDb()).getAllFromIndex('scenes', 'by-chapter', chapterId);
}

type EntityStore =
	| 'stories'
	| 'series'
	| 'characters'
	| 'locations'
	| 'objects'
	| 'lore'
	| 'chapters'
	| 'scenes';

export async function save<S extends EntityStore>(
	store: S,
	value: SwbSchema[S]['value']
): Promise<void> {
	// Svelte 5 `$state` objects are Proxy-wrapped, which IndexedDB's structured
	// clone algorithm rejects — round-tripping through JSON yields a plain object.
	await (await getDb()).put(store, JSON.parse(JSON.stringify(value)));
}

export async function remove(store: EntityStore, id: string): Promise<void> {
	await (await getDb()).delete(store, id);
}

/**
 * Deletes a story and every entity that belongs to it (cascade delete).
 * Series-shared characters are left untouched — unless this is the last
 * remaining story in its series, in which case they have no other book to
 * live in and are deleted along with it.
 */
export async function removeStoryCascade(storyId: string): Promise<void> {
	const db = await getDb();
	const target = await db.get('stories', storyId);

	let orphanedSharedCharacterKeys: string[] = [];
	if (target?.seriesId) {
		const siblings = (await db.getAll('stories')).filter(
			(s) => s.seriesId === target.seriesId && s.id !== storyId
		);
		if (siblings.length === 0) {
			orphanedSharedCharacterKeys = await db.getAllKeysFromIndex(
				'characters',
				'by-series',
				target.seriesId
			);
		}
	}

	const tx = db.transaction(
		['stories', 'characters', 'locations', 'objects', 'lore', 'chapters', 'scenes'],
		'readwrite'
	);

	const [characters, locations, objects, lore, chapters, scenes] = await Promise.all([
		tx.objectStore('characters').index('by-story').getAllKeys(storyId),
		tx.objectStore('locations').index('by-story').getAllKeys(storyId),
		tx.objectStore('objects').index('by-story').getAllKeys(storyId),
		tx.objectStore('lore').index('by-story').getAllKeys(storyId),
		tx.objectStore('chapters').index('by-story').getAllKeys(storyId),
		tx.objectStore('scenes').index('by-story').getAllKeys(storyId)
	]);

	await Promise.all([
		tx.objectStore('stories').delete(storyId),
		...characters.map((key) => tx.objectStore('characters').delete(key)),
		...orphanedSharedCharacterKeys.map((key) => tx.objectStore('characters').delete(key)),
		...locations.map((key) => tx.objectStore('locations').delete(key)),
		...objects.map((key) => tx.objectStore('objects').delete(key)),
		...lore.map((key) => tx.objectStore('lore').delete(key)),
		...chapters.map((key) => tx.objectStore('chapters').delete(key)),
		...scenes.map((key) => tx.objectStore('scenes').delete(key))
	]);

	await tx.done;
}

/**
 * Dissolves a series: unlinks every book (they become standalone stories)
 * and hands series-shared characters off to the earliest book, since a
 * character always needs exactly one home once it's no longer series-wide.
 */
export async function removeSeriesCascade(seriesId: string): Promise<void> {
	const db = await getDb();
	const tx = db.transaction(['series', 'stories', 'characters'], 'readwrite');

	const [allStories, sharedCharacters] = await Promise.all([
		tx.objectStore('stories').getAll(),
		tx.objectStore('characters').index('by-series').getAll(seriesId)
	]);

	const seriesStories = allStories.filter((s) => s.seriesId === seriesId);
	const anchor = [...seriesStories].sort(
		(a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0)
	)[0];

	await Promise.all([
		tx.objectStore('series').delete(seriesId),
		...seriesStories.map((s) => {
			const { seriesId: _seriesId, seriesOrder: _seriesOrder, ...rest } = s;
			return tx.objectStore('stories').put(rest);
		}),
		...sharedCharacters.map((c) => {
			const { seriesId: _seriesId, ...rest } = c;
			return tx.objectStore('characters').put(anchor ? { ...rest, storyId: anchor.id } : rest);
		})
	]);

	await tx.done;
}

export async function getSettings(): Promise<AppSettings | undefined> {
	return (await getDb()).get('settings', 'app');
}

export async function saveSettings(settings: AppSettings): Promise<void> {
	await (await getDb()).put('settings', settings, 'app');
}
