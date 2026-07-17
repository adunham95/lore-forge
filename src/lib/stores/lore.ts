import { writable } from 'svelte/store';
import { getLoreForStory, save, remove } from '$lib/db';
import { nowIso } from '$lib/utils/date';
import type { LoreEntry, Story } from '$lib/types';

export const lore = writable<LoreEntry[]>([]);

/** Loads this story's own lore entries plus any shared across its series. */
export async function loadLore(story: Story) {
	lore.set(await getLoreForStory(story));
}

/** Promotes a book-only lore entry to a series-shared lore entry. */
export async function shareLoreAcrossSeries(entry: LoreEntry, seriesId: string) {
	await saveLoreEntry({
		...entry,
		storyId: undefined,
		seriesId,
		updatedAt: nowIso()
	});
}

/** Demotes a series-shared lore entry back to belonging to a single book. */
export async function makeLoreStoryOnly(entry: LoreEntry, storyId: string) {
	await saveLoreEntry({
		...entry,
		storyId,
		seriesId: undefined,
		updatedAt: nowIso()
	});
}

export async function saveLoreEntry(entry: LoreEntry) {
	await save('lore', entry);
	lore.update((all) => {
		const idx = all.findIndex((l) => l.id === entry.id);
		return idx === -1 ? [...all, entry] : all.with(idx, entry);
	});
}

export async function deleteLoreEntry(id: string) {
	await remove('lore', id);
	lore.update((all) => all.filter((l) => l.id !== id));
}
