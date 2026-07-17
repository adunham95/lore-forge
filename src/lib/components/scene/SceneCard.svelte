<script lang="ts">
	import { resolve } from '$app/paths';
	import { characters } from '$lib/stores/characters';
	import { locations } from '$lib/stores/locations';
	import AvatarThumbnail from '$lib/components/avatar/AvatarThumbnail.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import type { Scene } from '$lib/types';

	interface Props {
		scene: Scene;
	}

	let { scene }: Props = $props();
	let href = $derived(
		resolve('/stories/[storyId]/scenes/[sceneId]', { storyId: scene.storyId, sceneId: scene.id })
	);
	let sceneCharacters = $derived(
		scene.characterIds
			.map((id) => $characters.find((c) => c.id === id))
			.filter((c) => c !== undefined)
	);
	let location = $derived($locations.find((l) => l.id === scene.locationId));
	let povCharacter = $derived($characters.find((c) => c.id === scene.povCharacterId));
</script>

<a
	{href}
	class="block rounded-lg border border-border bg-surface p-3 shadow-sm transition hover:border-accent/40 hover:shadow-md"
>
	<h4 class="mb-2 truncate font-serif text-lg">{scene.title || 'Untitled Scene'}</h4>
	<div class="flex flex-wrap items-center gap-2">
		{#each sceneCharacters as character (character.id)}
			<span
				class="rounded-full {character.id === scene.povCharacterId
					? 'ring-2 ring-accent ring-offset-2 ring-offset-surface'
					: ''}"
				title={character.id === scene.povCharacterId ? `POV: ${character.name}` : character.name}
			>
				<AvatarThumbnail seed={character.avatar.seed} name={character.name} />
			</span>
		{/each}
		{#if location}
			<Badge>{location.name}</Badge>
		{/if}
		{#if povCharacter}
			<Badge variant="protagonist">POV: {povCharacter.name}</Badge>
		{/if}
	</div>
</a>
