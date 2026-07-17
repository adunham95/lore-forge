import { writable } from 'svelte/store';
import { getObjectsByStory, save, remove } from '$lib/db';
import type { StoryObject } from '$lib/types';

export const objects = writable<StoryObject[]>([]);

export async function loadObjects(storyId: string) {
	objects.set(await getObjectsByStory(storyId));
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
