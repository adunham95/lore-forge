<script lang="ts">
	import { resolve } from '$app/paths';
	import Badge from '$lib/components/ui/Badge.svelte';
	import type { StoryObject } from '$lib/types';

	interface Props {
		object: StoryObject;
	}

	let { object }: Props = $props();
	let href = $derived(
		resolve('/stories/[storyId]/objects/[objectId]', {
			storyId: object.storyId,
			objectId: object.id
		})
	);
</script>

<a
	{href}
	class="block rounded-lg border border-border bg-surface p-4 shadow-sm transition hover:border-accent/40 hover:shadow-md"
>
	<div class="mb-2 flex items-center justify-between gap-2">
		<h3 class="font-serif text-xl">{object.name}</h3>
		{#if object.type}
			<Badge>{object.type}</Badge>
		{/if}
	</div>
	{#if object.description}
		<p class="line-clamp-2 text-sm text-text-secondary">{object.description}</p>
	{/if}
</a>
