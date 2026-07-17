import { writable } from 'svelte/store';
import { getLocationsForStory, save, remove } from '$lib/db';
import { nowIso } from '$lib/utils/date';
import type { Location, Story } from '$lib/types';

export const locations = writable<Location[]>([]);

/** Loads this story's own locations plus any shared across its series. */
export async function loadLocations(story: Story) {
	locations.set(await getLocationsForStory(story));
}

/** Promotes a book-only location to a series-shared location. */
export async function shareLocationAcrossSeries(location: Location, seriesId: string) {
	await saveLocation({
		...location,
		storyId: undefined,
		seriesId,
		updatedAt: nowIso()
	});
}

/** Demotes a series-shared location back to belonging to a single book. */
export async function makeLocationStoryOnly(location: Location, storyId: string) {
	await saveLocation({
		...location,
		storyId,
		seriesId: undefined,
		updatedAt: nowIso()
	});
}

export async function saveLocation(location: Location) {
	await save('locations', location);
	locations.update((all) => {
		const idx = all.findIndex((l) => l.id === location.id);
		return idx === -1 ? [...all, location] : all.with(idx, location);
	});
}

export async function deleteLocation(id: string) {
	await remove('locations', id);
	locations.update((all) => all.filter((l) => l.id !== id));
}
