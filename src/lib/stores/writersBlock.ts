import { writable } from 'svelte/store';
import { getAllWritersBlockEntries, save, remove } from '$lib/db';
import { nowIso } from '$lib/utils/date';
import type { WritersBlockEntry } from '$lib/types';

export const writersBlockEntries = writable<WritersBlockEntry[]>([]);

export async function loadWritersBlockEntries() {
	writersBlockEntries.set(await getAllWritersBlockEntries());
}

export async function saveWritersBlockEntry(entry: WritersBlockEntry) {
	const updated = { ...entry, updatedAt: nowIso() };
	await save('writersBlock', updated);
	writersBlockEntries.update((all) => {
		const idx = all.findIndex((e) => e.id === updated.id);
		return idx === -1 ? [...all, updated] : all.with(idx, updated);
	});
}

export async function deleteWritersBlockEntry(id: string) {
	await remove('writersBlock', id);
	writersBlockEntries.update((all) => all.filter((e) => e.id !== id));
}
