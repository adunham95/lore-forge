import { writable } from 'svelte/store';
import { getLocationsByStory, save, remove } from '$lib/db';
import type { Location } from '$lib/types';

export const locations = writable<Location[]>([]);

export async function loadLocations(storyId: string) {
	locations.set(await getLocationsByStory(storyId));
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
