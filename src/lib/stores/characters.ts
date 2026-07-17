import { get, writable } from 'svelte/store';
import { getCharactersByStory, save, remove } from '$lib/db';
import type { Character } from '$lib/types';

export const characters = writable<Character[]>([]);

export async function loadCharacters(storyId: string) {
	characters.set(await getCharactersByStory(storyId));
}

export async function saveCharacter(character: Character) {
	await save('characters', character);
	characters.update((all) => {
		const idx = all.findIndex((c) => c.id === character.id);
		return idx === -1 ? [...all, character] : all.with(idx, character);
	});
}

/** Deletes a character and strips it from every other character's relationships. */
export async function deleteCharacter(id: string) {
	const affected = get(characters).filter((c) =>
		c.relationships.some((r) => r.targetCharacterId === id)
	);
	await Promise.all(
		affected.map((c) =>
			save('characters', {
				...c,
				relationships: c.relationships.filter((r) => r.targetCharacterId !== id)
			})
		)
	);
	await remove('characters', id);
	characters.update((all) =>
		all
			.filter((c) => c.id !== id)
			.map((c) => ({
				...c,
				relationships: c.relationships.filter((r) => r.targetCharacterId !== id)
			}))
	);
}
