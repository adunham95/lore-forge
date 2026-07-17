import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type {
	Story,
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
	characters: { key: string; value: Character; indexes: { 'by-story': string } };
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

const DB_VERSION = 2;

let _db: IDBPDatabase<SwbSchema> | undefined;

export async function getDb(): Promise<IDBPDatabase<SwbSchema>> {
	if (_db) return _db;
	_db = await openDB<SwbSchema>('swb-db', DB_VERSION, {
		upgrade(db, oldVersion) {
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

export async function getCharactersByStory(storyId: string): Promise<Character[]> {
	return (await getDb()).getAllFromIndex('characters', 'by-story', storyId);
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
	'stories' | 'characters' | 'locations' | 'objects' | 'lore' | 'chapters' | 'scenes';

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

/** Deletes a story and every entity that belongs to it (cascade delete). */
export async function removeStoryCascade(storyId: string): Promise<void> {
	const db = await getDb();
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
		...locations.map((key) => tx.objectStore('locations').delete(key)),
		...objects.map((key) => tx.objectStore('objects').delete(key)),
		...lore.map((key) => tx.objectStore('lore').delete(key)),
		...chapters.map((key) => tx.objectStore('chapters').delete(key)),
		...scenes.map((key) => tx.objectStore('scenes').delete(key))
	]);

	await tx.done;
}

export async function getSettings(): Promise<AppSettings | undefined> {
	return (await getDb()).get('settings', 'app');
}

export async function saveSettings(settings: AppSettings): Promise<void> {
	await (await getDb()).put('settings', settings, 'app');
}
