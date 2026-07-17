<script lang="ts">
	import { resolve } from '$app/paths';
	import AvatarPreview from '$lib/components/avatar/AvatarPreview.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import type { Character } from '$lib/types';

	interface Props {
		character: Character;
		storyId: string;
	}

	let { character, storyId }: Props = $props();
	let href = $derived(
		resolve('/stories/[storyId]/characters/[characterId]', {
			storyId,
			characterId: character.id
		})
	);
</script>

<a
	{href}
	class="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm transition hover:border-accent/40 hover:shadow-md"
>
	<AvatarPreview seed={character.avatar.seed} name={character.name} size={48} />
	<div class="min-w-0 flex-1">
		<h3 class="truncate font-serif text-lg">{character.name}</h3>
		{#if character.job}
			<p class="truncate text-xs text-text-secondary">{character.job}</p>
		{/if}
	</div>
	{#if character.seriesId}
		<Badge variant="neutral">Series</Badge>
	{/if}
	<Badge variant={character.role}>{character.role}</Badge>
</a>
