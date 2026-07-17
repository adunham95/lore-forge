import { get, writable } from 'svelte/store';
import { getCharactersForStory, save, remove } from '$lib/db';
import { nowIso } from '$lib/utils/date';
import type { Character, Story } from '$lib/types';

export const characters = writable<Character[]>([]);

/** Loads this story's own characters plus any shared across its series. */
export async function loadCharacters(story: Story) {
	characters.set(await getCharactersForStory(story));
}

/** Promotes a book-only character to a series-shared character. */
export async function shareCharacterAcrossSeries(character: Character, seriesId: string) {
	await saveCharacter({
		...character,
		storyId: undefined,
		seriesId,
		updatedAt: nowIso()
	});
}

/** Demotes a series-shared character back to belonging to a single book. */
export async function makeCharacterStoryOnly(character: Character, storyId: string) {
	await saveCharacter({
		...character,
		storyId,
		seriesId: undefined,
		updatedAt: nowIso()
	});
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
