import { writable } from 'svelte/store';
import { getObjectsForStory, save, remove } from '$lib/db';
import { nowIso } from '$lib/utils/date';
import type { StoryObject, Story } from '$lib/types';

export const objects = writable<StoryObject[]>([]);

/** Loads this story's own objects plus any shared across its series. */
export async function loadObjects(story: Story) {
	objects.set(await getObjectsForStory(story));
}

/** Promotes a book-only object to a series-shared object. */
export async function shareObjectAcrossSeries(object: StoryObject, seriesId: string) {
	await saveObject({
		...object,
		storyId: undefined,
		seriesId,
		updatedAt: nowIso()
	});
}

/** Demotes a series-shared object back to belonging to a single book. */
export async function makeObjectStoryOnly(object: StoryObject, storyId: string) {
	await saveObject({
		...object,
		storyId,
		seriesId: undefined,
		updatedAt: nowIso()
	});
}

export async function saveObject(object: StoryObject) {
	await save('objects', object);
	objects.update((all) => {
		const idx = all.findIndex((o) => o.id === object.id);
		return idx === -1 ? [...all, object] : all.with(idx, object);
	});
}

export async function deleteObject(id: string) {
	await remove('objects', id);
	objects.update((all) => all.filter((o) => o.id !== id));
}
