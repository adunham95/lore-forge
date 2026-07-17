import { writable } from 'svelte/store';
import { getAllSeries, save, removeSeriesCascade } from '$lib/db';
import { newId } from '$lib/utils/id';
import { nowIso } from '$lib/utils/date';
import type { Series } from '$lib/types';

export const seriesList = writable<Series[]>([]);

export async function loadSeries() {
	seriesList.set(await getAllSeries());
}

export function createSeries(input: Pick<Series, 'title' | 'description'>): Series {
	const timestamp = nowIso();
	return {
		id: newId(),
		title: input.title,
		description: input.description,
		createdAt: timestamp,
		updatedAt: timestamp
	};
}

export async function saveSeries(item: Series) {
	await save('series', item);
	seriesList.update((all) => {
		const idx = all.findIndex((s) => s.id === item.id);
		return idx === -1 ? [...all, item] : all.with(idx, item);
	});
}

/** Dissolves the series — books become standalone, shared characters move to the earliest book. */
export async function deleteSeries(id: string) {
	await removeSeriesCascade(id);
	seriesList.update((all) => all.filter((s) => s.id !== id));
}
