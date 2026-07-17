import { writable } from 'svelte/store';
import { getLoreByStory, save, remove } from '$lib/db';
import type { LoreEntry } from '$lib/types';

export const lore = writable<LoreEntry[]>([]);

export async function loadLore(storyId: string) {
	lore.set(await getLoreByStory(storyId));
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
