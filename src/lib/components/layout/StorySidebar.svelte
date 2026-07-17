<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { activeStory } from '$lib/stores/stories';
	import { seriesList } from '$lib/stores/series';

	interface Props {
		storyId: string;
	}

	let { storyId }: Props = $props();

	const series = $derived($seriesList.find((s) => s.id === $activeStory?.seriesId));

	const overviewHref = $derived(resolve('/stories/[storyId]', { storyId }));
	const settingsHref = $derived(resolve('/stories/[storyId]/settings', { storyId }));

	const groups = $derived([
		{
			section: 'World',
			items: [
				{ href: resolve('/stories/[storyId]/characters', { storyId }), label: 'Characters' },
				{ href: resolve('/stories/[storyId]/locations', { storyId }), label: 'Locations' },
				{ href: resolve('/stories/[storyId]/objects', { storyId }), label: 'Objects' },
				{ href: resolve('/stories/[storyId]/lore', { storyId }), label: 'Lore' }
			]
		},
		{
			section: 'Narrative',
			items: [
				{ href: resolve('/stories/[storyId]/chapters', { storyId }), label: 'Chapters & Scenes' }
			]
		}
	]);

	// Flat list for the mobile tab bar — same destinations, no section grouping.
	const flatLinks = $derived([
		{ href: overviewHref, label: 'Overview' },
		...groups.flatMap((g) => g.items),
		{ href: settingsHref, label: 'Settings' }
	]);

	function isActive(href: string) {
		return page.url.pathname === href || page.url.pathname.startsWith(href + '/');
	}
</script>

<!-- Mobile: horizontal scrollable tab bar -->
<nav
	class="flex shrink-0 gap-1 overflow-x-auto border-b border-border bg-surface-raised p-2 md:hidden"
>
	{#each flatLinks as link (link.href)}
		<a
			href={link.href}
			class="shrink-0 rounded-md px-3 py-2 text-sm whitespace-nowrap {isActive(link.href)
				? 'bg-accent-soft font-medium text-accent'
				: 'text-text-secondary'}"
		>
			{link.label}
		</a>
	{/each}
</nav>

<!-- Desktop: vertical sidebar -->
<nav
	class="hidden w-56 shrink-0 flex-col gap-6 border-r border-border bg-surface-raised p-4 md:flex"
>
	{#if series}
		<a
			href={resolve('/series/[seriesId]', { seriesId: series.id })}
			class="-mb-3 text-xs font-medium tracking-wide text-text-secondary uppercase hover:text-accent"
		>
			{series.title}
		</a>
	{/if}
	<a
		href={overviewHref}
		class="font-serif text-lg {page.url.pathname === overviewHref
			? 'text-accent'
			: 'text-text-primary'}"
	>
		Overview
	</a>

	{#each groups as group (group.section)}
		<div>
			<p class="mb-2 text-xs font-medium tracking-wide text-text-secondary uppercase">
				{group.section}
			</p>
			<ul class="flex flex-col gap-1">
				{#each group.items as item (item.href)}
					<li>
						<a
							href={item.href}
							class="block rounded-md px-2 py-1.5 text-sm {isActive(item.href)
								? 'bg-accent-soft font-medium text-accent'
								: 'text-text-secondary hover:text-text-primary'}"
						>
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/each}

	<div class="mt-auto">
		<a
			href={settingsHref}
			class="block rounded-md px-2 py-1.5 text-sm text-text-secondary hover:text-text-primary {isActive(
				settingsHref
			)
				? 'bg-accent-soft font-medium text-accent'
				: ''}"
		>
			⚙ Story Settings
		</a>
	</div>
</nav>
