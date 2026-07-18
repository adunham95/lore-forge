<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		getSeries,
		getStoriesBySeries,
		getCharactersBySeries,
		getLocationsBySeries,
		getObjectsBySeries,
		getLoreBySeries
	} from '$lib/db';
	import { saveSeries, deleteSeries } from '$lib/stores/series';
	import { createStory, saveStory, deleteStory, nextSeriesOrder } from '$lib/stores/stories';
	import { showToast } from '$lib/stores/toast';
	import { byOrder, byUpdatedDesc } from '$lib/utils/sort';
	import { defaultTheme } from '$lib/utils/theme';
	import { nowIso } from '$lib/utils/date';
	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import BookRow from '$lib/components/story/BookRow.svelte';
	import CharacterCard from '$lib/components/character/CharacterCard.svelte';
	import LocationCard from '$lib/components/location/LocationCard.svelte';
	import ObjectCard from '$lib/components/object/ObjectCard.svelte';
	import LoreCard from '$lib/components/lore/LoreCard.svelte';
	import ThemePicker from '$lib/components/story/ThemePicker.svelte';
	import type {
		Series,
		Story,
		Character,
		Location,
		StoryObject,
		LoreEntry,
		StoryTheme
	} from '$lib/types';

	const seriesId = $derived(page.params.seriesId as string);

	let series = $state<Series | undefined>(undefined);
	let seriesBooks = $state<Story[]>([]);
	let sharedCharacters = $state<Character[]>([]);
	let sharedLocations = $state<Location[]>([]);
	let sharedObjects = $state<StoryObject[]>([]);
	let sharedLore = $state<LoreEntry[]>([]);
	let ready = $state(false);

	let editTitle = $state('');
	let editDescription = $state('');

	let showAddBook = $state(false);
	let bookTitle = $state('');
	let bookGenre = $state('');
	let bookSynopsis = $state('');
	let bookTheme = $state<StoryTheme>(defaultTheme());

	async function refresh() {
		const id = seriesId;
		const [foundSeries, books, characters, locations, objects, lore] = await Promise.all([
			getSeries(id),
			getStoriesBySeries(id),
			getCharactersBySeries(id),
			getLocationsBySeries(id),
			getObjectsBySeries(id),
			getLoreBySeries(id)
		]);
		series = foundSeries;
		seriesBooks = books;
		sharedCharacters = characters;
		sharedLocations = locations;
		sharedObjects = objects;
		sharedLore = lore;
		editTitle = foundSeries?.title ?? '';
		editDescription = foundSeries?.description ?? '';
		ready = true;
	}

	$effect(() => {
		ready = false;
		refresh();
	});

	let orderedBooks = $derived(
		byOrder(seriesBooks.map((s) => ({ ...s, order: s.seriesOrder ?? 0 })))
	);
	let sortedCharacters = $derived(byUpdatedDesc(sharedCharacters));
	let sortedLocations = $derived(byUpdatedDesc(sharedLocations));
	let sortedObjects = $derived(byUpdatedDesc(sharedObjects));
	let sortedLore = $derived(byUpdatedDesc(sharedLore));
	// The book a series-shared item's detail link resolves through.
	let anchorStoryId = $derived(orderedBooks[0]?.id);

	async function saveDetails(e: SubmitEvent) {
		e.preventDefault();
		if (!series || !editTitle.trim()) return;
		await saveSeries({
			...series,
			title: editTitle.trim(),
			description: editDescription.trim(),
			updatedAt: nowIso()
		});
		await refresh();
		showToast('Series saved');
	}

	async function removeSeries() {
		if (!series) return;
		if (
			confirm(
				`Delete "${series.title}"? Its books become standalone stories, and shared characters, locations, objects, and lore move to ${orderedBooks[0]?.title ?? 'the first book'}.`
			)
		) {
			await deleteSeries(series.id);
			goto(resolve('/'));
		}
	}

	function openAddBook() {
		bookTitle = '';
		bookGenre = '';
		bookSynopsis = '';
		bookTheme = defaultTheme();
		showAddBook = true;
	}

	async function submitAddBook(e: SubmitEvent) {
		e.preventDefault();
		if (!bookTitle.trim()) return;
		const story = createStory({
			title: bookTitle.trim(),
			synopsis: bookSynopsis.trim(),
			genre: bookGenre.trim(),
			seriesId,
			seriesOrder: nextSeriesOrder(seriesId, seriesBooks)
		});
		story.theme = bookTheme;
		await saveStory(story);
		showAddBook = false;
		await refresh();
	}

	async function removeBook(id: string) {
		await deleteStory(id);
		await refresh();
	}
</script>

<svelte:head><title>{series?.title ?? 'Series'} — Loreforge</title></svelte:head>

