<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { lore, saveLoreEntry } from '$lib/stores/lore';
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

	function openCreate() {
		title = '';
		category = '';
		showCreate = true;
	}

	async function submitCreate(e: SubmitEvent) {
		e.preventDefault();
		if (!title.trim()) return;
		const timestamp = nowIso();
		const entry = {
			id: newId(),
			storyId,
			title: title.trim(),
			category: category.trim(),
			content: '',
			createdAt: timestamp,
			updatedAt: timestamp
		};
		await saveLoreEntry(entry);
		showCreate = false;
		goto(resolve('/stories/[storyId]/lore/[loreId]', { storyId, loreId: entry.id }));
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
						<LoreCard {entry} />
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
			<div class="mt-2 flex justify-end gap-2">
				<Button variant="secondary" onclick={() => (showCreate = false)}>Cancel</Button>
				<Button type="submit">Create Entry</Button>
			</div>
		</form>
	</Modal>
{/if}
