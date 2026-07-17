<script lang="ts">
	import { resolve } from '$app/paths';
	import { resolveTheme } from '$lib/utils/theme';
	import Badge from '$lib/components/ui/Badge.svelte';
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
	class="group flex items-center gap-3 rounded-xl border border-border bg-surface p-3 shadow-sm transition hover:border-accent/40 hover:shadow-md"
>
	<div
		class="relative flex h-20 w-16 shrink-0 flex-col items-center justify-center overflow-hidden rounded-lg p-1.5 text-center shadow-inner"
		style="background: linear-gradient(160deg, {theme.accentLight} 0%, {theme.accentDark} 100%); color: {theme.accentText}"
	>
		<span class="absolute inset-1 rounded-sm border border-white/25"></span>
		<span
			class="line-clamp-4 font-serif text-[9px] leading-tight font-semibold tracking-wide uppercase"
		>
			{story.title}
		</span>
	</div>

	<div class="min-w-0 flex-1">
		<div class="flex items-start justify-between gap-2">
			<h3 class="truncate font-serif text-lg leading-snug">{story.title}</h3>
			{#if story.genre}
				<span class="shrink-0"><Badge>{story.genre}</Badge></span>
			{/if}
		</div>
		{#if story.synopsis}
			<p class="mt-1 line-clamp-2 text-sm text-text-secondary">{story.synopsis}</p>
		{/if}
	</div>

	<button
		onclick={confirmDelete}
		aria-label="Delete story"
		class="shrink-0 rounded-md p-2 text-xs text-text-secondary hover:text-danger sm:opacity-0 sm:group-hover:opacity-100"
	>
		Delete
	</button>
</a>
