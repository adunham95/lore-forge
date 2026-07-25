<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { writersBlockEntries, loadWritersBlockEntries, saveWritersBlockEntry } from '$lib/stores/writersBlock';
	import { stories, loadStories } from '$lib/stores/stories';
	import { showSaveError } from '$lib/stores/toast';
	import { byUpdatedDesc } from '$lib/utils/sort';
	import { newId } from '$lib/utils/id';
	import { nowIso } from '$lib/utils/date';
	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import WritersBlockCard from '$lib/components/writers-block/WritersBlockCard.svelte';

	const sorted = $derived(byUpdatedDesc($writersBlockEntries));

	let showCreate = $state(false);
	let title = $state('');

	onMount(() => {
		loadWritersBlockEntries();
		loadStories();
	});

	function openCreate() {
		title = '';
		showCreate = true;
	}

	async function submitCreate(e: SubmitEvent) {
		e.preventDefault();
		if (!title.trim()) return;
		const timestamp = nowIso();
		const entry = {
			id: newId(),
			title: title.trim(),
			content: '',
			characterIds: [],
			createdAt: timestamp,
			updatedAt: timestamp
		};
		try {
			await saveWritersBlockEntry(entry);
			showCreate = false;
			goto(resolve('/writers-block/[entryId]', { entryId: entry.id }));
		} catch (err) {
			showSaveError(`writers block entry "${entry.title}" (id: ${entry.id})`, err);
		}
	}
</script>

<svelte:head><title>Writers Block</title></svelte:head>

<div class="mx-auto max-w-5xl px-6 py-10">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="font-serif text-3xl">Writers Block</h1>
			<p class="text-sm text-text-secondary">
				A freeform dump for whatever's on your mind — tie it to a story, or don't.
			</p>
		</div>
		<Button onclick={openCreate}>+ New Entry</Button>
	</div>

	{#if sorted.length === 0}
		<EmptyState
			title="Nothing here yet"
			description="Start writing — you can tie it to a story and its characters later, or leave it freeform."
		>
			{#snippet action()}
				<Button onclick={openCreate}>+ New Entry</Button>
			{/snippet}
		</EmptyState>
	{:else}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each sorted as entry (entry.id)}
				<WritersBlockCard {entry} story={$stories.find((s) => s.id === entry.storyId)} />
			{/each}
		</div>
	{/if}
</div>

{#if showCreate}
	<Modal title="New Writers Block Entry" onClose={() => (showCreate = false)}>
		<form class="flex flex-col gap-4" onsubmit={submitCreate}>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Title</span>
				<textarea
					bind:value={title}
					required
					class="rounded-md border border-border bg-surface px-3 py-2"
					placeholder="A late-night thought about the ending..."></textarea>
			</label>
			<div class="mt-2 flex justify-end gap-2">
				<Button variant="secondary" onclick={() => (showCreate = false)}>Cancel</Button>
				<Button type="submit">Create Entry</Button>
			</div>
		</form>
	</Modal>
{/if}
