<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { lore, saveLoreEntry } from '$lib/stores/lore';
	import { activeStory } from '$lib/stores/stories';
	import { showSaveError } from '$lib/stores/toast';
	import { newId } from '$lib/utils/id';
	import { nowIso } from '$lib/utils/date';
	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import LoreCard from '$lib/components/lore/LoreCard.svelte';

	const storyId = $derived(page.params.storyId as string);

	const groups = $derived.by(() => {
		const byCategory = new Map<string, typeof $lore>();
		for (const entry of $lore) {
			const category = entry.category.trim() || 'Uncategorized';
			byCategory.set(category, [...(byCategory.get(category) ?? []), entry]);
		}
		return [...byCategory.entries()].sort(([a], [b]) => a.localeCompare(b));
	});

	let showCreate = $state(false);
	let title = $state('');
	let category = $state('');
	let scope = $state<'book' | 'series'>('book');

	function openCreate() {
		title = '';
		category = '';
		scope = 'book';
		showCreate = true;
	}

	async function submitCreate(e: SubmitEvent) {
		e.preventDefault();
		if (!title.trim()) return;
		const timestamp = nowIso();
		const shareAcrossSeries = scope === 'series' && $activeStory?.seriesId;
		const entry = {
			id: newId(),
			storyId: shareAcrossSeries ? undefined : storyId,
			seriesId: shareAcrossSeries ? $activeStory!.seriesId : undefined,
			title: title.trim(),
			category: category.trim(),
			content: '',
			createdAt: timestamp,
			updatedAt: timestamp
		};
		try {
			await saveLoreEntry(entry);
			showCreate = false;
			goto(resolve('/stories/[storyId]/lore/[loreId]', { storyId, loreId: entry.id }));
		} catch (err) {
			showSaveError(`lore entry "${entry.title}" (id: ${entry.id})`, err);
		}
	}
</script>

<svelte:head><title>Lore</title></svelte:head>

<div class="mb-6 flex items-center justify-between">
	<h1 class="font-serif text-3xl">Lore</h1>
	<Button onclick={openCreate}>+ New Entry</Button>
</div>

{#if $lore.length === 0}
	<EmptyState
		title="No lore entries yet"
		description="Capture the magic systems, history, factions, and other world-building details."
	>
		{#snippet action()}
			<Button onclick={openCreate}>+ New Entry</Button>
		{/snippet}
	</EmptyState>
{:else}
	<div class="flex flex-col gap-8">
		{#each groups as [category, entries] (category)}
			<div>
				<h2 class="mb-3 text-xs font-medium tracking-wide text-text-secondary uppercase">
					{category}
				</h2>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each entries as entry (entry.id)}
						<LoreCard {entry} {storyId} />
					{/each}
				</div>
			</div>
		{/each}
	</div>
{/if}

{#if showCreate}
	<Modal title="New Lore Entry" onClose={() => (showCreate = false)}>
		<form class="flex flex-col gap-4" onsubmit={submitCreate}>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Title</span>
				<input
					bind:value={title}
					required
					class="rounded-md border border-border bg-surface px-3 py-2"
					placeholder="The Ashveil Accord"
				/>
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Category</span>
				<input
					bind:value={category}
					class="rounded-md border border-border bg-surface px-3 py-2"
					placeholder="Magic System, Factions, History..."
				/>
			</label>
			{#if $activeStory?.seriesId}
				<div class="flex flex-col gap-1 text-sm">
					<span class="text-text-secondary">Appears in</span>
					<div class="flex gap-4">
						<label class="flex items-center gap-2">
							<input type="radio" bind:group={scope} value="book" />
							This book only
						</label>
						<label class="flex items-center gap-2">
							<input type="radio" bind:group={scope} value="series" />
							Whole series
						</label>
					</div>
				</div>
			{/if}
			<div class="mt-2 flex justify-end gap-2">
				<Button variant="secondary" onclick={() => (showCreate = false)}>Cancel</Button>
				<Button type="submit">Create Entry</Button>
			</div>
		</form>
	</Modal>
{/if}