{#if ready && series}
	<div class="mx-auto max-w-3xl px-6 py-10">
		<a
			href={resolve('/')}
			class="mb-4 inline-block text-sm text-text-secondary hover:text-text-primary"
		>
			&larr; Your Stories
		</a>

		<h1 class="font-serif text-3xl">{series.title}</h1>
		{#if series.description}
			<p class="mt-2 text-text-secondary">{series.description}</p>
		{/if}

		<div class="mt-8 flex items-center justify-between">
			<h2 class="font-serif text-xl">Books</h2>
			<Button onclick={openAddBook}>+ Add Book</Button>
		</div>

		{#if orderedBooks.length === 0}
			<EmptyState title="No books yet" description="Add the first book in this series.">
				{#snippet action()}
					<Button onclick={openAddBook}>+ Add Book</Button>
				{/snippet}
			</EmptyState>
		{:else}
			<div class="mt-3 flex flex-col gap-3">
				{#each orderedBooks as story (story.id)}
					<BookRow {story} onDelete={() => removeBook(story.id)} />
				{/each}
			</div>
		{/if}

		<div class="mt-8">
			<h2 class="font-serif text-xl">Shared Characters</h2>
			<p class="text-sm text-text-secondary">
				These characters carry across every book in the series.
			</p>
			{#if sortedCharacters.length === 0}
				<p class="mt-3 text-sm text-text-secondary">
					No shared characters yet — mark a character "Whole series" from within any book to add one
					here.
				</p>
			{:else if anchorStoryId}
				<div class="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
					{#each sortedCharacters as character (character.id)}
						<CharacterCard {character} storyId={anchorStoryId} />
					{/each}
				</div>
			{/if}
		</div>

		<div class="mt-8">
			<h2 class="font-serif text-xl">Shared Locations</h2>
			<p class="text-sm text-text-secondary">
				These locations carry across every book in the series.
			</p>
			{#if sortedLocations.length === 0}
				<p class="mt-3 text-sm text-text-secondary">
					No shared locations yet — mark a location "Whole series" from within any book to add one
					here.
				</p>
			{:else if anchorStoryId}
				<div class="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
					{#each sortedLocations as location (location.id)}
						<LocationCard {location} storyId={anchorStoryId} />
					{/each}
				</div>
			{/if}
		</div>

		<div class="mt-8">
			<h2 class="font-serif text-xl">Shared Objects</h2>
			<p class="text-sm text-text-secondary">
				These objects carry across every book in the series.
			</p>
			{#if sortedObjects.length === 0}
				<p class="mt-3 text-sm text-text-secondary">
					No shared objects yet — mark an object "Whole series" from within any book to add one
					here.
				</p>
			{:else if anchorStoryId}
				<div class="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
					{#each sortedObjects as object (object.id)}
						<ObjectCard {object} storyId={anchorStoryId} />
					{/each}
				</div>
			{/if}
		</div>

		<div class="mt-8">
			<h2 class="font-serif text-xl">Shared Lore</h2>
			<p class="text-sm text-text-secondary">
				These lore entries carry across every book in the series.
			</p>
			{#if sortedLore.length === 0}
				<p class="mt-3 text-sm text-text-secondary">
					No shared lore yet — mark a lore entry "Whole series" from within any book to add one
					here.
				</p>
			{:else if anchorStoryId}
				<div class="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
					{#each sortedLore as entry (entry.id)}
						<LoreCard {entry} storyId={anchorStoryId} />
					{/each}
				</div>
			{/if}
		</div>

		<div class="mt-8 border-t border-border pt-6">
			<h2 class="mb-3 font-serif text-xl">Series Details</h2>
			<form class="flex flex-col gap-4" onsubmit={saveDetails}>
				<label class="flex flex-col gap-1 text-sm">
					<span class="text-text-secondary">Title</span>
					<input
						bind:value={editTitle}
						required
						class="rounded-md border border-border bg-surface px-3 py-2"
					/>
				</label>
				<label class="flex flex-col gap-1 text-sm">
					<span class="text-text-secondary">Description</span>
					<textarea
						bind:value={editDescription}
						rows="3"
						class="rounded-md border border-border bg-surface px-3 py-2"></textarea>
				</label>
				<div class="flex justify-end">
					<Button type="submit">Save Details</Button>
				</div>
			</form>
		</div>

		<div class="mt-8 border-t border-border pt-6">
			<h2 class="mb-2 font-serif text-xl text-danger">Danger Zone</h2>
			<p class="mb-3 text-sm text-text-secondary">
				Deleting a series dissolves the grouping — books become standalone stories and shared
				characters move into the first book.
			</p>
			<Button variant="danger" onclick={removeSeries}>Delete Series</Button>
		</div>
	</div>
{/if}

{#if showAddBook}
	<Modal title="Add Book" onClose={() => (showAddBook = false)}>
		<form class="flex flex-col gap-4" onsubmit={submitAddBook}>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Title</span>
				<input
					bind:value={bookTitle}
					required
					class="rounded-md border border-border bg-surface px-3 py-2"
					placeholder="Book Two: The Widening Gyre"
				/>
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Genre</span>
				<input
					bind:value={bookGenre}
					class="rounded-md border border-border bg-surface px-3 py-2"
					placeholder="Dark fantasy"
				/>
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Synopsis</span>
				<textarea
					bind:value={bookSynopsis}
					rows="3"
					class="rounded-md border border-border bg-surface px-3 py-2"
					placeholder="A one or two sentence summary of the book."></textarea>
			</label>
			<div>
				<span class="mb-2 block text-sm text-text-secondary">Theme</span>
				<ThemePicker value={bookTheme} onChange={(t) => (bookTheme = t)} />
			</div>
			<div class="mt-2 flex justify-end gap-2">
				<Button variant="secondary" onclick={() => (showAddBook = false)}>Cancel</Button>
				<Button type="submit">Add Book</Button>
			</div>
		</form>
	</Modal>
{/if}
