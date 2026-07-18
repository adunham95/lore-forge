import { writable } from 'svelte/store';
import {
	getOutline as getOutlineDb,
	saveOutline as saveOutlineDb,
	deleteOutline as deleteOutlineDb
} from '$lib/db';
import { nowIso } from '$lib/utils/date';
import type { StoryOutline } from '$lib/types';

export const outline = writable<StoryOutline | undefined>(undefined);

export async function loadOutline(storyId: string) {
	outline.set(await getOutlineDb(storyId));
}

export async function saveOutline(storyOutline: StoryOutline) {
	const updated = { ...storyOutline, updatedAt: nowIso() };
	await saveOutlineDb(updated);
	outline.set(updated);
}

export async function clearOutline(storyId: string) {
	await deleteOutlineDb(storyId);
	outline.set(undefined);
}
