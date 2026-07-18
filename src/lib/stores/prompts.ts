import { writable } from 'svelte/store';
import { getAllPrompts, save, remove } from '$lib/db';
import { nowIso } from '$lib/utils/date';
import type { WritingPrompt } from '$lib/types';

export const prompts = writable<WritingPrompt[]>([]);

export async function loadPrompts() {
	prompts.set(await getAllPrompts());
}

export async function savePrompt(prompt: WritingPrompt) {
	const updated = { ...prompt, updatedAt: nowIso() };
	await save('prompts', updated);
	prompts.update((all) => {
		const idx = all.findIndex((p) => p.id === updated.id);
		return idx === -1 ? [...all, updated] : all.with(idx, updated);
	});
}

export async function deletePrompt(id: string) {
	await remove('prompts', id);
	prompts.update((all) => all.filter((p) => p.id !== id));
}
