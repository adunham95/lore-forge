<script lang="ts">
	import { resolve } from '$app/paths';
	import { resolveTheme } from '$lib/utils/theme';
	import type { Story } from '$lib/types';

	interface Props {
		story: Story;
		onDelete: () => void;
	}

	let { story, onDelete }: Props = $props();
	let theme = $derived(resolveTheme(story.theme));
	let href = $derived(resolve('/stories/[storyId]', { storyId: story.id }));

	function confirmDelete(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (
			confirm(
				`Delete "${story.title}"? This removes all its characters, locations, lore, and scenes.`
			)
		) {
			onDelete();
		}
	}
</script>

<a
	{href}
	class="group relative block rounded-lg border border-border bg-surface p-4 shadow-sm transition hover:border-accent/40 hover:shadow-md"
	style="--card-accent: {theme.accentLight}"
>
	<span class="mb-3 block h-1.5 w-10 rounded-full" style="background-color: {theme.accentLight}"
	></span>
	<h3 class="font-serif text-xl">{story.title}</h3>
	{#if story.genre}
		<p class="mb-2 text-xs tracking-wide text-text-secondary uppercase">{story.genre}</p>
	{/if}
	{#if story.synopsis}
		<p class="line-clamp-2 text-sm text-text-secondary">{story.synopsis}</p>
	{/if}

	<button
		onclick={confirmDelete}
		class="absolute top-3 right-3 rounded-md p-2 text-xs text-text-secondary hover:text-danger sm:opacity-0 sm:group-hover:opacity-100"
		aria-label="Delete story"
	>
		Delete
	</button>
</a>
