import { get, writable } from 'svelte/store';
import { getChaptersByStory, save, remove } from '$lib/db';
import { scenes, deleteScene } from './scenes';
import { newId } from '$lib/utils/id';
import { nowIso } from '$lib/utils/date';
import templatesData from '$lib/data/outlineTemplates.json';
import type { Chapter, OutlineTemplate } from '$lib/types';

export const chapters = writable<Chapter[]>([]);

export const outlineTemplates: OutlineTemplate[] = templatesData;

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

/** Appends every chapter from an outline template, tagging each with its act. */
export async function applyOutlineTemplate(storyId: string, templateId: string) {
	const template = outlineTemplates.find((t) => t.id === templateId);
	if (!template) return;

	let order = get(chapters).length;
	const timestamp = nowIso();
	const newChapters: Chapter[] = template.acts.flatMap((act) =>
		act.chapters.map((title) => ({
			id: newId(),
			storyId,
			title,
			act: act.name,
			order: order++,
			createdAt: timestamp,
			updatedAt: timestamp
		}))
	);

	await Promise.all(newChapters.map((chapter) => save('chapters', chapter)));
	chapters.update((all) => [...all, ...newChapters]);
}

/** Deletes a chapter and every scene that belongs to it. */
export async function deleteChapter(id: string) {
	const chapterScenes = get(scenes).filter((s) => s.chapterId === id);
	await Promise.all(chapterScenes.map((s) => deleteScene(s.id)));
	await remove('chapters', id);
	chapters.update((all) => all.filter((c) => c.id !== id));
}
