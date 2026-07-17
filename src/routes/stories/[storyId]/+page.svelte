<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { activeStory } from '$lib/stores/stories';
	import { characters } from '$lib/stores/characters';
	import { locations } from '$lib/stores/locations';
	import { objects } from '$lib/stores/objects';
	import { lore } from '$lib/stores/lore';
	import { chapters } from '$lib/stores/chapters';
	import { scenes } from '$lib/stores/scenes';

	const storyId = $derived(page.params.storyId as string);

	const stats = $derived([
		{
			label: 'Characters',
			count: $characters.length,
			href: resolve('/stories/[storyId]/characters', { storyId })
		},
		{
			label: 'Locations',
			count: $locations.length,
			href: resolve('/stories/[storyId]/locations', { storyId })
		},
		{
			label: 'Objects',
			count: $objects.length,
			href: resolve('/stories/[storyId]/objects', { storyId })
		},
		{
			label: 'Lore Entries',
			count: $lore.length,
			href: resolve('/stories/[storyId]/lore', { storyId })
		},
		{
			label: 'Chapters',
			count: $chapters.length,
			href: resolve('/stories/[storyId]/chapters', { storyId })
		},
		{
			label: 'Scenes',
			count: $scenes.length,
			href: resolve('/stories/[storyId]/chapters', { storyId })
		}
	]);
</script>

<svelte:head><title>{$activeStory?.title ?? 'Story'} — Loreforge</title></svelte:head>

{#if $activeStory}
	<div class="max-w-3xl">
		<p class="text-xs tracking-wide text-text-secondary uppercase">
			{$activeStory.genre || 'Untitled genre'}
		</p>
		<h1 class="font-serif text-4xl">{$activeStory.title}</h1>
		{#if $activeStory.synopsis}
			<p class="mt-3 text-text-secondary">{$activeStory.synopsis}</p>
		{/if}

		<div class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
			{#each stats as stat (stat.label)}
				<a
					href={stat.href}
					class="rounded-lg border border-border bg-surface p-4 text-center transition hover:border-accent/40"
				>
					<span class="block font-serif text-2xl text-accent">{stat.count}</span>
					<span class="text-xs text-text-secondary">{stat.label}</span>
				</a>
			{/each}
		</div>
	</div>
{/if}
