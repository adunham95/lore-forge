import { writable } from 'svelte/store';
import { getScenesByStory, getScenesByChapter, save, remove } from '$lib/db';
import type { Scene } from '$lib/types';

export const scenes = writable<Scene[]>([]);

/** Loads every scene in the story — used for cross-chapter lookups (e.g. character profile). */
export async function loadScenesByStory(storyId: string) {
	scenes.set(await getScenesByStory(storyId));
}

/** Loads only the scenes for one chapter — the common case in the chapters view. */
export async function loadScenesByChapter(chapterId: string) {
	const chapterScenes = await getScenesByChapter(chapterId);
	scenes.update((all) => [...all.filter((s) => s.chapterId !== chapterId), ...chapterScenes]);
}

export async function saveScene(scene: Scene) {
	await save('scenes', scene);
	scenes.update((all) => {
		const idx = all.findIndex((s) => s.id === scene.id);
		return idx === -1 ? [...all, scene] : all.with(idx, scene);
	});
}

export async function deleteScene(id: string) {
	await remove('scenes', id);
	scenes.update((all) => all.filter((s) => s.id !== id));
}
