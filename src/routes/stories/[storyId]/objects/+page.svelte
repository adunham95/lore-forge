<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { objects, saveObject } from '$lib/stores/objects';
	import { activeStory } from '$lib/stores/stories';
	import { byUpdatedDesc } from '$lib/utils/sort';
	import { newId } from '$lib/utils/id';
	import { nowIso } from '$lib/utils/date';
	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import ObjectCard from '$lib/components/object/ObjectCard.svelte';

	const storyId = $derived(page.params.storyId as string);
	let sortedObjects = $derived(byUpdatedDesc($objects));

	let showCreate = $state(false);
	let name = $state('');
	let type = $state('');
	let description = $state('');
	let scope = $state<'book' | 'series'>('book');

	function openCreate() {
		name = '';
		type = '';
		description = '';
		scope = 'book';
		showCreate = true;
	}

	async function submitCreate(e: SubmitEvent) {
		e.preventDefault();
		if (!name.trim()) return;
		const timestamp = nowIso();
		const shareAcrossSeries = scope === 'series' && $activeStory?.seriesId;
		const object = {
			id: newId(),
			storyId: shareAcrossSeries ? undefined : storyId,
			seriesId: shareAcrossSeries ? $activeStory!.seriesId : undefined,
			name: name.trim(),
			type: type.trim(),
			description: description.trim(),
			notes: '',
			createdAt: timestamp,
			updatedAt: timestamp
		};
		await saveObject(object);
		showCreate = false;
		goto(resolve('/stories/[storyId]/objects/[objectId]', { storyId, objectId: object.id }));
	}
</script>

<svelte:head><title>Objects</title></svelte:head>

<div class="mb-6 flex items-center justify-between">
	<h1 class="font-serif text-3xl">Objects</h1>
	<Button onclick={openCreate}>+ New Object</Button>
</div>

{#if sortedObjects.length === 0}
	<EmptyState
		title="No objects yet"
		description="Track the ships, weapons, artifacts, and other key items in your story's world."
	>
		{#snippet action()}
			<Button onclick={openCreate}>+ New Object</Button>
		{/snippet}
	</EmptyState>
{:else}
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each sortedObjects as object (object.id)}
			<ObjectCard {object} {storyId} />
		{/each}
	</div>
{/if}

{#if showCreate}
	<Modal title="New Object" onClose={() => (showCreate = false)}>
		<form class="flex flex-col gap-4" onsubmit={submitCreate}>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Name</span>
				<input
					bind:value={name}
					required
					class="rounded-md border border-border bg-surface px-3 py-2"
					placeholder="The Kestrel"
				/>
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Type</span>
				<input
					bind:value={type}
					class="rounded-md border border-border bg-surface px-3 py-2"
					placeholder="Ship, Weapon, Artifact..."
				/>
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Description</span>
				<textarea
					bind:value={description}
					rows="3"
					class="rounded-md border border-border bg-surface px-3 py-2"
					placeholder="A short summary of this object."></textarea>
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
				<Button type="submit">Create Object</Button>
			</div>
		</form>
	</Modal>
{/if}
