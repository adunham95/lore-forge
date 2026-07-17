<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { locations, saveLocation } from '$lib/stores/locations';
	import { byUpdatedDesc } from '$lib/utils/sort';
	import { newId } from '$lib/utils/id';
	import { nowIso } from '$lib/utils/date';
	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import LocationCard from '$lib/components/location/LocationCard.svelte';

	const storyId = $derived(page.params.storyId as string);
	let sortedLocations = $derived(byUpdatedDesc($locations));

	let showCreate = $state(false);
	let name = $state('');
	let type = $state('');
	let description = $state('');

	function openCreate() {
		name = '';
		type = '';
		description = '';
		showCreate = true;
	}

	async function submitCreate(e: SubmitEvent) {
		e.preventDefault();
		if (!name.trim()) return;
		const timestamp = nowIso();
		const location = {
			id: newId(),
			storyId,
			name: name.trim(),
			type: type.trim(),
			description: description.trim(),
			notes: '',
			createdAt: timestamp,
			updatedAt: timestamp
		};
		await saveLocation(location);
		showCreate = false;
		goto(
			resolve('/stories/[storyId]/locations/[locationId]', { storyId, locationId: location.id })
		);
	}
</script>

<svelte:head><title>Locations</title></svelte:head>

<div class="mb-6 flex items-center justify-between">
	<h1 class="font-serif text-3xl">Locations</h1>
	<Button onclick={openCreate}>+ New Location</Button>
</div>

{#if sortedLocations.length === 0}
	<EmptyState
		title="No locations yet"
		description="Add the places your story's world takes place in."
	>
		{#snippet action()}
			<Button onclick={openCreate}>+ New Location</Button>
		{/snippet}
	</EmptyState>
{:else}
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each sortedLocations as location (location.id)}
			<LocationCard {location} />
		{/each}
	</div>
{/if}

{#if showCreate}
	<Modal title="New Location" onClose={() => (showCreate = false)}>
		<form class="flex flex-col gap-4" onsubmit={submitCreate}>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Name</span>
				<input
					bind:value={name}
					required
					class="rounded-md border border-border bg-surface px-3 py-2"
					placeholder="The Sunken Library"
				/>
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Type</span>
				<input
					bind:value={type}
					class="rounded-md border border-border bg-surface px-3 py-2"
					placeholder="City, Forest, Dungeon..."
				/>
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-text-secondary">Description</span>
				<textarea
					bind:value={description}
					rows="3"
					class="rounded-md border border-border bg-surface px-3 py-2"
					placeholder="A short summary of this place."></textarea>
			</label>
			<div class="mt-2 flex justify-end gap-2">
				<Button variant="secondary" onclick={() => (showCreate = false)}>Cancel</Button>
				<Button type="submit">Create Location</Button>
			</div>
		</form>
	</Modal>
{/if}
