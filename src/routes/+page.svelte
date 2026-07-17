<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { stories, loadStories, createStory, saveStory, deleteStory } from '$lib/stores/stories';
	import { byUpdatedDesc } from '$lib/utils/sort';
	import { defaultTheme } from '$lib/utils/theme';
	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import StoryCard from '$lib/components/story/StoryCard.svelte';
	import ThemePicker from '$lib/components/story/ThemePicker.svelte';
	import type { StoryTheme } from '$lib/types';

	let showCreate = $state(false);
	let title = $state('');
	let synopsis = $state('');
	let genre = $state('');
	let theme = $state<StoryTheme>(defaultTheme());
	let sortedStories = $derived(byUpdatedDesc($stories));

	onMount(() => {
		loadStories();
	});

	function openCreate() {
		title = '';
		synopsis = '';
		genre = '';
		theme = defaultTheme();
		showCreate = true;
	}

	async function submitCreate(e: SubmitEvent) {
		e.preventDefault();
		if (!title.trim()) return;
		const story = createStory({
			title: title.trim(),
			synopsis: synopsis.trim(),
			genre: genre.trim()
		});
		story.theme = theme;
		await saveStory(story);
		showCreate = false;
		goto(resolve('/stories/[storyId]', { storyId: story.id }));
	}
</script>

<svelte:head><title>Loreforge</title></svelte:head>

<div class="mx-auto max-w-5xl px-6 py-10">
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="font-serif text-3xl">Your Stories</h1>
			<p class="text-sm text-text-secondary">Build worlds. Tell stories.</p>
		</div>
		<Button onclick={openCreate}>+ New Story</Button>
	</div>

	{#if sortedStories.length === 0}
		<EmptyState
			title="No stories yet"
			description="Create your first story to start building its world — characters, locations, lore, and chapters."
		>
			{#snippet action()}
				<Button onclick={openCreate}>+ New Story</Button>
			{/snippet}
		</EmptyState>
	{:else}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each sortedStories as story (story.id)}
				<StoryCard {story} onDelete={() => deleteStory(story.id)} />
			{/each}
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
			<div class="mt-2 flex justify-end gap-2">
				<Button variant="secondary" onclick={() => (showCreate = false)}>Cancel</Button>
				<Button type="submit">Create Story</Button>
			</div>
		</form>
	</Modal>
{/if}
