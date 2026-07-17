import { writable, derived } from 'svelte/store';
import { getAllStories, save, removeStoryCascade } from '$lib/db';
import { newId } from '$lib/utils/id';
import { nowIso } from '$lib/utils/date';
import { defaultTheme } from '$lib/utils/theme';
import type { Story } from '$lib/types';

export const stories = writable<Story[]>([]);

/** Set by the story shell layout on navigation; drives `activeStory` below. */
export const activeStoryId = writable<string | undefined>(undefined);

export const activeStory = derived([stories, activeStoryId], ([$stories, $activeStoryId]) =>
	$stories.find((s) => s.id === $activeStoryId)
);

export async function loadStories() {
	stories.set(await getAllStories());
}

export function createStory(
	input: Pick<Story, 'title' | 'synopsis' | 'genre'> & Partial<Pick<Story, 'seriesId' | 'seriesOrder'>>
): Story {
	const timestamp = nowIso();
	return {
		id: newId(),
		title: input.title,
		synopsis: input.synopsis,
		genre: input.genre,
		theme: defaultTheme(),
		seriesId: input.seriesId,
		seriesOrder: input.seriesOrder,
		createdAt: timestamp,
		updatedAt: timestamp
	};
}

/** Next free book position for a series, based on the highest existing `seriesOrder`. */
export function nextSeriesOrder(seriesId: string, allStories: Story[]): number {
	const inSeries = allStories.filter((s) => s.seriesId === seriesId);
	return inSeries.length === 0 ? 0 : Math.max(...inSeries.map((s) => s.seriesOrder ?? 0)) + 1;
}

export async function saveStory(story: Story) {
	await save('stories', story);
	stories.update((all) => {
		const idx = all.findIndex((s) => s.id === story.id);
		return idx === -1 ? [...all, story] : all.with(idx, story);
	});
}

export async function deleteStory(id: string) {
	await removeStoryCascade(id);
	stories.update((all) => all.filter((s) => s.id !== id));
}
