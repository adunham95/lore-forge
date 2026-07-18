<script lang="ts">
	import { resolve } from '$app/paths';
	import Badge from '$lib/components/ui/Badge.svelte';
	import type { WritingPrompt } from '$lib/types';

	interface Props {
		prompt: WritingPrompt;
	}

	let { prompt }: Props = $props();
	let href = $derived(resolve('/prompts/[promptId]', { promptId: prompt.id }));
	let excerpt = $derived(
		prompt.content
			.replace(/[#*_`>-]/g, '')
			.trim()
			.slice(0, 140)
	);
</script>

<a
	{href}
	class="block rounded-lg border border-border bg-surface p-4 shadow-sm transition hover:border-accent/40 hover:shadow-md"
>
	<h3 class="mb-2 font-serif text-xl">{prompt.title}</h3>
	{#if excerpt}
		<p class="line-clamp-2 text-sm text-text-secondary">{excerpt}</p>
	{/if}
	{#if prompt.tags.length > 0}
		<div class="mt-3 flex flex-wrap gap-1.5">
			{#each prompt.tags as tag (tag)}
				<Badge variant="neutral">{tag}</Badge>
			{/each}
		</div>
	{/if}
</a>
