<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		activeStory,
		saveStory,
		deleteStory,
		nextSeriesOrder,
		stories
	} from '$lib/stores/stories';
	import { seriesList, loadSeries } from '$lib/stores/series';
	import { showToast } from '$lib/stores/toast';
	import { nowIso } from '$lib/utils/date';
	import Button from '$lib/components/ui/Button.svelte';
	import ThemePicker from '$lib/components/story/ThemePicker.svelte';
	import type { StoryTheme } from '$lib/types';

	let title = $state('');
	let synopsis = $state('');
	let genre = $state('');
	let theme = $state<StoryTheme | undefined>(undefined);
	let seriesId = $state('');
	let initialized = $state(false);

	onMount(() => {
		loadSeries();
	});

	$effect(() => {
		if ($activeStory && !initialized) {
			title = $activeStory.title;
			synopsis = $activeStory.synopsis;
			genre = $activeStory.genre;
			theme = $activeStory.theme;
			seriesId = $activeStory.seriesId ?? '';
			initialized = true;
		}
	});

	async function onSeriesChange() {
		if (!$activeStory) return;
		await saveStory({
			...$activeStory,
			seriesId: seriesId || undefined,
			seriesOrder: seriesId ? nextSeriesOrder(seriesId, $stories) : undefined,
			updatedAt: nowIso()
		});
	}

	function onThemeChange(next: StoryTheme) {
		theme = next;
		if ($activeStory) saveStory({ ...$activeStory, theme: next, updatedAt: nowIso() });
	}

	async function saveDetails(e: SubmitEvent) {
		e.preventDefault();
		if (!$activeStory || !theme) return;
		await saveStory({
			...$activeStory,
			title: title.trim(),
			synopsis: synopsis.trim(),
			genre: genre.trim(),
			theme,
			updatedAt: nowIso()
		});
		showToast('Story settings saved');
	}

	async function removeStory() {
		if (!$activeStory) return;
		if (
			confirm(
				`Delete "${$activeStory.title}"? This removes all its characters, locations, lore, and scenes. This cannot be undone.`
			)
		) {
			await deleteStory($activeStory.id);
			goto(resolve('/'));
		}
	}
</script>

<svelte:head><title>Story Settings — {$activeStory?.title}</title></svelte:head>

{#if $activeStory && theme}
	<div class="max-w-2xl">
		<h1 class="font-serif text-3xl">Story Settings</h1>

		<form class="mt-6 flex flex-col gap-4" onsubmit={saveDetails}>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Title</span>
				<input
					bind:value={title}
					required
					class="rounded-md border border-border bg-surface px-3 py-2"
				/>
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Genre</span>
				<input bind:value={genre} class="rounded-md border border-border bg-surface px-3 py-2" />
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Synopsis</span>
				<textarea
					bind:value={synopsis}
					rows="3"
					class="rounded-md border border-border bg-surface px-3 py-2"></textarea>
			</label>
			<div class="flex justify-end">
				<Button type="submit">Save Details</Button>
			</div>
		</form>

		<div class="mt-8 border-t border-border pt-6">
			<h2 class="mb-3 font-serif text-xl">Theme</h2>
			<ThemePicker value={theme} onChange={onThemeChange} />
		</div>

		<div class="mt-8 border-t border-border pt-6">
			<h2 class="mb-3 font-serif text-xl">Series</h2>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Part of a series</span>
				<select
					bind:value={seriesId}
					onchange={onSeriesChange}
					class="rounded-md border border-border bg-surface px-3 py-2"
				>
					<option value="">None — standalone story</option>
					{#each $seriesList as series (series.id)}
						<option value={series.id}>{series.title}</option>
					{/each}
				</select>
			</label>
			{#if $activeStory.seriesId}
				<a
					href={resolve('/series/[seriesId]', { seriesId: $activeStory.seriesId })}
					class="mt-2 inline-block text-sm text-accent hover:underline"
				>
					View series &rarr;
				</a>
			{/if}
		</div>

		<div class="mt-8 border-t border-border pt-6">
			<h2 class="mb-2 font-serif text-xl text-danger">Danger Zone</h2>
			<p class="mb-3 text-sm text-text-secondary">
				Deleting a story permanently removes all of its characters, locations, lore, chapters, and
				scenes.
			</p>
			<Button variant="danger" onclick={removeStory}>Delete Story</Button>
		</div>
	</div>
{/if}
