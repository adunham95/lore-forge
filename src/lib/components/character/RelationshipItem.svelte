<script lang="ts">
	import { resolve } from '$app/paths';
	import AvatarThumbnail from '$lib/components/avatar/AvatarThumbnail.svelte';
	import type { Character, CharacterRelationship } from '$lib/types';

	interface Props {
		relationship: CharacterRelationship;
		target: Character | undefined;
		onRemove?: () => void;
	}

	let { relationship, target, onRemove }: Props = $props();
</script>

<div class="flex items-center gap-3 rounded-md border border-border bg-surface p-3">
	{#if target}
		<AvatarThumbnail seed={target.avatar.seed} name={target.name} />
		<div class="min-w-0 flex-1">
			<a
				href={resolve('/stories/[storyId]/characters/[characterId]', {
					storyId: target.storyId,
					characterId: target.id
				})}
				class="truncate font-medium hover:text-accent"
			>
				{target.name}
			</a>
			<span class="text-xs text-text-secondary">— {relationship.label}</span>
			{#if relationship.description}
				<p class="truncate text-xs text-text-secondary">{relationship.description}</p>
			{/if}
		</div>
	{:else}
		<div class="min-w-0 flex-1">
			<span class="text-sm text-text-secondary italic">Unknown character</span>
		</div>
	{/if}
	{#if onRemove}
		<button
			onclick={onRemove}
			class="shrink-0 p-1 text-sm text-text-secondary hover:text-danger"
			aria-label="Remove relationship"
		>
			&times;
		</button>
	{/if}
</div>
