<script lang="ts">
	import { resolve } from '$app/paths';
	import Badge from '$lib/components/ui/Badge.svelte';
	import type { WritersBlockEntry, Story } from '$lib/types';

	interface Props {
		entry: WritersBlockEntry;
		story?: Story;
	}

	let { entry, story }: Props = $props();
	let href = $derived(resolve('/writers-block/[entryId]', { entryId: entry.id }));
	let excerpt = $derived(
		entry.content
			.replace(/[#*_`>-]/g, '')
			.trim()
			.slice(0, 140)
	);
</script>

<a
	{href}
	class="block rounded-lg border border-border bg-surface p-4 shadow-sm transition hover:border-accent/40 hover:shadow-md"
>
	<h3 class="mb-2 font-serif text-xl">{entry.title}</h3>
	{#if excerpt}
		<p class="line-clamp-2 text-sm text-text-secondary">{excerpt}</p>
	{/if}
	{#if story || entry.characterIds.length > 0}
		<div class="mt-3 flex flex-wrap gap-1.5">
			{#if story}
				<Badge variant="neutral">{story.title}</Badge>
			{/if}
			{#if entry.characterIds.length > 0}
				<Badge variant="neutral"
					>{entry.characterIds.length} character{entry.characterIds.length === 1 ? '' : 's'}</Badge
				>
			{/if}
		</div>
	{/if}
</a>
