<script lang="ts">
	import { resolve } from '$app/paths';
	import type { LoreEntry } from '$lib/types';

	interface Props {
		entry: LoreEntry;
	}

	let { entry }: Props = $props();
	let href = $derived(
		resolve('/stories/[storyId]/lore/[loreId]', { storyId: entry.storyId, loreId: entry.id })
	);
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
	<h3 class="font-serif text-xl">{entry.title}</h3>
	{#if excerpt}
		<p class="line-clamp-2 text-sm text-text-secondary">{excerpt}</p>
	{/if}
</a>
