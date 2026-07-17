import { get, writable } from 'svelte/store';
import { getChaptersByStory, save, remove } from '$lib/db';
import { scenes, deleteScene } from './scenes';
import type { Chapter } from '$lib/types';

export const chapters = writable<Chapter[]>([]);

export async function loadChapters(storyId: string) {
	chapters.set(await getChaptersByStory(storyId));
}

export async function saveChapter(chapter: Chapter) {
	await save('chapters', chapter);
	chapters.update((all) => {
		const idx = all.findIndex((c) => c.id === chapter.id);
		return idx === -1 ? [...all, chapter] : all.with(idx, chapter);
	});
}

/** Deletes a chapter and every scene that belongs to it. */
export async function deleteChapter(id: string) {
	const chapterScenes = get(scenes).filter((s) => s.chapterId === id);
	await Promise.all(chapterScenes.map((s) => deleteScene(s.id)));
	await remove('chapters', id);
	chapters.update((all) => all.filter((c) => c.id !== id));
}
