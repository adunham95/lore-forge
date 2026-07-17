<script lang="ts">
	import { resolve } from '$app/paths';
	import Badge from '$lib/components/ui/Badge.svelte';
	import type { Location } from '$lib/types';

	interface Props {
		location: Location;
	}

	let { location }: Props = $props();
	let href = $derived(
		resolve('/stories/[storyId]/locations/[locationId]', {
			storyId: location.storyId,
			locationId: location.id
		})
	);
</script>

<a
	{href}
	class="block rounded-lg border border-border bg-surface p-4 shadow-sm transition hover:border-accent/40 hover:shadow-md"
>
	<div class="mb-2 flex items-center justify-between gap-2">
		<h3 class="font-serif text-xl">{location.name}</h3>
		{#if location.type}
			<Badge>{location.type}</Badge>
		{/if}
	</div>
	{#if location.description}
		<p class="line-clamp-2 text-sm text-text-secondary">{location.description}</p>
	{/if}
</a>
