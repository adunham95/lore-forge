<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		stories,
		loadStories,
		createStory,
		saveStory,
		deleteStory,
		nextSeriesOrder
	} from '$lib/stores/stories';
	import { seriesList, loadSeries, createSeries, saveSeries } from '$lib/stores/series';
	import { byUpdatedDesc, byOrder } from '$lib/utils/sort';
	import { defaultTheme } from '$lib/utils/theme';
	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import BookRow from '$lib/components/story/BookRow.svelte';
	import ThemePicker from '$lib/components/story/ThemePicker.svelte';
	import type { StoryTheme } from '$lib/types';

	let showCreate = $state(false);
	let title = $state('');
	let synopsis = $state('');
	let genre = $state('');
	let theme = $state<StoryTheme>(defaultTheme());
	let seriesId = $state('');

	let showCreateSeries = $state(false);
	let seriesTitle = $state('');
	let seriesDescription = $state('');

	let standaloneStories = $derived(byUpdatedDesc($stories.filter((s) => !s.seriesId)));
	let seriesGroups = $derived(
		byUpdatedDesc($seriesList).map((series) => ({
			series,
			books: byOrder(
				$stories
					.filter((s) => s.seriesId === series.id)
					.map((s) => ({ ...s, order: s.seriesOrder ?? 0 }))
			)
		}))
	);

	onMount(() => {
		loadStories();
		loadSeries();
	});

	function openCreate() {
		title = '';
		synopsis = '';
		genre = '';
		theme = defaultTheme();
		seriesId = '';
		showCreate = true;
	}

	async function submitCreate(e: SubmitEvent) {
		e.preventDefault();
		if (!title.trim()) return;
		const story = createStory({
			title: title.trim(),
			synopsis: synopsis.trim(),
			genre: genre.trim(),
			seriesId: seriesId || undefined,
			seriesOrder: seriesId ? nextSeriesOrder(seriesId, $stories) : undefined
		});
		story.theme = theme;
		await saveStory(story);
		showCreate = false;
		goto(resolve('/stories/[storyId]', { storyId: story.id }));
	}

	function openCreateSeries() {
		seriesTitle = '';
		seriesDescription = '';
		showCreateSeries = true;
	}

	async function submitCreateSeries(e: SubmitEvent) {
		e.preventDefault();
		if (!seriesTitle.trim()) return;
		await saveSeries(
			createSeries({ title: seriesTitle.trim(), description: seriesDescription.trim() })
		);
		showCreateSeries = false;
	}
</script>

<svelte:head><title>Loreforge</title></svelte:head>

<div class="mx-auto max-w-5xl px-6 py-10">
	<div class="mb-8 flex items-start justify-between gap-2 md:items-center">
		<div>
			<h1 class="font-serif text-3xl">Your Stories</h1>
			<p class="text-sm text-text-secondary">Build worlds. Tell stories.</p>
		</div>
		<div class="flex flex-col-reverse gap-2 md:flex-row">
			<Button variant="secondary" onclick={openCreateSeries}>+ New Series</Button>
			<Button onclick={openCreate}>+ New Story</Button>
		</div>
	</div>

	{#if $stories.length === 0}
		<EmptyState
			title="No stories yet"
			description="Create your first story to start building its world — characters, locations, lore, and chapters."
		>
			{#snippet action()}
				<Button onclick={openCreate}>+ New Story</Button>
			{/snippet}
		</EmptyState>
	{:else}
		<div class="mx-auto flex max-w-2xl flex-col gap-6">
			{#each seriesGroups as group (group.series.id)}
				<div>
					<div class="mb-2 flex items-center justify-between">
						<a
							href={resolve('/series/[seriesId]', { seriesId: group.series.id })}
							class="font-serif text-lg hover:text-accent"
						>
							{group.series.title}
						</a>
						<span class="text-xs text-text-secondary"
							>{group.books.length} {group.books.length === 1 ? 'book' : 'books'}</span
						>
					</div>
					<div class="flex flex-col gap-3 border-l-2 border-border pl-4">
						{#each group.books as story (story.id)}
							<BookRow {story} onDelete={() => deleteStory(story.id)} />
						{/each}
					</div>
				</div>
			{/each}

			{#each standaloneStories as story (story.id)}
				<BookRow {story} onDelete={() => deleteStory(story.id)} />
			{/each}

			<button
				type="button"
				onclick={openCreate}
				class="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-4 text-text-secondary transition hover:border-accent hover:text-accent"
			>
				<span class="text-lg leading-none">+</span>
				<span class="text-sm">New Story</span>
			</button>
		</div>
	{/if}
</div>

{#if showCreate}
	<Modal title="New Story" onClose={() => (showCreate = false)}>
		<form class="flex flex-col gap-4" onsubmit={submitCreate}>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Title</span>
				<input
					bind:value={title}
					required
					class="rounded-md border border-border bg-surface px-3 py-2"
					placeholder="The Hollow Crown"
				/>
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Genre</span>
				<input
					bind:value={genre}
					class="rounded-md border border-border bg-surface px-3 py-2"
					placeholder="Dark fantasy"
				/>
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Synopsis</span>
				<textarea
					bind:value={synopsis}
					rows="3"
					class="rounded-md border border-border bg-surface px-3 py-2"
					placeholder="A one or two sentence summary of the story."></textarea>
			</label>
			<div>
				<span class="mb-2 block text-sm text-text-secondary">Theme</span>
				<ThemePicker value={theme} onChange={(t) => (theme = t)} />
			</div>
			{#if $seriesList.length > 0}
				<label class="flex flex-col gap-1 text-sm">
					<span class="text-text-secondary">Series</span>
					<select
						bind:value={seriesId}
						class="rounded-md border border-border bg-surface px-3 py-2"
					>
						<option value="">None — standalone story</option>
						{#each byUpdatedDesc($seriesList) as series (series.id)}
							<option value={series.id}>{series.title}</option>
						{/each}
					</select>
				</label>
			{/if}
			<div class="mt-2 flex justify-end gap-2">
				<Button variant="secondary" onclick={() => (showCreate = false)}>Cancel</Button>
				<Button type="submit">Create Story</Button>
			</div>
		</form>
	</Modal>
{/if}

{#if showCreateSeries}
	<Modal title="New Series" onClose={() => (showCreateSeries = false)}>
		<form class="flex flex-col gap-4" onsubmit={submitCreateSeries}>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Title</span>
				<input
					bind:value={seriesTitle}
					required
					class="rounded-md border border-border bg-surface px-3 py-2"
					placeholder="The Hollow Crown Saga"
				/>
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Description</span>
				<textarea
					bind:value={seriesDescription}
					rows="3"
					class="rounded-md border border-border bg-surface px-3 py-2"
					placeholder="A one or two sentence summary of the series."></textarea>
			</label>
			<div class="mt-2 flex justify-end gap-2">
				<Button variant="secondary" onclick={() => (showCreateSeries = false)}>Cancel</Button>
				<Button type="submit">Create Series</Button>
			</div>
		</form>
	</Modal>
{/if}
